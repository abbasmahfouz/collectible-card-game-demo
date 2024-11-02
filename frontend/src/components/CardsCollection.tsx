import React, {useEffect, useState} from 'react';
import { Card, Spinner, Container, Row, Col } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { ethers } from 'ethers'

const SERVER = "http://127.0.0.1:5001/"

interface CardItem{
    cardId: number;
    imageUrl: string;
    onChain: bool;
}


const CardsCollection: React.FC = () => {
    const { collectionId } = useParams<{ collectionId: string }>(); 
    const [collectionName,setName] = useState("")
    const [cards, setCards] = useState<CardItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [chainCards,setChainCards] = useState([])
    const [userAccount,setUserAccount] = useState(null) 

    useEffect(() => {
        
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

                }
            }
        }
        getWallet()

        const getCards = async () => {
            const chainresp = await fetch(
                SERVER+"getAllCollections"
            )
            const chainCollections = await chainresp.json()

            console.log(chainCollections)
            

            const chainCollectionURIs = Object.keys(chainCollections).map(
                    k => chainCollections[k]["uri"]
                )
            const chainCardURIs = chainCollections["all-card-URIs"]
            setChainCards(chainCardURIs)
            console.log(chainCardURIs)
            // setChainCol(chainCollections)
            console.log(chainCollections)
            // console.log(chainCollectionURIs)
            if (chainCollectionURIs.indexOf(collectionId)<0) {
                setError("Collection not available.")
            }

            const pokeresp = await fetch(
                "https://api.pokemontcg.io/v2/cards?q=set.id:"+collectionId
            )
            // console.log(collectionId)
            const pokedata = await pokeresp.json()
            const cardInfo = pokedata["data"].map(
                    o => ({
                        cardId: o["id"],
                        name: o["name"],
                        imageUrl: o["images"]["small"],
                        onChain: chainCardURIs.indexOf(o["id"]) > -1
                    }) 
                )

            // console.log(cardInfo) 

            setCards(cardInfo);
        }
        getCards()

        const getName = async () => {
            const resp = await fetch(
                "https://api.pokemontcg.io/v2/sets.data?q=id:"+collectionId
                )
            const data = await resp.json()

            setName(data["data"][0]["name"])
        }
        getName()
        
        setIsLoading(false);
    }, [collectionId]);

    const handleClick = async (cardId) => {
        // const { collectionId } = useParams<{ collectionId: string }>(); 
        const formData = new FormData()
        if (userAccount==null) {return}    
        if (chainCards.indexOf(cardId) > 0)  {return}
        formData.append("address",userAccount)
        formData.append("tokenURI",cardId)
        formData.append("collectionId",collectionId)

        const resp = await fetch(
        SERVER+"mintCard",
        {
            method: 'POST',
            body: formData
            }
        )
        const data = await resp
    }

    const getColor = (c) => {
        if (c==true) return 'danger'
        else return 'success' 
    }

    return (
        <Container>
            <h2>Cards in {collectionName}</h2>
            {isLoading ? (
        // show spinner while loading
        <Spinner animation="border" role="status" aria-label="Loading collections">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      ) : error ? (
        <div className="text-danger text-center">{error}</div>
      ) : (
            <Row>
                    {cards.map((card) => (
                        <Col key={card.cardId} sm={6} md={4} lg={3} className="mb-4">
                            <Card className="shadow-sm"
                            border = {getColor(card.onChain)}

                            onClick={() => handleClick(card.cardId)}
                            style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                            >
                                <Card.Img variant="top" src={card.imageUrl} alt={`Card ${card.cardId}`} />
                                <Card.Body>
                                    <Card.Title>{card.name}</Card.Title>
                                </Card.Body>
                            </Card>
                            
                        </Col>
                    ))}
            </Row>
        )}
        </Container>
    );




}
export default CardsCollection;