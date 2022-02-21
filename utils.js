function chainToNetwork(chainHex){
    switch(chainHex){
        case "0x89":
            return "Polygon Mainnet"
        case "0x13881":
            return "Polygon Mumbai Testnet"
        case "0x1":
            return "Ethereum Mainnet"
        case "0x3":
            return "Ethereum Ropsten Testnet"
        case "0x4":
            return "Ethereum Rinkeby Testnet"
        case "0x5":
            return "Ethereum Goerli Testnet"
        case "0x6":
            return "Ethereum Kovan Testnet"
        case "0x38":
            return "Binance Smart Chain Mainnet"
        case "0x61":
            return "Binance Smart Chain Testnet"
        case "0xa86a":
            return "Avalanche Mainnet"
        case "0xa869":
            return "Avalanche Testnet"
        case "0xfa":
            return "Fantom Mainnet"
        case "0x539":
            return "Local Dev Chain"        
    }
    //else
    return "Unknow: "+ chainHex
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

function getRandomArbitrary(min, max) {
	let random = []
	for (let i = 1; i < 6; i++){
		random.push(parseInt(Math.random() * (max - min) + min))
	}
	return random;

  }