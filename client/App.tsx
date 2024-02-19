import { Container, Button, Row, Col } from 'react-bootstrap';

function App() {
  const handleSignIn = () => {
    window.location.href = 'http://localhost:3001/auth';
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
                    <Button onClick={handleSignIn}>Sign In with 0xAuth</Button>
                </Col>
            </Row>
        </Container>
  )
}

export default App
