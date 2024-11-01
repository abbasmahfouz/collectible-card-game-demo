import React from 'react';
import styles from '../styles.module.css'

const HomePage: React.FC = () => {
    return (
        <div className="container mt-4">
            <h1 className={styles.title}>Welcome to <br /> PokémonTCG</h1>
            <p className={styles.description}>Explore collections, view users, and more.</p>
        </div>
    );
}
export default HomePage;
