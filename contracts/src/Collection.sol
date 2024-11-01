// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Collection is ERC721URIStorage, Ownable {
  string public collectionName;
  string public collectionURI;
  uint public cardCount;
  uint private tokenIdCounter;
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
  }
  // Mint a new card with the next available 
  //token ID (unique identifier for every nft card owned by the user) 
  //and token URI (metadata of the card like img and card no)
  
  function mintCard(address _to, string memory _tokenURI) external onlyOwner returns (uint) {
    require(tokenIdCounter < cardCount, "Token ID exceeds card count");
    uint newTokenId = tokenIdCounter;
    _mint(_to, tokenIdCounter);
    _setTokenURI(tokenIdCounter, _tokenURI);
    cards[newTokenId] = Card(newTokenId, _tokenURI);
    tokenIdCounter++;
    return newTokenId;
  }

  // get the no of cards minted
  function getMintedCardCount() external view returns (uint) {
      return tokenIdCounter;
  }

  // get the name of the collection
  function getCollectionName() external view returns (string memory) {
    return collectionName;
  }
  // get the no of cards of the collection
  function getCollectionCardCount() external view returns (uint) {
    return cardCount;
  }

  // 
  function getCard(uint _tokenId) external view returns (Card memory) {
    require(cards[_tokenId].tokenId == _tokenId, "Card does not exist");
    return cards[_tokenId];
  }

  function getCollectionURI() external view returns (string memory) {
    return collectionURI;
  }

  function getAllCards() external view returns (uint[] memory, string[] memory) {
    uint[]  memory allCardID= new uint[](tokenIdCounter);
    string[] memory allCardURI= new string[](tokenIdCounter);
    for (uint i=0;i<tokenIdCounter;i++) {
      allCardID[i]=cards[i].tokenId;
      allCardURI[i]=cards[i].tokenURI;
    }
    return (allCardID, allCardURI);
  }

}
