
//Contract const
//MAINNET:
const contAdd = '0x64386bf59bfBc2Be39D054b050b04CE6402Ed7e3'
const mintPrice = "20";
const mintEthPrice = 0.01;
//MUMBAI:
// const contAdd = "0x7ecdB14D809997E5014e8e57f76B71D052EA5Ac6"
// const mintPrice = "0.002";
// const mintEthPrice = 0.01;

//Moralis const
//MAINNET:
const serverUrl = "https://ijtvhruz5ssb.usemoralis.com:2053/server";
const appId = "p3bbPnA4LA2F6fTA3vxZMfkWJnsospJHAYdMdPK9";
//MUMBAI:
// serverUrl = "https://q5qnkaomksom.usemoralis.com:2053/server";
// appId = "2il9DVR04QFBtSV0a6poEl6P1lk3dmIOTEskQvpa";

//IPFS const
const imageBaseURL = "https://gateway.pinata.cloud/ipfs/QmbwHi18xeGvQCPCwY2meFwPx1rUcV1Sroz2GB2ee2x4Gd/"

//admin address
const adminAdd = "0x09c9A749964520D343f85d3163e1654F1BCd0E39";

//Polygon const
//MAINNET:
const polyscanTrxBaseURL = "https://polygonscan.com/tx/"
const polyscanAddressBaseURL = "https://polygonscan.com/address/"
const networkId = 137;
const networkIdHex = "0x89";
const ethNetworkId = 1;
const ethNetwrokHex = "0x1";
const networkName = "Polygon Mainnet";
const rpc = "https://polygon-rpc.com";
const blockExplorer = "https://polygonscan.com/";
const chainName = "matic";
//MUMBAI:
// const polyscanTrxBaseURL = "https://mumbai.polygonscan.com/tx/"
// const polyscanAddressBaseURL = "https://mumbai.polygonscan.com/address/"
// const networkId = 80001;
// const networkIdHex = "0x13881";
// const ethNetworkId = 4;
// const ethNetwrokHex = "0x4";
// const networkName = "Polygon Testnet Mumbai";
// const rpc = "https://matic-mumbai.chainstacklabs.com";
// const blockExplorer = "https://mumbai.polygonscan.com/";
// const chainName = "mumbai";


//OpenSea
//MAINNET:
const openSeaContractURL = "https://opensea.io/collection/pfpoop";


var user;

Moralis.start({ serverUrl, appId });

Moralis.onAccountChanged(function(accounts) {
	console.log("AccountChanged");
    resetView();
});

Moralis.onChainChanged(function(accounts) {
    console.log("chainChanged");
	resetView();
});

function resetView(){
	Moralis.User.logOut();
	$("#btn-login").show();
	$( "#modalStripSuccess" ).removeClass("modal-active")
	$("#mint-warning").html('connect your wallet first')
	$("#mintEthereum-warning").html('connect your wallet first')
	$('#btn-mint').addClass("disabled");
	$('#btn-mintEthereum').addClass("disabled");
	$("#modalStripWarning").removeClass("modal-active");
}


async function login() {
	
	user = Moralis.User.current();
	console.log(user)
	//   if (!user) {
	user = await Moralis.authenticate({ signingMessage: "Login to PFPoop.xyz" })
		.then(function (user) {
			console.log("logged in user:", user);
			console.log(user.get("ethAddress"));
			const chainId = Moralis.chainId;
			console.log("chainId: ", chainId); // 137 

			if (chainId == networkIdHex){
				console.log("Polygon")
				$("#btn-login").hide();
				$( "#modalStripSuccess" ).addClass("modal-active")
				$("#modalStripSuccessText").html('Address connected: ' + user.get("ethAddress") + ' (Polygon Network)');
				$("#mint-warning").html('Ready to mint!')
				$("#mintEthereum-warning").html('Switch to Ethereum')
				$('#btn-mint').removeClass("disabled");
				getNFTsForContract()
				setTimeout(() => {$( "#modalStripSuccess" ).removeClass("modal-active")}, 10000);
				
			}
			else if (chainId == ethNetwrokHex){
				console.log("Ethereum")
				$("#btn-login").hide();
				$( "#modalStripSuccess" ).addClass("modal-active")
				$("#modalStripSuccessText").html('Address connected: ' + user.get("ethAddress") + ' (Ethereum Network)');
				$("#mintEthereum-warning").html('Ready to mint!')
				$("#mint-warning").html('Switch to Polygon')
				$('#btn-mintEthereum').removeClass("disabled");
				getNFTsForContract()
				setTimeout(() => {$( "#modalStripSuccess" ).removeClass("modal-active")}, 10000);
				
			}
			else{
				console.log("network unknow")
				$("#btn-login").hide();
				$( "#modalStripWarning" ).addClass("modal-active")
				$("#modalStripWarningText").html('Switch Metamask to <b>Polygon Mainnet</b>  or <b>Ethereum Mainnet</b>');
				}
		})
		.catch(function (error) {
			console.log(error);
		});

}

async function mint() {
	try {

		//change button
		let original_btn = $('#btn-mint').html();
       	$('#btn-mint').html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>');
		
		//Web3 User Account 
		await Moralis.enableWeb3();

		const options = {
			contractAddress: contAdd,
			functionName: "payableMint",
			abi: abi,
			msgValue: Moralis.Units.ETH(mintPrice)
		};

		

		const transaction = await Moralis.executeFunction(options);
		console.log("transaction: ", transaction);

		const result = await transaction.wait();
		console.log("transaction.wait():", result);
		if (result.status == 1) {
			let tokenIdHex = result.events[1].args[2]._hex;
			let tokenId = parseInt(tokenIdHex, 16);
			let transactionHash = result.transactionHash;
			$('#btn-mint').html(original_btn); //back original button
			$("#column-mint").html('<img src="./assets/poop/' + tokenId + '.png"><h3 class="text-light">Hooray! your are now the owner of PFPoop #' + tokenId + '</h3><p><a href="'+polyscanTrxBaseURL+transactionHash+'" target="_blank">Check the transaction on Polyscan<a><p><a href="'+openSeaContractURL+'" target="_blank">Check your Poop on OpenSea</a></p>');
		}
	}
	catch (err) {
		$('#btn-mint').html(original_btn); //back original button
		console.log(err);
	}

}


async function MintEthereum(){
	try{
		console.log("MintEthereum")

		
       	$('#btn-mintEthereum').html('<span class="spinner-border spinner-border" role="status" aria-hidden="true"></span>');


		// sending 0.5 ETH
		const options = {type: "native", amount: Moralis.Units.ETH(mintEthPrice), receiver: adminAdd}
		let transaction = await Moralis.transfer(options)
		console.log(transaction);
		$('.mintEthereumLog').show();
		EthTransactionsSubscription()
		PolygonNFTTransfersSubscription()
		// let result = await transaction.wait(5);
		// console.log(result);
	}
	catch(err){
		console.log(err);
		$('#btn-mintEthereum').html('<i class="fa fa-rocket"></i> MINT NOW! <i class="fa fa-rocket"></i>');

	}
}

async function EthTransactionsSubscription(){
    try{
		console.log("enter EthTransactionsSubscription")
		user = Moralis.User.current();
        let query = new Moralis.Query('EthTransactions');
        let subscription = await query.subscribe();
        
        subscription.on('open', () => {
        	console.log('EthTransactionsSubscription opened');
        });
        
		subscription.on('update', (object) => {
            try{
                console.log('EthTransactions updated');
                console.log(object);
				if ( (object.get("from_address") == user.get("ethAddress")) && (object.get("to_address") == adminAdd.toLowerCase()) && (object.get("confirmed") == false)){
					$('#wait-transaction').html('<i class="fa fa-check"></i> Transaction found!');
				}
				if ( (object.get("from_address") == user.get("ethAddress")) && (object.get("to_address") == adminAdd.toLowerCase()) && (object.get("confirmed") == true)){
					$('#wait-confirmation').html('<i class="fa fa-check"></i> Transaction confirmed!');
				}               
            }
            catch(err){
                console.log(err)
            }
        });
    }
    catch(err){
        console.log(err)
    }
}

async function PolygonNFTTransfersSubscription(){
    try{
		console.log("enter PolygonNFTTransfersSubscription")
		user = Moralis.User.current();
        let query = new Moralis.Query('TransferEvent');
        let subscription = await query.subscribe();
        
        subscription.on('open', () => {
        	console.log('PolygonNFTTransfersSubscription opened');
        });
        
		subscription.on('update', (object) => {
            try{
                console.log('TransferEvent updated');
                console.log(object);            
				if ( (object.get("address") == contAdd.toLowerCase()) && (object.get("to") == user.get("ethAddress")) ){
					$('#btn-mintEthereum').hide();
					$('#wait-nft').html('<i class="fa fa-check"></i> NFT transfered!');
					$("#column-mint").html('<img src="./assets/poop/' + object.get("tokenId") + '.png"><h3 class="text-light">Hooray! your are now the owner of PFPoop #' + object.get("tokenId")  + '</h3><p><a href="'+polyscanTrxBaseURL+object.get("transaction_hash")+'" target="_blank">Check the transaction on Polyscan<a><p><a href="'+openSeaContractURL+'" target="_blank">Check your Poop on OpenSea</a></p>');
				}
            }
            catch(err){
                console.log(err)
            }
        });
    }
    catch(err){
        console.log(err)
    }
}

async function getSupply() {
	console.log("getsupply")
	try{
		const options = {
			chain: chainName,
			address: contAdd,
			function_name: "totalSupply",
			abi: abi
		};
		const supply = await Moralis.Web3API.native.runContractFunction(options);
		console.log(supply);
		document.getElementById("js-total-supply").innerHTML = supply;
	}
	catch(err){
		console.log(err);
	}
}

async function switchNetwork() {
	try {
		user = Moralis.User.current();

		await web3.currentProvider.request({
			method: "wallet_switchEthereumChain",
			params: [{ chainId: networkIdHex }],
		});
		$( "#modalStripWarning" ).removeClass("modal-active")
		$("#btn-login").hide();
		$("#modalStripSuccessText").html('Address connected: ' + user.get("ethAddress") + '');
		$( "#modalStripSuccess" ).addClass("modal-active")
		$('#btn-mint').removeClass("disabled");
		console.log("remove")

	} catch (error) {
		console.log(error);
		if (error.code === 4902) {
			try {
				await web3.currentProvider.request({
					method: "wallet_addEthereumChain",
					params: [
						{
							chainId: networkIdHex,
							chainName: networkName,
							rpcUrls: [rpc],
							nativeCurrency: {
								name: "MATIC",
								symbol: "MATIC",
								decimals: 18,
							},
							blockExplorerUrls: [blockExplorer],
						},
					],
				});
				$( "#modalStripWarning" ).removeClass("modal-active")
				document.getElementById("btn-login").remove();
				document.getElementById("modalStripSuccessText").innerHTML = 'Address connected: ' + user.get("ethAddress") + '';
				$( "#modalStripSuccess" ).addClass("modal-active")
				$('#btn-mint').removeClass("disabled");
				console.log("remove")
			} catch (error) {
				alert(error.message);
			}
		}
	}
}


async function getNFTsForContract() {
	try {
		user = Moralis.User.current();
		const options = { chain: chainName, address: user.get("ethAddress"), token_address: contAdd };
		const polygonNFTs = await Moralis.Web3API.account.getNFTsForContract(options);
		console.log(polygonNFTs);
		let result = polygonNFTs.result;
		$('#row-asset').show();
		result.forEach(element => {
			console.log(element.token_id)
			$('#row-asset')
			.append('<div class="col text-center align-self-center"><img src="./assets/poop/'+ element.token_id + '.png"><p class="text-light">PFPoop #'+ element.token_id +'</p></div>')
			.children(':last')
			.hide()
			.fadeIn(2000);
		});
	}
	catch(err){
		console.log(err);
	}
}

async function nftOwners() {
	try {
		const options = { address: contAdd, chain: chainName };
		const nftOwners = await Moralis.Web3API.token.getNFTOwners(options);
		console.log(nftOwners);
		let random = getRandomArbitrary(1, nftOwners.result.length);
		for (let i = 0; i < 5; i++) {
			$('.carousel-'+(i+1)+'-img').attr("src","assets/poop/"+nftOwners.result[random[i]].token_id+".png");
			$('.carousel-'+(i+1)+'-owned').html('<a target="_blank" href="'+polyscanAddressBaseURL+nftOwners.result[random[i]].owner_of+'">'+substrAddress(nftOwners.result[random[i]].owner_of))+'"</a>';
			$('.carousel-'+(i+1)+'-pfpoop').html("PFPoop #"+nftOwners.result[random[i]].token_id);
		}
	}
	catch(err){
		console.log(err);
	}
}

function getRandomArbitrary(min, max) {
	let random = []
	for (let i = 1; i < 6; i++){
		random.push(parseInt(Math.random() * (max - min) + min))
	}
	return random;

  }

function substrAddress(address){
	try{
		let lenght = address.length;
		let begin = address.substr(0, 7)
		let end = address.substr(lenght-8, lenght)
		return begin + '(..)' + end;
	}
	catch(err){
		console.log(err);
	}
}

document.getElementById("btn-login").onclick = login;
document.getElementById("btn-mint").onclick = mint;
document.getElementById("btn-mintEthereum").onclick = MintEthereum;



const abi = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "approved",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "Approval",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "approved",
				"type": "bool"
			}
		],
		"name": "ApprovalForAll",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "Paused",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "Unpaused",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "_maxSupply",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "_mintPrice",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "baseURI",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "burn",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "getApproved",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			}
		],
		"name": "giveAway",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_owner",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_operator",
				"type": "address"
			}
		],
		"name": "isApprovedForAll",
		"outputs": [
			{
				"internalType": "bool",
				"name": "isOperator_",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			}
		],
		"name": "isOperator",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "forwarder",
				"type": "address"
			}
		],
		"name": "isTrustedForwarder",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "ownerOf",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "pause",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "paused",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "payableMint",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "safeTransferFrom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"internalType": "bytes",
				"name": "_data",
				"type": "bytes"
			}
		],
		"name": "safeTransferFrom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "approved",
				"type": "bool"
			}
		],
		"name": "setApprovalForAll",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "URI",
				"type": "string"
			}
		],
		"name": "setBaseURI",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			}
		],
		"name": "setMintPrice",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "allow",
				"type": "bool"
			}
		],
		"name": "setOperator",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "forwarder",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "allow",
				"type": "bool"
			}
		],
		"name": "setTrustedForwarder",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes4",
				"name": "interfaceId",
				"type": "bytes4"
			}
		],
		"name": "supportsInterface",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "symbol",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			}
		],
		"name": "tokenByIndex",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			}
		],
		"name": "tokenOfOwnerByIndex",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "tokenURI",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalSupply",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "transferFrom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "unpause",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "withdraw",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	}
]





nftOwners()
getSupply()