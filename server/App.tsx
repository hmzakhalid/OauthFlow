import { useState, useEffect } from 'react'
import { Form, Container, Button, Row, Col } from 'react-bootstrap';
import { DynamicWidget, useDynamicContext } from '@dynamic-labs/sdk-react-core';


function App() {
    const [redirectUri, setRedirectUri] = useState('');
    const [clientId, setClientId] = useState('');
    const [state, setState] = useState('');
    const [verifed, setVerified] = useState(false);

    const { authToken } = useDynamicContext();


    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setRedirectUri(params.get('redirect_uri')!);
        setClientId(params.get('client_id')!);
        setState(params.get('state')!);
    }, []);


    useEffect(() => {
        if (authToken && redirectUri && clientId && state) {
            console.log('Auth Success:', authToken);
            fetch('http://localhost:3000/auth/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ authToken }),
            })
                .then(response => response.json())
                .then(data => {
                    setVerified(true);
                    // window.location.href = `http://localhost:3000/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}`;
                    console.log('Success:', data);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        }
    }, [authToken, redirectUri, clientId, state]);

    return (
        <Container>
            <Row>
                <Col>
                    <h1>0xAuth</h1>
                </Col>
            </Row>
            <Row>
                <Col>
                    <DynamicWidget />
                </Col>
                {verifed && (
                    <button
                        onClick={() => {
                            window.location.href = `http://localhost:3000/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}`;
                        }}
                    >
                        Authorize
                    </button>
                )}
            </Row>
        </Container>
    );
}

export default App
