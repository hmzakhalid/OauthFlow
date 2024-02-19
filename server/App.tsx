import { useState, useEffect } from 'react'
import { Form, Container, Button, Row, Col } from 'react-bootstrap';

function App() {
  const [redirectUri, setRedirectUri] = useState('');
    const [clientId, setClientId] = useState('');
    const [state, setState] = useState('');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setRedirectUri(params.get('redirect_uri')!);
        setClientId(params.get('client_id')!);
        setState(params.get('state')!);
    }, []);

    const handleLogin = async (e: any) => {
        e.preventDefault();
        const username = e.target.username.value;
        const password = e.target.password.value;

        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
                credentials: 'include',
            });

            if (response.ok) {
                window.location.href = `http://localhost:3000/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}`;

            } else {
                alert('Invalid credentials');
            }
        } catch (error) {
            console.error('Login error:', error);
        }
    };


    return (
        <Container>
            <Row>
                <Col>
                    <h1>OAuth2 Client</h1>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form onSubmit={handleLogin}>
                        <Form.Group controlId="username">
                            <Form.Label>Username</Form.Label>
                            <Form.Control type="text" placeholder="Enter username" />
                        </Form.Group>
                        <Form.Group controlId="password">
                            <Form.Label>Password</Form.Label>
                            <Form.Control type="password" placeholder="Password" />
                        </Form.Group>
                        <Button type="submit">Login</Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
}

export default App
