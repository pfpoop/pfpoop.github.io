//Contract const
//MAINNET:
const contAdd = '0x64386bf59bfBc2Be39D054b050b04CE6402Ed7e3'
const mintPrice = "20";
//MUMBAI:
// const contAdd = "0x7ecdB14D809997E5014e8e57f76B71D052EA5Ac6"
// const mintPrice = "0.002";

//Moralis const
//MAINNET:
const serverUrl = "https://dcqxf0unkygd.usemoralis.com:2053/server";
const appId = "l5z3JOEtDYFx0W74Wr3lolMKSrPJTdGfR8citW3T";
//MUMBAI:
// serverUrl = "https://hwxrp0nvfmvt.usemoralis.com:2053/server";
// appId = "eJ8a8bFmASWX3vfjkowG2jDoJxHEIINVyznqzCKa";

//IPFS const
const imageBaseURL = "https://gateway.pinata.cloud/ipfs/QmbwHi18xeGvQCPCwY2meFwPx1rUcV1Sroz2GB2ee2x4Gd/"

//Polygon const
//MAINNET:
const polyscanTrxBaseURL = "https://polygonscan.com/tx/"
const networkId = 137;
const networkIdHex = "0x89";
const networkName = "Polygon Mainnet";
const rpc = "https://polygon-rpc.com";
const blockExplorer = "https://polygonscan.com/";
const chainName = "matic";
//MUMBAI:
// const polyscanTrxBaseURL = "https://mumbai.polygonscan.com/tx/"
// const networkId = 80001;
// const networkIdHex = "0x13881";
// const networkName = "Polygon Testnet Mumbai";
// const rpc = "https://matic-mumbai.chainstacklabs.com";
// const blockExplorer = "https://mumbai.polygonscan.com/";
// const chainName = "mumbai";


//OpenSea
//MAINNET:
const openSeaContractURL = "https://opensea.io/collection/pfpoop";


var user;

Moralis.start({ serverUrl, appId });



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

			if (chainId != networkIdHex) {
				$( "#modalStripWarning" ).addClass("modal-active")
				document.getElementById("modalStripWarningText").innerHTML = 'Please switch Metamask to Polygon Mainnet <a class="switchNetwork m-l-10 btn btn-light" onclick="switchNetwork()">Switch network</a>';
			}
			else{
				$('#btn-mint').removeClass("disabled");
				$( "#modalStripSuccess" ).addClass("modal-active")
				document.getElementById("btn-login").remove();
				document.getElementById("modalStripSuccessText").innerHTML = 'Address connected: ' + user.get("ethAddress") + '';
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
			document.getElementById("column-mint").innerHTML = '<img src="'+ imageBaseURL + tokenId + '.png"><h3>Hooray! your are now the owner of PFPoop #' + tokenId + '</h3><p><a href="'+polyscanTrxBaseURL+transactionHash+'" target="_blank">Check the transaction on Polyscan<a><p><a href="'+openSeaContractURL+'" target="_blank">Check your Poop on OpenSea</a></p>'
		}
	}
	catch (err) {
		$('#btn-mint').html(original_btn); //back original button
		console.log(err);
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
		document.getElementById("btn-login").remove();
		document.getElementById("modalStripSuccessText").innerHTML = 'Address connected: ' + user.get("ethAddress") + '';
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

document.getElementById("btn-login").onclick = login;
document.getElementById("btn-mint").onclick = mint;





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





getSupply()


