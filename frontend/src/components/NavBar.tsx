import React from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import{ Link } from 'react-router-dom';
import styles from '../styles.module.css'

const NavBar: React.FC  = () => {
    return (
        <Navbar className={styles.navbar} fixed="top">
            <Container>
            <Navbar.Brand className={styles.navbarTitle} as={Link} to="/">PokémonTCG</Navbar.Brand>
            <Nav className={styles.navLink}>
                <Nav.Link as={Link} to="/collections">Collections</Nav.Link>
                <Nav.Link as={Link} to="/users">Users</Nav.Link>
                <Nav.Link as={Link} to="/treasury">Mint</Nav.Link>
            </Nav>
            </Container>
        </Navbar>
    );

}
export default NavBar;