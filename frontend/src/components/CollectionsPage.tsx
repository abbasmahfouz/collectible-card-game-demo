import React, {useEffect, useState } from 'react';
import { Card, Spinner, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
//import useWallet from '@/wallet/useWallet';
import styles from '../styles.module.css'


const SERVER = "http://127.0.0.1:5001/"

interface Collection{
    collectionId: number;
    cName: string;
    imageUrl: string;
}

// component that displays all the available collections

const CollectionsPage: React.FC = () => {
    //const { contract } = useWallet();
    const navigateToPage = useNavigate();
    const [collections, setCollections] = useState<Collection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [colNames, setColNames] = useState([])
    
    // connect to the contract and get all the collection names
    // const getAllCollections = async () => {
    //     if (!contract){
    //         setError("Contract not available");
    //         setIsLoading(false);
    //         return;
    //     }
    //     try{
    //         // get all the collection names
    //         const collectionNames = await contract.getCollectionNames();
    //         // create a collection object for each collection name
    //         const collectionData: Collection[] = collectionNames.map((name: string, index: number) => ({
    //             collectionId: index,
    //             cName: name,
    //         }));
    //         setCollections(collectionData);

    //         // TODO: --------------- Appeler fonction l'API de TCG  ---------------

    //     }catch(e){
    //         setError("Failed to get collection names");
    //         setIsLoading(false);
    //         return;
    //     }finally{
    //         setIsLoading(false);
    //     }
    // };


    // useEffect(() => {
    //     getAllCollections();
    // }, [contract]);


        const getCollectionInfo = async () => {
          try{
            setIsLoading(true);
            setError(null);

            const resp = await fetch(SERVER+"getAllCollections");
            if (!resp.ok) throw new Error("Failed to fetch collections");

            const data = await resp.json()

                  // const collectionsImages = Object.keys(data).map(
                  //     c=> ({
                  //       imageUrl: await fetch("https://images.pokemontcg.io/base2/symbol.png")
                  //     })
                  //   )
            const collectionsDisplay = Object.keys(data).map(
                          c => ({
                            collectionId: data[c]['uri'],
                            cName: c,
                            imageUrl: "https://images.pokemontcg.io/"+data[c]["uri"]+"/symbol.png"
                          }));

            setCollections(collectionsDisplay)
          } catch (e) {
            setError("Failed to load collections. Please try again later.");
        } finally {
            setIsLoading(false); // Stop loading
        }
    };

    useEffect(() => {
        getCollectionInfo();
    }, []);

    const handleCollectionClick = (collectionId: number) => {
      navigateToPage(`/collections/${collectionId}`);
  };
  
    return (
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
            <Col key={collection.collectionId} sm={6} md={4} lg={3} className="mb-4">
              <Card
                className="shadow-sm hover-card"
                // when we click on a collection, go to the cards page of that collection
                onClick={() => handleCollectionClick(collection.collectionId)}
                style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
              >
                <Card.Img variant="top" src={collection.imageUrl} alt={collection.cName} />
                <Card.Body>
                  <Card.Title>{collection.cName}</Card.Title>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

    </Container>
    );
  };


export default CollectionsPage;

    // const createCollectionSubmit = async (e) => {
    //     e.preventDefault()
    //     const form = e.target
    //     const formData = new FormData(form)

    //     const resp = await fetch(
    //     SERVER+"createCollection",
    //     {
    //         method: form.method,
    //         body: formData
    //         }
    //     )
    //     const data = await resp
    // }

    // const getCollectionNames = async () => {

    //     const resp = await fetch(
    //         SERVER+"getCollectionNames",
    //         {
    //         method: 'GET'
    //         }
    //     )
    //     const data = await resp.json()
    //     const ret = []
    //     for (let k of Object.keys(data)) {
    //     ret.push(data[k])
    //     }
    //     listNames(ret)
    //     return ret
    // }

    // const mintCardSubmit = async (e) => {
    //     e.preventDefault()
    //     const form = e.target
    //     const formData = new FormData(form)

    //     const resp = await fetch(
    //         SERVER+"mintCard",
    //         {
    //         method: 'POST',
    //         body: formData
    //         }
    //     )
    //     const data = await resp
    // }

    // const getAllCollections = async () => {
    //     const resp = await fetch(
    //         SERVER+"getAllCollections",
    //         {
    //         method: 'GET'
    //         }
    //     )
    //     const data = await resp.json()
    //     console.log(data)
    // }

    // // const [collections,setCollections] = useState([]);

    // // getCollectionNames()
    // // console.log(collections)
    // const listNames = (collections: string[]) => {
    //     if(collections.length === 0) {
    //         setCollHTML(<p>No collections found</p>)
    //     }
    //     else{
    //         const listItems = collections.map(name => <li> {name} </li>)
    //         setCollHTML(<ul>{listItems}</ul>)
    //     }
    // } 
    // // getCollectionNames()
    // // const listedNames = listNames()

    // return (
    //     <div>        
    //     {/* -------------------- CREATE COLLECTION ----------------------------- */}
    
    //       <h1>Create collection </h1>
    
    //       <form method="post" onSubmit={createCollectionSubmit}>
    //       <label>
    //         Collection name: <input name="collectionName"/>
    //       </label>
    //       <label>
    //         Collection card count: <input name="collectionCardCount"/>
    //       </label>
    //       <button type="submit" > createCollection </button> 
    //       </form>

    //       <button onClick={getCollectionNames} > getCollectionNames </button> 
    //       <button onClick={getAllCollections} > getAllCollections </button>
    //       {collHTML}
    //     </div>

    //       );