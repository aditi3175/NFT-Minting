// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract MyNFT is ERC721, Ownable {
    using Strings for uint256;
    uint256 public tokencounter;
    string private baseURI;

    constructor() ERC721("MyNFT", "MNFT") Ownable(msg.sender) {
        tokencounter = 0;
        baseURI = "ipfs://QmVcio2y1UP7XdvaBhJkKWQT1bCKXXVeeyTVj1KMB9Mz5W/";
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function setBaseURI(string memory _newBaseURI) public onlyOwner {
        baseURI = _newBaseURI;
    }

    function mintNFT() public {
        tokencounter++;
        _safeMint(msg.sender, tokencounter);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
    ownerOf(tokenId); 
    string memory base = _baseURI();
    return string(abi.encodePacked(base, tokenId.toString(), ".json"));
}
}
