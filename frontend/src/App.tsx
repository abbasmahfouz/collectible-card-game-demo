import React from 'react';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import HomePage from './components/HomePage';
import CollectionsPage from './components/CollectionsPage';
import NavBar from './components/NavBar';
import 'bootstrap/dist/css/bootstrap.min.css';

// import UsersPage from './components/UsersPage';
// import CardsCollection from './components/CardsCollection';

import styles from './styles.module.css'

// export const App = () => {
//   // const wallet = useWallet()

  

//   return (
//     
    
//    {/* --------------------- MINT CARD ------------------------------ */}
       
//       <h1>Mint card </h1>
       
      
//       <form method="post" onSubmit={mintCardSubmit}>
//       <label>
//         User receiving NFT: <input name="address"/>
//       </label>
//       <label>
//          Card URI: <input name="tokenURI"/>
//       </label>
//       <label>
//          CollectionID: <input name="collectionId"/>
//       </label>
//       <button type="submit" > mintCard </button>
//       </form>
    
//     {/* ---------------------------------------------------------------------- */}

     

//     </div>
//   )
// }

// ----------------------------------------------------------------
export const App = () => {
  return (
    
    <Router>
      
      <NavBar />
      <div className={styles.body}>
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/collections" element={<CollectionsPage/>} />
        {/* <Route path="/users" element={UserPage} /> */}
        {/* <Route path="/cards/:collectionId" element={CardsCollection} /> */}
      </Routes>
      </div>
    </Router>
  );
}
