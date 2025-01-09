import React, {useEffect, useState} from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import{ Link } from 'react-router-dom';
import styles from '../styles.module.css'
import { ethers } from 'ethers'

const ownerAddr = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"

const NavBar: React.FC  = () => {
    const [currentAccount,setAccount] = useState("")

    const checkWallet = async () => {
        const ethereum = (window as any).ethereum
        if (ethereum) {
            await ethereum.request({ method: 'eth_requestAccounts' })
            const provider = new ethers.providers.Web3Provider(ethereum as any)
            const accounts = await provider.listAccounts()
            const account = accounts[0]
            console.log(account)
            console.log(ownerAddr)
            setAccount(account)
        } 
    }

    useEffect(() => {
        checkWallet()
    },[])

    window.ethereum.on('accountsChanged', function (accounts) {
        window.location.reload()
    })


    return (
        <Navbar className={styles.navbar} fixed="top">
            <Container>
            <Navbar.Brand className={styles.navbarTitle} as={Link} to="/">PokémonTCG</Navbar.Brand>
            <Nav className={styles.navLink}>
                <Nav.Link as={Link} to="/marketplace">Catalogue & Card Market</Nav.Link>
                <Nav.Link as={Link} to="/shop">Booster Shop</Nav.Link>
                {/*<Nav.Link as={Link} to="/collections">Collections</Nav.Link>*/}
                {currentAccount==ownerAddr ? (<Nav.Link as={Link} to="/treasury">Mint</Nav.Link>) : (<div></div>)}

            </Nav>
            </Container>
        </Navbar>
    );

}
export default NavBar;