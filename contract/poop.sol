// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract PFPoop is ERC721, ERC721Enumerable, ERC721URIStorage, Pausable, Ownable, ERC721Burnable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    mapping (address => bool) private _operators;
    mapping (address => bool) private _trustedForwarders;

    uint256 public _maxSupply = 999;
    uint256 public _mintPrice = 20000000000000000000; //20 MATIC

    string public baseURI = "https://gateway.pinata.cloud/ipfs/QmPpPPWX8f6BhLtQaQPz5Z9ca5cWoaGAqujzfWCbG9fp2f/";

    constructor() ERC721("PFPoop", "POOP") {
        _tokenIdCounter.increment();
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function setBaseURI(string memory URI) public onlyOwner {
        baseURI = URI;
    } 

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function giveAway(address to) public onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        require(tokenId <= _maxSupply, "no more supply available");
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, "");
    }

    function payableMint() public payable {
        uint256 tokenId = _tokenIdCounter.current();
        require(tokenId <= _maxSupply, "no more supply available");

        require(msg.value >= _mintPrice, "Not enough ETH : check price.");
        
        _tokenIdCounter.increment();
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, "");
    }

    function withdraw()  public payable onlyOwner{
        payable(msg.sender).transfer(address(this).balance);
    }

    function setMintPrice(uint256 price) public onlyOwner {
        _mintPrice = price;
    }



    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        whenNotPaused
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    // The following functions are overrides required by Solidity.

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return string(abi.encodePacked(super.tokenURI(tokenId), ".json"));
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }


    function isOperator(address operator) public view virtual returns (bool) {
        return _operators[operator];
    }

    function setOperator(address operator, bool allow) public onlyOwner{
        _operators[operator] = allow;
    }

    function isApprovedForAll(
        address _owner,
        address _operator
    ) public override view returns (bool isOperator_) {
        if(_operators[_operator]){   
            return true;
        } else{
            return ERC721.isApprovedForAll(_owner, _operator);
        }
    }




    function isTrustedForwarder(address forwarder) public view virtual returns (bool) {
        return _trustedForwarders[forwarder];
    }

    function setTrustedForwarder(address forwarder, bool allow) public onlyOwner {
        _trustedForwarders[forwarder] = allow;
    }

     function _msgSender() internal view virtual override returns (address sender) {
        if (isTrustedForwarder(msg.sender)) {
            assembly {
                sender := shr(96, calldataload(sub(calldatasize(), 20)))
            }
        } else {
            return super._msgSender();
        }
    }

    function _msgData() internal view virtual override returns (bytes calldata) {
        if (isTrustedForwarder(msg.sender)) {
            return msg.data[:msg.data.length - 20];
        } else {
            return super._msgData();
        }
    }

}