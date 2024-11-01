import React, {useEffect, useState} from 'react';
import { Card, Spinner, Container, Row, Col } from 'react-bootstrap';
import { useParams } from 'react-router-dom';

interface CardItem{
    cardId: number;
    imageUrl: string;
}

const CardsCollection: React.FC = () => {
    const { collectionId } = useParams<{ collectionId: string }>(); // Retrieve collection ID from URL
    const [cards, setCards] = useState<CardItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const mockCards = [
            { cardId: 1, name: "Card One", imageUrl: "https://via.placeholder.com/240" },
            { cardId: 2, name: "Card Two", imageUrl: "https://via.placeholder.com/240" },
            { cardId: 3, name: "Card Three", imageUrl: "https://via.placeholder.com/240" },
            { cardId: 4, name: "Card Four", imageUrl: "https://via.placeholder.com/240" },
            { cardId: 5, name: "Card Five", imageUrl: "https://via.placeholder.com/240" }
        ];
        setCards(mockCards);
        setIsLoading(false);
    }, [collectionId]);

    return (
        <Container>
            <h2>Cards Collection</h2>
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
                            <Card className="shadow-sm">
                                <Card.Img variant="top" src={card.imageUrl} alt={`Card ${card.cardId}`} />
                            </Card>
                        </Col>
                    ))}
            </Row>
        )}
        </Container>
    );




}
export default CardsCollection;