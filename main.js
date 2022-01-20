/* Moralis init code */

//Contract const
const contAdd = '0x64386bf59bfBc2Be39D054b050b04CE6402Ed7e3'
const mintPrice = "20";

//Moralis const
const serverUrl = "https://dcqxf0unkygd.usemoralis.com:2053/server";
const appId = "l5z3JOEtDYFx0W74Wr3lolMKSrPJTdGfR8citW3T";

//IPFS const
const imageBaseURL = "https://gateway.pinata.cloud/ipfs/QmbwHi18xeGvQCPCwY2meFwPx1rUcV1Sroz2GB2ee2x4Gd/"

//Polygon const
const polyscanTrxBaseURL = "https://polygonscan.com/tx/"
const networkId = 137;
const networkIdHex = "0x89";
const networkName = "Polygon Mainnet";
const rpc = "https://polygon-rpc.com";
const blockExplorer = "https://polygonscan.com/";
const chainName = "matic";

//Others
const openSeaContractURL = "https://opensea.io/collection/pfpoop";


Moralis.start({ serverUrl, appId });



async function login() {
	let user = Moralis.User.current();
	console.log(user)
	//   if (!user) {
	user = await Moralis.authenticate({ signingMessage: "Login to PFPoop.xyz" })
		.then(function (user) {
			console.log("logged in user:", user);
			console.log(user.get("ethAddress"));
			document.getElementById("image-login").remove();
			document.getElementById("column-login").innerHTML = '<div class="content has-text-centered is-size-4"><p style="word-wrap:break-word;">Address connected: ' + user.get("ethAddress") + '</p></div>';

			const chainId = Moralis.chainId;
			console.log("chainId: ", chainId); // 137 
			if (chainId != '0x89') {
				document.getElementById("column-login").innerHTML = '<div class="content has-text-centered is-size-4 has-text-danger"><p><a class="switchNetwork" onclick="switchNetwork()">Please switch Metamask on Polygon mainnet</a></p></div>';
			}
		})
		.catch(function (error) {
			console.log(error);
		});

}

async function mint() {
	try {
		//Web3 User Account 
		await Moralis.enableWeb3();

		const options = {
			contractAddress: contAdd,
			functionName: "payableMint",
			abi: abi,
			msgValue: Moralis.Units.ETH(mintPrice)
		};

		document.getElementById("image-mint").src = "./assets/pleasewait.gif";



		const transaction = await Moralis.executeFunction(options);
		console.log("transaction: ", transaction);

		const result = await transaction.wait();
		console.log("transaction.wait():", result);
		if (result.status == 1) {
			let tokenIdHex = result.events[1].args[2]._hex;
			let tokenId = parseInt(tokenIdHex, 16);
			let transactionHash = result.transactionHash;
			document.getElementById("column-mint").innerHTML = '<div class="column is-half"><div class="content has-text-centered is-size-4"><img src="'+ imageBaseURL + tokenId + '.png"><p>Hooray! your are now the owner of PFPoop #' + tokenId + '</p><p><a href="'+polyscanTrxBaseURL+transactionHash+'" target="_blank">Check the transaction on Polyscan<a><p><a href="'+openSeaContractURL+'" target="_blank">Check your Poop on OpenSea</a></p></div></div>'
		}
	}
	catch (err) {
		document.getElementById("image-mint").src = "./assets/mint_fire.gif";
		console.log(err);
		alert(err.data.message);
	}

}

async function getSupply() {
	console.log("getsupply")
	const options = {
		chain: chainName,
		address: contAdd,
		function_name: "totalSupply",
		abi: abi
	};
	const allowance = await Moralis.Web3API.native.runContractFunction(options);
	console.log(allowance);
	document.getElementById("js-total-supply").innerHTML = allowance;
}

async function switchNetwork() {
	try {
		await web3.currentProvider.request({
			method: "wallet_switchEthereumChain",
			params: [{ chainId: networkIdHex }],
		});
		document.getElementById("column-login").innerHTML = '<div class="content has-text-centered is-size-4"><p style="word-wrap:break-word;">Your are now connected on Polygon Mainnet!</p></div>';
	} catch (error) {
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
				document.getElementById("column-login").innerHTML = '<div class="content has-text-centered is-size-4"><p style="word-wrap:break-word;">Your are now connected on Polygon Mainnet!</p></div>';
			} catch (error) {
				alert(error.message);
			}
		}
	}
}

document.getElementById("btn-login").onclick = login;
document.getElementById("btn-mint").onclick = mint;
// document.getElementById("btn-switchNetwork").onclick = switchNetwork;

new snowflakeCursor();





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







function snowflakeCursor(options) {
	let hasWrapperEl = options && options.element
	let element = hasWrapperEl || document.body

	let possibleEmoji = ["❄️"]
	let width = window.innerWidth
	let height = window.innerHeight
	let cursor = { x: width / 2, y: width / 2 }
	let particles = []
	let canvas, context

	let canvImages = []

	function init() {
		canvas = document.createElement("canvas")
		context = canvas.getContext("2d")

		canvas.style.top = "0px"
		canvas.style.left = "0px"
		canvas.style.pointerEvents = "none"

		if (hasWrapperEl) {
			canvas.style.position = "absolute"
			element.appendChild(canvas)
			canvas.width = element.clientWidth
			canvas.height = element.clientHeight
		} else {
			canvas.style.position = "fixed"
			document.body.appendChild(canvas)
			canvas.width = width
			canvas.height = height
		}

		context.font = "12px serif"
		context.textBaseline = "middle"
		context.textAlign = "center"

		possibleEmoji.forEach((emoji) => {
			let measurements = context.measureText(emoji)
			let bgCanvas = document.createElement("canvas")
			let bgContext = bgCanvas.getContext("2d")

			bgCanvas.width = measurements.width
			bgCanvas.height = measurements.actualBoundingBoxAscent * 2

			bgContext.textAlign = "center"
			bgContext.font = "12px serif"
			bgContext.textBaseline = "middle"
			bgContext.fillText(
				emoji,
				bgCanvas.width / 2,
				measurements.actualBoundingBoxAscent
			)

			canvImages.push(bgCanvas)
		})

		bindEvents()
		loop()
	}

	// Bind events that are needed
	function bindEvents() {
		element.addEventListener("mousemove", onMouseMove)
		element.addEventListener("touchmove", onTouchMove)
		element.addEventListener("touchstart", onTouchMove)
		window.addEventListener("resize", onWindowResize)
	}

	function onWindowResize(e) {
		width = window.innerWidth
		height = window.innerHeight

		if (hasWrapperEl) {
			canvas.width = element.clientWidth
			canvas.height = element.clientHeight
		} else {
			canvas.width = width
			canvas.height = height
		}
	}

	function onTouchMove(e) {
		if (e.touches.length > 0) {
			for (let i = 0; i < e.touches.length; i++) {
				addParticle(
					e.touches[i].clientX,
					e.touches[i].clientY,
					canvImages[Math.floor(Math.random() * canvImages.length)]
				)
			}
		}
	}

	function onMouseMove(e) {
		if (hasWrapperEl) {
			const boundingRect = element.getBoundingClientRect()
			cursor.x = e.clientX - boundingRect.left
			cursor.y = e.clientY - boundingRect.top
		} else {
			cursor.x = e.clientX
			cursor.y = e.clientY
		}

		addParticle(
			cursor.x,
			cursor.y,
			canvImages[Math.floor(Math.random() * possibleEmoji.length)]
		)
	}

	function addParticle(x, y, img) {
		particles.push(new Particle(x, y, img))
	}

	function updateParticles() {
		context.clearRect(0, 0, width, height)

		// Update
		for (let i = 0; i < particles.length; i++) {
			particles[i].update(context)
		}

		// Remove dead particles
		for (let i = particles.length - 1; i >= 0; i--) {
			if (particles[i].lifeSpan < 0) {
				particles.splice(i, 1)
			}
		}
	}

	function loop() {
		updateParticles()
		requestAnimationFrame(loop)
	}

	/**
	 * Particles
	 */

	function Particle(x, y, canvasItem) {
		const lifeSpan = Math.floor(Math.random() * 60 + 80)
		this.initialLifeSpan = lifeSpan //
		this.lifeSpan = lifeSpan //ms
		this.velocity = {
			x: (Math.random() < 0.5 ? -1 : 1) * (Math.random() / 2),
			y: 1 + Math.random(),
		}
		this.position = { x: x, y: y }
		this.canv = canvasItem

		this.update = function (context) {
			this.position.x += this.velocity.x
			this.position.y += this.velocity.y
			this.lifeSpan--

			this.velocity.x += ((Math.random() < 0.5 ? -1 : 1) * 2) / 75
			this.velocity.y -= Math.random() / 300

			const scale = Math.max(this.lifeSpan / this.initialLifeSpan, 0)

			const degrees = 2 * this.lifeSpan
			const radians = degrees * 0.0174533 // not perfect but close enough

			context.translate(this.position.x, this.position.y)
			context.rotate(radians)

			context.drawImage(
				this.canv,
				(-this.canv.width / 2) * scale,
				-this.canv.height / 2,
				this.canv.width * scale,
				this.canv.height * scale
			)

			context.rotate(-radians)
			context.translate(-this.position.x, -this.position.y)
		}
	}

	init()
}



getSupply()


