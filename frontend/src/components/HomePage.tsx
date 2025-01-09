import React from 'react';
import styles from '../styles.module.css'
import { useNavigate } from 'react-router-dom';
    
const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const handleButtonClick = () => {
        navigate('/Shop');
    }
    return (
        <div className={styles.homepage}>
            
            <div className={styles.titleContainer}>
            <h1 className={styles.homepageTitle}>
                Welcome to <br /> PokémonTCG
            </h1>
            <p className={styles.description}>Explore collections, view users, and more.</p>
        </div>
        
        <button className={styles.exploreButton} onClick = {handleButtonClick}>Start Exploring</button>

        </div>
    );
}
export default HomePage;
