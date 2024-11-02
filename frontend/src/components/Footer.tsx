import React from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import styles from '../styles.module.css'
import { Col, Row } from 'react-bootstrap';


const Footer: React.FC = () => {
    return (
        <footer >
            <Container fluid>
                <Row className={styles.footer}>
                <Col md={4}>
                <a href="https://www.sorbonne-universite.fr/" target="_blank" rel="noopener noreferrer">   
                    Sorbonne Université
                </a>
                </Col>
                    <Col md={4}>
                <p>Created by Abbas Mahfouz & Lea El Abboud</p>
                <p>
                <a href="https://github.com/leabboud/collectible-card-game-daar" target="_blank" rel="noopener noreferrer"> Project GitHub</a>
                
                </p>
                </Col>
                <Col md={4}>
                        <a href="https://github.com/ghivert/collectible-card-game-daar" target="_blank" rel="noopener noreferrer">
                            Professor's project GitHub
                        </a>
                        <br />
                        <a href="https://www-npa.lip6.fr/~buixuan/daar2024" target="_blank" rel="noopener noreferrer">
                            DAAR Course Link
                        </a>
                </Col>
                </Row>
            </Container>
        </footer>
    );
}
export default Footer;