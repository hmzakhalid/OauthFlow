/* global React ReactDOM ReactBootstrap ace */
const { Form, Container, Button, Spinner, Modal, Row, Col } = ReactBootstrap;
const { useState, useEffect } = React;

// Minimal OAuth2 client
const App = () => {
    const handleSignIn = () => {
        window.location.href = 'http://localhost:3001/auth';
    }

    return (
        <Container>
            <Row>
                <Col>
                    <h1>OAuth2 Client</h1>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Button onClick={handleSignIn}>Sign In with 0xAuth</Button>
                </Col>
            </Row>
        </Container>
    );
};

const domContainer = document.querySelector('#app');
const root = ReactDOM.createRoot(domContainer);
root.render(<App />);