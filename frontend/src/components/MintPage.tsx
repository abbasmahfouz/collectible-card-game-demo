import React, {useEffect, useState } from 'react';
import { Card, Spinner, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
//import useWallet from '@/wallet/useWallet';
import styles from '../styles.module.css'

const SERVER = "http://127.0.0.1:5001/"

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
		</div>
	)
}

export default MintPage;