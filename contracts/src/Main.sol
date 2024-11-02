// SPDX-License-Identifier: MIT
pragma solidity ^0.8;


import "./Collection.sol";

contract Main is Ownable{

  // ---------------------- Variables ----------------------
  uint private collectionCounter;
  mapping(uint => Collection) private collections;
  mapping(string => uint) private collectionName2Id;
  mapping(address => uint[]) private userTokens; // mapping of user addresses to their tokenIds.
  mapping(address => bool) private userExists; // to check if user exists
  mapping(uint => uint) tokenToCollection; // mapping of token id to collection id (so we can get card's metadata based on the collection id)
  mapping(string => uint) private collectionURI2Id;

  constructor() Ownable(msg.sender) {
    collectionCounter = 0;
  }

  address[] public users; // list of all users

  // ---------------------- Events ----------------------
  event CollectionCreated(address indexed collectionAddress, string collectionName, uint cardCount, uint indexed collectionId);
  event CardMinted(address indexed to, uint tokenId, string tokenURI, uint indexed collectionId);

  // ---------------------- Creation ----------------------

  // Create a new collection with the given name and card count
  function createCollection(string calldata _name, string calldata _collectionURI, uint _cardCount) external onlyOwner {
    require(_cardCount > 0, "Card count must be greater than 0");
    Collection newCollection = new Collection(_name, _collectionURI, _cardCount); 
    collections[collectionCounter] = newCollection;
    collectionName2Id[_name] = collectionCounter;
    collectionURI2Id[_collectionURI] = collectionCounter;
    emit CollectionCreated(address(newCollection), _name, _cardCount, collectionCounter);
    collectionCounter++;
  }

  function getCollectionIdFromName(string calldata collectionName) public view returns (uint) {
    return collectionName2Id[collectionName];
  }

  function getCollectionFromName(string calldata collectionName) public view returns (Collection) {
    uint cid=collectionName2Id[collectionName];
    return collections[cid];
  }

  function getCardsFromCollectionName(string calldata collectionName) public view returns (uint[] memory, string[] memory) {
    return getCollectionFromName(collectionName).getAllCards();
  }

  function getCollectionIdFromURI(string calldata name) external view returns (uint) {
    return collectionURI2Id[name];
  } 

   function getCollectionURIFromName(string calldata name) external view returns (string memory) {
    uint cid = getCollectionIdFromName(name);
    string memory ret = collections[cid].getCollectionURI();
    return ret;
  } 

  // ---------------------- Functions ----------------------

  // Mint a new card in the collection with the given collection ID
  function mintNFTCard(address _to, string calldata _tokenURI, uint _collectionId) external onlyOwner {
    require(_collectionId < collectionCounter, "Collection ID exceeds collection count");

    Collection collection = collections[_collectionId];
    uint newtokenId = collection.mintCard(_to, _tokenURI);

    tokenToCollection[newtokenId] = _collectionId;

    // add user to users list if not already added
    if (!userExists[_to]) {
      users.push(_to);
      userExists[_to] = true; 
    }
    // add tokenId to userTokens mapping
    userTokens[_to].push(newtokenId);

    emit CardMinted(_to, newtokenId, _tokenURI, _collectionId);
  }

  // get list of tokenids of a user
  function getUserTokens(address _user) internal view returns (uint[] memory) {
    return userTokens[_user];
  }

  // get all users
  function getUsers() external view returns (address[] memory) {
    return users;
  }

  // get card info (needed for displaying card in frontend)
  function getCard(uint _tokenId) internal view returns(Collection.Card memory) {
    uint collectionId = tokenToCollection[_tokenId];
    Collection collection = collections[collectionId];
    return collection.getCard(_tokenId);
   
  }
  // get cards of a user
  function getUserCards(address _user) external view returns (string[] memory) {
    uint[] memory tokenIds = getUserTokens(_user);
    string[] memory userCards = new string[](tokenIds.length);
    for(uint i=0; i< tokenIds.length; i++){
      userCards[i] = getCard(tokenIds[i]).tokenURI;
    }
    return userCards;
  }

  // get collection names (needed for displaying collection in frontend)
  function getCollectionNames() external view returns (string[] memory) {
    string[] memory collectionNames = new string[](collectionCounter);
    for (uint i = 0; i < collectionCounter; i++) {
      collectionNames[i] = collections[i].getCollectionName();
    }
    return collectionNames;
  }

  function getCollectionURIs() external view returns(string[] memory) {
    string[] memory ret = new string[](collectionCounter);
    for (uint i =0;i<collectionCounter;i++) {
      ret[i]=(collections[i].getCollectionURI());
    }
    return ret;
  }
}