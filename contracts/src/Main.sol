// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

import "./Collection.sol";
import "./Booster.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract Main is Ownable{

  // ---------------------- Variables ----------------------
  uint private collectionCounter;
  mapping(uint => Collection) private collections;
  Booster private boosters = new Booster();

  constructor() Ownable(msg.sender) {
    collectionCounter = 0;
  }

  // ---------------------- Events ----------------------
  event CollectionCreated(string collectionName, uint cardCount, uint indexed collectionId);
  // event CardMinted(address indexed to, uint tokenId, string tokenURI, uint indexed collectionId);
  // event BoosterCreated(uint indexed boosterId);
  // ---------------------- Creation ----------------------

  // Create a new collection with the given name and card count
  function createCollection(string calldata _name, string calldata _collectionURI, uint _cardCount) external onlyOwner {
    collections[collectionCounter] = new Collection(_name, _collectionURI, _cardCount);
    emit CollectionCreated(_name, _cardCount, collectionCounter);
    collectionCounter++;
  }

  function createBooster(address _to, string calldata _boosterName, uint _collectionId, uint[] calldata _cardIds) external onlyOwner {
    boosters.mintBooster(_to, _boosterName, _collectionId,  _cardIds);
    // emit BoosterCreated(boosters.tokenIdCounter()-1);
  }

    // Mint a new card in the collection with the given collection ID
  function mintNFTCard(address _to, string calldata _tokenURI, uint _collectionId) external onlyOwner {
    Collection collection = collections[_collectionId];
    uint newtokenId = collection.mintCard(_to, _tokenURI);

    // emit CardMinted(_to, newtokenId, _tokenURI, _collectionId);
  }

  // ---------------------- Functions ----------------------


  // ---------------------- Transfers ----------------------

  function sellBooster(address _to, uint _boosterId) payable external{
    boosters.sellBooster(_to,_boosterId);
    payable(owner()).transfer(address(this).balance);
  } 

  function sellCard(address _to, uint cid, uint caid) payable external {
    address o= collections[cid].getOwner(caid);
    collections[cid].sellCard(_to,caid);
    payable(o).transfer(address(this).balance);
  }

  function listCard(uint cid, uint caid, uint p) external onlyOwner {
    collections[cid].listCard(caid,p);
  }

  // function getState(address _to, uint _boosterId) external view returns (string memory) {
  //   return boosters.getState(owner(),_boosterId);
  // }

  // ---------------------- Views ----------------------

  function getCollections() external view returns (string memory) {
    string memory ret = "{";
    for (uint i=0;i<collectionCounter;i++) {
      ret = string(abi.encodePacked(ret,"\"",Strings.toString(i),"\":",collections[i].colDesc()));
      if (i!=collectionCounter-1) {
        ret = string(abi.encodePacked(ret,","));
      }
    }
    ret=string(abi.encodePacked(ret,"}"));
    return ret;
  }

  function getBoosters() external view returns (string memory) {
    // string memory ret = "{";
    // for (uint i=0;i<boosters.tokenIdCounter();i++) {
    //   string memory bn = boosters.getBoosterName(i); 
    //   ret = string(abi.encodePacked(ret,"\"",Strings.toString(i),"\":{\"name\":\"",bn,"\",\"cards\":\"",boosters.getBoosterCards(i),"\",\"collection\":\"",boosters.getBoosterCollection(i),"\"}"));
    //   if (i!=boosters.tokenIdCounter()-1) {
    //     ret = string(abi.encodePacked(ret,","));
    //   }
    // }
    // ret=string(abi.encodePacked(ret,"}"));
    return boosters.getBoosters();
  }

  function getCardsByCollection(uint colId) external view returns (string memory) {
    string memory ret = "{";
    string memory cardURI = "";
    for (uint i=0;i<collections[colId].tokenIdCounter();i++) {
      cardURI = collections[colId].getCardById(i);
      ret = string(abi.encodePacked(ret,"\"",Strings.toString(i),"\":{\"uri\":\"",cardURI,"\"}"));
      if (i!=collections[colId].tokenIdCounter()-1) {
        ret = string(abi.encodePacked(ret,","));
      }
    }
    ret=string(abi.encodePacked(ret,"}"));
    return ret; 
  }

}