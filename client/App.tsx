import { Container, Button, Row, Col } from 'react-bootstrap';
import { useState } from 'react';


function App() {

  const [user, setUser] = useState({} as any);

  const handleSignIn = () => {

    const client_id = 'client1';
    const redirect_uri = 'http://localhost:3001/callback';
    const state = Math.random().toString(36).slice(2);
    const authUrl = `http://localhost:3000/authorize?client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&response_type=code&state=${state}`;

    // Open a new window
    const authWindow = window.open(authUrl, 'AuthWindow', 'width=600,height=600');

    // Polling to check if the window is closed
    const pollTimer = setInterval(function () {
      if (authWindow!.closed !== false) { // !== is required for compatibility with Opera
        clearInterval(pollTimer);
        console.log('Authentication window closed');

        fetch('http://localhost:3001/user').then(response => response.json())
          .then(data => {
            console.log('User:', data);
            setUser(data);
          })
          .catch(err => {
            console.error('Error:', err);
          });
      }
    }, 200);
  }

  return (
    <Container>
      <Row>
        <Col>
          <h1>Moonfair Client</h1>
        </Col>
      </Row>
      <Row>
        <Col>
          {Object.keys(user).length > 0 ? (<>
            <h2>User</h2>
            <pre>{JSON.stringify(user, null, 2)}</pre>
          </>
          ) :
            <Button onClick={handleSignIn}>Sign In with 0xAuth</Button>
          }
        </Col>
      </Row>
    </Container>
  )
}

export default App
