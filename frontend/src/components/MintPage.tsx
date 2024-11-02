import React, {useEffect, useState, useRef } from 'react';
import { Card, Spinner, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
//import useWallet from '@/wallet/useWallet';
import styles from '../styles.module.css'
import { ethers } from 'ethers'

const SERVER = "http://127.0.0.1:5001/"
const isLoading = false
// const [collections, setCollections] = useState([]) 
// var collections = []

const owneraddr = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"

const createCollectionSubmit = async (e) => {
    e.preventDefault()
    const form = e.target
    const formData = new FormData(form)

    const resp = await fetch(
    SERVER+"createCollection",
    {
        method: form.method,
        body: formData
        }
    )
    const data = await resp
}


const MintPage: React.FC = () => {
	const [collections, setCollections] = useState([])
	const [userAccount,setUserAccount] = useState(null)
	const [error,setError] = useState(null)

	const getWallet = async (requestAccounts=true) => {
            const ethereum = (window as any).ethereum
            if (ethereum) {
                 if (requestAccounts) {
                    await ethereum.request({ method: 'eth_requestAccounts' })
                    const provider = new ethers.providers.Web3Provider(ethereum as any)
                    const accounts = await provider.listAccounts()
                    console.log(accounts)    
                    const account = accounts[0]
                    const signer = provider.getSigner()
                    setUserAccount(account)
                    if (account!=owneraddr) {
                    	setError("unauthorized user")
                    }
                }
            }
        }
  getWallet()

	const getPokemonCollections = async () => {
		const chainresp = await fetch(
				SERVER+"getCollectionURIs"
			)
		const chainCollections = await chainresp.json()
		const pokeresp = await fetch(
				"https://api.pokemontcg.io/v2/sets"
			)
		const pokeData = await pokeresp.json()
		console.log(pokeData["data"])
		
		const pokeCollections = pokeData["data"].map(
				o => ({
					collectionID: o["id"],
					cName: o["name"],
					imageUrl: o["images"]["symbol"],
					onChain: chainCollections.indexOf(o["id"]) > -1,
					count: o["total"]
				})
			)

		console.log(pokeCollections)
		setCollections(pokeCollections)
		// collections=pokeCollections
	}

	useEffect(() => {
        getPokemonCollections();
    }, []);

	const getColor = (c) => {
		if (c==false) return 'light'
		else return 'success' 
	}

	const handleClick = async (colID,colName,colCount) => {
		    
		    const formData = new FormData()
		    formData.append("collectionName",colName)
		    formData.append("collectionURI",colID)
		    formData.append("collectionCardCount",colCount)
			// const send = {
			// 	collectionName: colName,
			// 	collectionURI: colID,
			// 	colCount: colCount
			// }

		    const resp = await fetch(
		    SERVER+"createCollection",
		    {
		        method: 'POST',
		        body: formData
		        }
		    )
		    const data = await resp
	}

	return (
		<div>
		<h1> Mint page </h1>
			  <div>        
			 {/* -------------------- CREATE COLLECTION ----------------------------- */}
            <h3>Create collection </h3>
    
			<form method="post" onSubmit={createCollectionSubmit}>
			<label>
				Collection name: <input name="collectionName"/>
			</label>
			<label>
				Collection URI: <input name="collectionURI"/>
			</label>
			 <label>
				Collection card count: <input name="collectionCardCount"/>
			</label>
			 <button type="submit" > createCollection </button> 
			</form>
			</div>
	  <Container className="container mt-4">
      <h2 className="text-center mb-4">Available Collections</h2>
    
        
      {isLoading ? (
        // show spinner while loading
        <Spinner animation="border" role="status" aria-label="Loading collections">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      ) : error ? (
        <div className="text-danger text-center">{error}</div>
      ) : (
        // show collections in cards bootstrap
        <Row>
          {collections.map((collection) => (
            <Col key={collection.collectionID} sm={6} md={4} lg={3} className="mb-4">
              <Card            
                className="shadow-sm hover-card"
                bg= {getColor(collection.onChain)}
                onClick = {() => handleClick(collection.collectionID,collection.cName,collection.count)}
                // when we click on a collection, go to the cards page of that collection
                style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
              >
                
                <Card.Body>
                  <Card.Title>{collection.cName}</Card.Title>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

    </Container>
    </div>
	)
}

export default MintPage;