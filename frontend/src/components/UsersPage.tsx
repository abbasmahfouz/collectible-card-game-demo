import React, { useState, useEffect } from 'react';
import { Card, Container, ListGroup, Col, Row } from 'react-bootstrap';

const SERVER = "http://127.0.0.1:5001/"

// Define types for User and Card
interface CardType {
  id: string;
  images: string;
}

interface User {
  address: string;
  cards: CardType[];
}

// Mock data for users 
// const mockUsers: User[] = [
//   {
//     address: "0x1234...abcd",
//     cards: [
//       { id: "1",  images:  "https://via.placeholder.com/150" } ,
//       { id: "2", images:  "https://via.placeholder.com/150" } ,
//     ],
//   },
//   {
//     address: "0x5678...efgh",
//     cards: [
//       { id: "3",  images:  "https://via.placeholder.com/150" } ,
//       { id: "4",  images:  "https://via.placeholder.com/150" } ,
//     ],
//   },
// ];

const MasterDetailView: React.FC = () => {
  const [mockUsers, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null); 

  const getUsers = async () => {
          const resp = await fetch(
              SERVER + "getUsers"
            )
          const data = await resp.json()
          
          const userData = Object.keys(data).map(
              o => ({
                address: data[o]["address"],
                cards: data[o]["cards"].map(
                    c => ({
                      id: c,
                      image: "https://images.pokemontcg.io/"+c.split("-")[0]+"/"+c.split("-")[1]+".png"
                    })
                  )
              }) 
            )
          console.log(userData)
          setUsers(userData)

          console.log(data)
        }

  useEffect(() => {
       getUsers()   
  }, [])


  console.log(mockUsers)
  // getUsers()

  return (
    <Container fluid className="vh-100 d-flex">
      <Row>
        {/* Users List - Sidebar */}
        <div
        style={{
          width: '400px', 
          backgroundColor: '#f8f9fa',
          padding: '20px',
          overflowY: 'auto',
        }}
        className="vh-100"
      ><h5>Users</h5>
          <ListGroup variant="flush">
            {mockUsers.map((user) => (
              <ListGroup.Item
                key={user.address}
                action
                active={selectedUser?.address === user.address}
                onClick={() => setSelectedUser(user)}
                style={{ cursor: 'pointer', fontWeight: selectedUser?.address === user.address ? 'bold' : 'normal', 
                backgroundColor: selectedUser?.address === user.address ? '#3B4CCA' : 'transparent'}}

              >
                {user.address}
              </ListGroup.Item>
            ))}
          </ListGroup>
          </div>

        {/* Detail View - Display Minted Cards */}
        <Col className="p-4 d-flex flex-column align-items-center overflow-auto">
          {selectedUser ? (
            <div className="w-100 text-center">
            <h4 className="mb-4">Minted Cards for user {selectedUser.address} </h4>
              <div className="d-flex flex-wrap justify-content-center">
                {selectedUser.cards.map((card) => (
                  <Card 
                  key={card.id} 
                  className="m-3" 
                  style={{ width: '150px' ,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer',}}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'none';}}>
                    <Card.Img variant="top" src={card.image} />               
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="d-flex justify-content-center align-items-center vh-100">

            <h4 className="text-center">Select a user to view minted cards</h4>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default MasterDetailView;
