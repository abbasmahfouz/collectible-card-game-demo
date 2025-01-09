import React, {useEffect, useState, useRef, createRef } from 'react';
import { Accordion, Card, Spinner, Container, Row, Col, Modal, Button, Form, Tab, Tabs } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
//import useWallet from '@/wallet/useWallet';
import styles from '../styles.module.css'
import { ethers } from 'ethers'

const SERVER = "http://127.0.0.1:5001/"
// const isLoading = false
// const [collections, setCollections] = useState([]) 
// var collections = []

const owneraddr = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"

function VerticallyCenteredModal(props) {
	const [key,setKey] = useState("custom")
	const [collections, setCollections] = useState([])
	const [isLoading, setIsLoading] = useState(true)
	const [cardRefs,setRefs] = useState([])
	const [selectedCollectionIDs, setSelectedCollectionIDs] = useState([])
	const [selectedCollections,setSelectedCollections] = useState([])
	const [error,setError] = useState("")


	const getPokemonCollections = async () => {
		const pokeResp = await fetch(
				"https://api.pokemontcg.io/v2/sets"
			)
		const pokeData = await pokeResp.json()
		const pokeCollections = pokeData["data"].map(
						o => ({
							collectionID: o["id"],
							cName: o["name"],
							imageUrl: o["images"]["symbol"],
							count: o["total"]
							})
						)
		setCollections(pokeCollections)
		setRefs(pokeData["data"].map(o=>createRef()))
		setIsLoading(false)
	}
	// getPokemonCollections()
		useEffect(() => {
						if (collections.length==0) {
		        getPokemonCollections();
		      	}
		    }, []);

		const handlePokeCollectionClick = async (colID,colName,colCount,cardRef) => {
			var rmIndex = 0 //index of collection to be removed from list
			if (selectedCollectionIDs.indexOf(colID)>-1) {
				cardRef.current.className="shadow-sm hover-card card bg-light border-primary"
				rmIndex = selectedCollectionIDs.indexOf(colID)
				setSelectedCollectionIDs(selectedCollectionIDs.filter((item,i)=>i !== rmIndex))
				setSelectedCollections(selectedCollections.filter((item,i)=>i !== rmIndex))
			} else {
				cardRef.current.className="shadow-sm hover-card card bg-success border-primary"
				setSelectedCollectionIDs(selectedCollectionIDs.concat(colID))
				setSelectedCollections(selectedCollections.concat({
						"collectionName":colName,
						"collectionURI":colID,
						"collectionCardCount":colCount
				}))
				console.log(selectedCollections)
			}

	}

	const tabChange = (k) => {
		setSelectedCollections([])
		setSelectedCollectionIDs([])
		setKey(k)
		cardRefs.map(o => {
			if (o!=null) {
				o.current.className="shadow-sm hover-card card bg-light border-primary"
			}
		})
	}

	const submitCreateCollection = async (e) => {
		setError("")
		if (key=="custom") {
			e.preventDefault()
			const form = e.target
			const formData = new FormData(form)
			if (formData.get("colName").length==0 || formData.get("colCount").length==0) {
				setError("Please fill all fields")
				return
			}
			if (isNaN(Number(formData.get("colCount")))) {
				setError("Card count must be a number")
				return
			}
			formData.append("colURI","colName")

			const resp = await fetch(
	    SERVER+"createCollection",
	    {
	        method: 'POST',
	        body: formData
	        }
	    )
	    const data = await resp

			}
			else {
				e.preventDefault()
				if (selectedCollections.length==0) {
					setError("Please select at least one collection")
					return
				}
				// console.log(selectedCollections)
				
				selectedCollections.map( async (o) => 
					{
						// console.log(o)
						const formData = new FormData()
						formData.append("colName",o["collectionName"]);
						formData.append("colCount",o["collectionCardCount"]);
						formData.append("colURI",o["collectionURI"])
						// console.log(formData)
						var resp = await fetch(  SERVER+"createCollection", {  method: 'POST',body: formData})
						while (resp.status!=200) {
							resp = await fetch(  SERVER+"createCollection", {  method: 'POST',body: formData})
						}
						// const resp_json = await resp.json()
						const colID = await resp.text()
						const colCards = await fetch(
                "https://api.pokemontcg.io/v2/cards?q=set.id:"+o["collectionURI"]
            )
            const colCards_json = await colCards.json()
            // console.log(colCards_json)
            const cards = Promise.all(colCards_json["data"].map(async (c) => {
            		const formData_ = new FormData()
            		formData_.append("tokenURI",c["id"])
            		formData_.append("collectionId",colID)
            		var cardResp = await fetch (SERVER + "createCard", {method:'POST',body: formData_}).catch(async () => {
            			cardResp = await fetch (SERVER + "createCard", {method:'POST',body: formData_})
            			while (cardResp.status!=200) {
            			cardResp = await fetch (SERVER + "createCard", {method:'POST',body: formData_})
            			}
            		})
            	cards.then(window.location.reload())
            		
            }))

					})

			}
		}

  return (
    <Modal
      {...props}
      size="lg"
      scrollable="true"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      show = {props.show}
      onHide= {() => {setSelectedCollections([]); setSelectedCollectionIDs([])}}
    >
      <Modal.Header>
        <Modal.Title id="contained-modal-title-vcenter">
          Create collection
        </Modal.Title>
      </Modal.Header>
       <Modal.Body>
      <Tabs activeKey={key} onSelect={(k)=>tabChange(k)} className="mb-3">

      <Tab eventKey = "custom" title="Custom">
      	<Form id ="customCollectionForm" onSubmit={submitCreateCollection}>
      	<Form.Group as={Row} className="mb-3">
        <Form.Label column sm={2}>Name: </Form.Label>
        <Col sm={5}>
        <Form.Control id="colName" name="colName" type = "text"/>
        </Col>
        </Form.Group>
        <Form.Group as={Row} className="mb-3">
        <Form.Label column sm={2}>Card count: </Form.Label>
        <Col sm={5}>
        <Form.Control id="colCount" name="colCount" type = "text"/>
        </Col>
        </Form.Group>
        </Form>
        
       </Tab>
       <Tab eventKey = "pokemon" title="Pokémon">
       <h2>Click on collection to release </h2>

       {isLoading ? (
       		<Spinner animation="border" role="status" aria-label="Loading collections">
       		<span className="visually-hidden">Loading...</span>
       		</Spinner>
       	) : (
       		<Row>
       		{collections.map((collection,index) => (
       			<Col key={collection.collectionID} sm={5} md={2} lg={6} className="mb-4">
	              <Card            
			              className="shadow-sm hover-card"
			              onClick = {() => handlePokeCollectionClick(collection.collectionID,collection.cName,collection.count,cardRefs[index])}
			              style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
			              bg = 'light'
			              border = 'primary'
			              ref = {cardRefs[index]}
           				>
                
                <Card.Body>
                  <Card.Title>{collection.cName}</Card.Title>
                </Card.Body>
              </Card>

       			</Col>

       			))}
       		</Row>
       	)}

       </Tab>
       </Tabs>
       </Modal.Body>

         <Modal.Footer>	
      	  <span className="me-auto" style={{color: 'red'}}>{error}</span>
        	<Button onClick={() => {props.onHide(); setSelectedCollectionIDs([]); setSelectedCollections([])}}>Cancel</Button>
       	  <Button color="red" form="customCollectionForm" type = "submit" value="update	">Create!</Button>
    	  </Modal.Footer>



     
    </Modal>
  );
}


const MintPage: React.FC = () => {
		const [modalShow, setModalShow] = useState(false)
		const [isLoading, setIsLoading] = useState(true)
		const [isLoading_detail, setIsLoading_detail] = useState(true)
		const [showDetails,setShowDetails] = useState(false)
		const [chainCollections,setChainCollections] = useState([])
		const [chosenCollection,setChosenCollection] = useState([])
		const [notSpamming,setNotSpamming] = useState(true)
		const [chosenCollectionId,setChosenCollectionId] = useState([])
		const [chosenCollectionIdx,setChosenCollectionIdx] = useState(0)
		const [key,setKey] = useState("colView")
		const [cardRefs,setRefs] = useState([])
		const [availableBoosters,setAvailableBoosters] = useState([])
		const [cardNames,setCardNames] = useState([])
		const [provider,setProvider] = useState(null)
		const [globalError,setGlobalError] = useState("")

		const getChainCollections = async () => {
					const chainresp = await fetch(
						SERVER+"getCollections"
					)
					const chainCols= await chainresp.json()
					console.log(chainCols)
					setChainCollections(chainCols)
					setIsLoading(false)
		}

		const getWallet = async () => {
					const ethereum = (window as any).ethereum
            if (ethereum) {
            	await ethereum.request({ method: 'eth_requestAccounts' })
                const provider = new ethers.providers.Web3Provider(ethereum as any)
                const accounts = await provider.listAccounts()
                // console.log(accounts)    
                const account = accounts[0]
                if (account!=owneraddr) {setGlobalError("unauthorized user")}
                // setProvider(provider)
            }
		}

		useEffect(() => {
						getChainCollections()
						getWallet()
		    }, []);

		useEffect(() => {
				setRefs(Object.entries(chosenCollection).map(o=>createRef()))
				getAvailableBoosters()
				
		},[chosenCollection])


		const getAvailableBoosters = async () => {
				const chainresp = await fetch(
					SERVER+"getBoosters"
				)
				const chainCols= await chainresp.json()
				setAvailableBoosters(Object.entries(chainCols))
		} 

		const collectionDetailedView = async (colId,colURI,colName) => {
			const chainresp = await fetch(
					SERVER+"getCollectionCards?colId="+colId
				)
			const colCards = await chainresp.json()
			console.log(colCards)
			setChosenCollection(colCards)
			setChosenCollectionId(colURI)
			setChosenCollectionIdx(colId)
			setShowDetails(true)
			setIsLoading_detail(false)
		}

		function CollectionModal () {
					const [chosenCards,setChosenCards] = useState([])
					const [chosenCardIds,setChosenCardIds] = useState([])
					const [error,setError] = useState("")
					const [boosterCardNames,setBoosterCardNames] = useState([])


		const checkBooster = (cardId) => {
			const b = availableBoosters.filter(o=>o[1].collection==chosenCollectionIdx)
			var cards_ = ""
			b.map(o=> cards_+=o[1].cards)
			if (cards_.split(",").includes(String(cardId))) {
				return true;
			} else {
				return false;
			}
		}

		const checkBooster_display = (cardId) => {
			const b = availableBoosters.filter(o=>o[1].collection==chosenCollectionIdx)
			var cards_ = ""
			b.map(o=> cards_+=o[1].cards)
			console.log(cards_)
			if (cards_.split(",").includes(String(cardId))) {
				console.log(styles.grayedOut);
				return String(styles.grayedOut);
			} else {
				return "";
			}
		}

		const buildBooster = async (colId,cardId,cardRef) => {
			setError("")
			var rmIndex = 0
			console.log(cardRef)
			console.log(availableBoosters)
			const b = availableBoosters.filter(o=>o[1].collection==chosenCollectionIdx)
			var cards_ = ""
			b.map(o=> cards_+=o[1].cards)
			console.log(cards_)
			console.log(cardId)
			if (cards_.split(",").includes(String(cardId))) {
				setError("Card already in booster")
				return;
			}
			// if () {

			// }
			if (chosenCardIds.indexOf(cardId)>-1) {
				cardRef.current.className="shadow-sm hover-card card bg-light border-primary"
				rmIndex = chosenCardIds.indexOf(cardId)
				setChosenCardIds(chosenCardIds.filter((item,i)=> i!==rmIndex))
			} else {
				cardRef.current.className="shadow-sm hover-card card bg-success border-success "+styles.dancing
				setChosenCardIds(chosenCardIds.concat(cardId))
			}
		}

		const submitCreateBooster = async (e) => {
			setError("")
			e.preventDefault()
			const form = new FormData(e.target)
			console.log(form)
			if (form.get("boosterName").length==0) {
				setError("Please enter a name for the booster")
				return
			}
			if (chosenCardIds.length==0) {
				setError("Please select at least one card")
				return
			}
			console.log(chosenCardIds.toString())
			form.append("cards",chosenCardIds.toString())
			form.append("colId",chosenCollectionIdx)
			const resp = await fetch(  SERVER+"createBooster", {  method: 'POST',body: form})
			window.location.reload()
		}

		const tabChange = (k) => {
			setKey(k)
			setChosenCardIds([])
		}


			return (
				<Modal
				  size="lg"
		      scrollable="true"
		      aria-labelledby="contained-modal-title-vcenter"
		      show = {showDetails}
		      centered
		      onHide = {() => {setShowDetails(false); setChosenCardIds([])}}>
		    <Modal.Header>
		    <Modal.Title id="contained-modal-title-vcenter"> {Object.entries(chainCollections).length>0 ? (chainCollections[chosenCollectionIdx]["name"]) : ""} collection detailed view </Modal.Title>
		    </Modal.Header>

		     <Modal.Body>
		     <Tabs activeKey={key} onSelect={(k)=>tabChange(k)} className="mb-3">
		     <Tab eventKey = "colView" title="Details">
		     <div className="col align-self-center">
		     	Max capacity: {Object.entries(chainCollections).length>0 ? (chainCollections[chosenCollectionIdx]["count"]) : ""} 
		     </div>
		     <div className="col align-self-center">
		     	Current card count: {Object.entries(chainCollections).length>0 ? (chainCollections[chosenCollectionIdx]["current"]) : ""} 
		     </div>
		     <div className="mb-3 row justify-content-center">
		     	Add card
		     </div>

		    <Form  id ="customCardForm">
        <Form.Group as={Row} className="mb-3">
        <Form.Label column sm={2}>New card URI: </Form.Label>
        <Col sm={5}>
        <Form.Control id="tokenURI" name="tokenURI" type = "text"/>
        </Col>
				<Col sm={5}>
        </Col>
        </Form.Group>

        </Form>


         

       	</Tab>
       	<Tab eventKey = "colBoosters" title="Boosters">
       	<div className="mb-3 row justify-content-center">
		      Available boosters
		     </div>
		     	
		     	<Row>
		       		{availableBoosters.filter(o=>o[1].collection==String(chosenCollectionIdx)).map((collection, index) => 
		       			(
		       			<Col sm={3} md={1} lg={5} className="mb-4">
			              <Accordion            
					              onClick = {() => {getCardNames(collection[1].cards)}}
					              // style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
					              // bg = 'light'
		           				>
		           				<Accordion.Item eventKey="0">
		               <Accordion.Header>{collection[1].name} </Accordion.Header>
		               <Accordion.Body>{} </Accordion.Body>
		               </Accordion.Item>
		              </Accordion>

		       			</Col>

		       			))}
		      </Row>


		     <div className="mb-3 row justify-content-center">
		      Create booster
		     </div>

				<Form id ="createBoosterForm" onSubmit={submitCreateBooster}>
        <Form.Group as={Row} className="mb-3">
        <Form.Label column sm={2}>Booster name: </Form.Label>
        <Col sm={5}>
        <Form.Control id="boosterName" name="boosterName" type = "text"/>
        </Col>
				<Col sm={5}>
        </Col>
        </Form.Group>
        <div className = "mb-5" >
        	     			{isLoading_detail ? (
		       		<Spinner animation="border" role="status" aria-label="Loading collections">
		       		<span className="visually-hidden">Loading...</span>
		       		</Spinner>
		       		) : (
		       		<Row>
		       		{Object.entries(chosenCollection).map((collection, index) => 
		       			(
		       			<Col sm={3} md={1} lg={2} className="mb-4">
			              <Card            
					              className= {"shadow-sm hover-card "+checkBooster_display(index)}
					              onClick = {() => {buildBooster(chosenCollectionId,index,cardRefs[index])}}
					              style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
					              bg = 'light'
					              border = 'primary'
					              ref = {cardRefs[index]}
		           				>
		                
		                <Card.Img 
											variant="top"
		                  // src={getImageURLbyID(collection[1].uri.split("-")[1])}
		                  src = {"https://images.pokemontcg.io/"+chosenCollectionId+"/"+collection[1].uri.split("-")[1]+".png"}
		                />
		              </Card>

		       			</Col>

		       			))}
		       		</Row>
		       	)}

		     </div>
		    </Form>

       	</Tab>
       	<Tab eventKey = "colCards" title="Cards">
	     			{isLoading_detail ? (
		       		<Spinner animation="border" role="status" aria-label="Loading collections">
		       		<span className="visually-hidden">Loading...</span>
		       		</Spinner>
		       		) : (
		       		<Row>
		       		{Object.entries(chosenCollection).map((collection) => (
		       			<Col sm={5} md={2} lg={6} className="mb-4">
			              <Card            
					              className="shadow-sm hover-card"
					              onClick = {() => {}}
					              style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
					              bg = 'light'
					              border = 'primary'
		           				>
		                
		                <Card.Img 
											variant="top"
		                  // src={getImageURLbyID(collection[1].uri.split("-")[1])}
		                  src = {"https://images.pokemontcg.io/"+chosenCollectionId+"/"+collection[1].uri.split("-")[1]+".png"}
		                />
		              </Card>

		       			</Col>

		       			))}
		       		</Row>
		       	)}
       	</Tab>
       	</Tabs>
		     </Modal.Body>
		     <Modal.Footer>
		     <span className="me-auto" style={{color: 'red'}}>{error}</span>
				<Button form="createBoosterForm" type = "submit">
        Create!
        </Button>
		     </Modal.Footer>


				</Modal>
				)
		}

		return (
		<div>
		
{globalError.length>0? (<h1 className="text-center mb-4">{globalError}</h1>) : (	  <Container className="container mt-4">
		  
		  <h1 className="text-center mb-4">Mint page</h1>
    
		  <Row>
		  <Col>
		  <Card className="shadow-sm hover-card"
            style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
            onClick = {() => setModalShow(true)}
           	>
      <Card.Body>
      	<Card.Title>Create new collection</Card.Title>
      </Card.Body>

		  </Card>
		  </Col>

		  </Row>

		  <h1 className="text-center mb-4">Available collections</h1>

		  {isLoading ? (
       		<Spinner animation="border" role="status" aria-label="Loading collections">
       		<span className="visually-hidden">Loading...</span>
       		</Spinner>
       	) : (
       		<Row>
       		{(Object.entries(chainCollections)).map((collection,index) => (
       			<Col key={collection[1].uri} sm={5} md={2} lg={6} className="mb-4">
	              <Card            
			              className="shadow-sm hover-card"
			              onClick = {() => {collectionDetailedView(index,collection[1].uri,collection[1].name)}}
			              style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
			              bg = 'light'
			              border = 'primary'
           				>
                
                <Card.Body>
                  <Card.Title>{collection[1].name}</Card.Title>
                </Card.Body>
              </Card>

       			</Col>

       			))}
       		</Row>
       	)}

		  <VerticallyCenteredModal
        show={modalShow}
        onHide={() => {setModalShow(false)}}
      />

     	<CollectionModal
     	show = {showDetails}
     	onHide = {() => {setShowDetails(false)}}
     	/>

    </Container>)}
    </div>
	)
}


export default MintPage;