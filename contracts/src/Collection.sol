// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Collection is ERC721URIStorage, Ownable {
  string public collectionName;
  string public collectionURI;
  uint public cardCount;
  uint public tokenIdCounter;
  mapping(uint => Card) public cards; // mapping of token id to card


  constructor(string memory _name, string memory _collectionURI, uint _cardCount) ERC721(_name, "PNFT") Ownable(msg.sender)  {
    collectionName = _name;
    collectionURI = _collectionURI;
    cardCount = _cardCount;
    tokenIdCounter = 0;
  }

  struct Card{
    uint tokenId;
    string tokenURI;
    uint sale;
    uint price;
  }

  function getOwner(uint caid) external returns (address) {
    return ownerOf(caid);
  }
  // Mint a new card with the next available 
  //token ID (unique identifier for every nft card owned by the user) 
  //and token URI (metadata of the card like img and card no)
  
  function mintCard(address _to, string memory _tokenURI) external onlyOwner returns (uint) {
    _mint(_to, tokenIdCounter);
    cards[tokenIdCounter] = Card(tokenIdCounter, _tokenURI, 0, 0);
    tokenIdCounter++;
    return tokenIdCounter-1;
  }

  function listCard(uint id,uint p) external {
    cards[id].sale=1;cards[id].price=p;
  }

  function colDesc() external view returns (string memory) {
    return string(abi.encodePacked("{\"name\":\"",collectionName,"\",\"uri\":\"",collectionURI,"\",\"count\":\"",Strings.toString(cardCount),"\",\"current\":\"",Strings.toString(tokenIdCounter),"\"}"));
  }
  
  // function getAllCards() external view returns (uint[] memory, string[] memory) {
  //   uint[]  memory allCardID= new uint[](tokenIdCounter);
  //   string[] memory allCardURI= new string[](tokenIdCounter);
  //   for (uint i=0;i<tokenIdCounter;i++) {
  //     allCardID[i]=cards[i].tokenId;
  //     allCardURI[i]=cards[i].tokenURI;
  //   }
  //   return (allCardID, allCardURI);
  // }

  function getCardById(uint id) external view returns (string memory) {
    return string(abi.encodePacked(cards[id].tokenURI,"\", \"owner\":\"",Strings.toHexString(uint160(ownerOf(id)),20),"\",\"sale\": \"",Strings.toString(cards[id].sale),"\", \"price\":\"",Strings.toString(cards[id].price)));
    // return cards[id].tokenURI;
  }

  function sellCard(address _to, uint id) payable external {
    // if (b!=ownerOf(id)) {revert("unauthorized")}
    address oldOwner = ownerOf(id);
    payable(oldOwner).transfer(msg.value);
    _transfer(oldOwner,_to,id);
  }

}
