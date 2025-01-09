import React, {useEffect, useState, useRef, createRef } from 'react';
import { Accordion, Button, Card, Container, ListGroup, Col, Row, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers'
import { contracts } from '@/contracts.json'
import useWallet from '@/wallet/useWallet';
import styles from './styles.module.css'

const SERVER = "http://127.0.0.1:5001/"
// const isLoading = false
// const [collections, setCollections] = useState([]) 
// var collections = []

const owneraddr = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"

const Shop: React.FC = () => {
  const wallet = useWallet()
  const [collections, setCollections] = useState([])
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [selectedCollectionIdx, setSelectedCollectionIdx] = useState(null); 
  const [allBoosters, setBoosters] = useState([])
  const [selectedCollectionBoosters, setSelectedCollectionBoosters] = useState([])
  const [collectionCards, setCards] = useState([])
  const [userAccount,setUserAccount] = useState("")
  const [boughtCards,setBoughtCards] = useState([])
  const [showSell,setShowSell] = useState(false)

  const getCollections = async () => {
    const resp = await fetch(SERVER+"getCollections")
    const respJson = await resp.json()
    console.log(respJson)
    setCollections(Object.entries(respJson).map(o => o[1]))
  }

  const getCollectionCards = async (colId) => {
    const resp = await fetch(SERVER+"getCollectionCards?colId="+colId)
    const respJson = await resp.json()
    console.log(respJson)

    setCards(Object.entries(respJson).map(o => o[1]))
  }

  useEffect(() => {
    getCollections()
    // getWallet()
  },[])

  useEffect(() => {
    selectedCollectionIdx!=null ? getCollectionCards(selectedCollectionIdx) : null
  },[selectedCollection])


  return (
    <Container fluid className="d-flex" style={{ minHeight: '100vh' }}>
      <Row className="flex-grow-1 d-flex">
        {/* Users List - Sidebar */}
        
        <Col
          md={4}
          className="d-flex flex-column "
          style={{
            backgroundColor: '#f8f9fa',
            padding: '20px',
            overflowY: 'auto',
          }}
        >
      <h5>Collections</h5>
          <ListGroup variant="flush">
            {collections.map((collection,index) => (
              <ListGroup.Item
                key={collection.uri}
                action
                active={selectedCollection?.uri === collection.uri}
                onClick={() => {setSelectedCollection(collection);setSelectedCollectionIdx(index)}}
                style={{ cursor: 'pointer', fontWeight: selectedCollection?.uri === collection.uri ? 'bold' : 'normal', 
                backgroundColor: selectedCollection?.uri === collection.uri ? '#3B4CCA' : 'transparent'}}

              >
                {collection.name}
              </ListGroup.Item>
            ))}
          </ListGroup>
          </Col>

        {/* Detail View - Display Minted Cards */}
        <Col className="p-4 d-flex flex-column align-items-center overflow-auto">
          {selectedCollection ? (
            <div className="w-100 text-center">
            <h4 className="mb-4">Cards in {selectedCollection.name} </h4>
              <div >
              <Row>
              {
                collectionCards.map((c,index) => (
                    <Col sm={3} md={2} lg={3} className="mb-4">
                    <Card>
                    <Card.Img 
                      variant="top"
                      // src={getImageURLbyID(collection[1].uri.split("-")[1])}
                      src = {"https://images.pokemontcg.io/"+selectedCollectionIdx+"/"+c.uri.split("-")[1]+".png"}
                    />
                    </Card>
                    </Col>
                  ))}
              </Row>
              </div>
            </div>

            
          ) : (
            <div className="d-flex justify-content-center align-items-center vh-100">

            <h4 className="text-center">Select a collection to view available cards</h4>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default Shop;