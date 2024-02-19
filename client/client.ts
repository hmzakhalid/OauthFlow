import express from "express";
import axios from "axios";
import open from "open";
import { URLSearchParams } from "url";


const app = express();
const PORT = 3001;

app.use(express.static("client/html"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const client_id = 'client1';
const client_secret = 'secret1';
const redirect_uri = 'http://localhost:3001/callback';
app.get('/auth', (req, res) => {
    const state = Math.random().toString(36).slice(2);
    const url = `http://localhost:3000/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code&state=${state}`;
    open(url);
    res.send('Please check your browser to authenticate.');
});

app.get('/callback', (req, res) => {
    const { code } = req.query;
    console.log('Code:', code);
    const data = new URLSearchParams();
    data.append('client_id', client_id);
    data.append('client_secret', client_secret);
    data.append('redirect_uri', redirect_uri);
    data.append('code', code?.toString() || '');
    data.append('grant_type', 'authorization_code');
    axios.post('http://localhost:3000/token', data, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }

    }).then(response => {
        const { accessToken } = response.data;
        console.log('Access Token:', accessToken);
        axios.get('http://localhost:3000/user', {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        }).then(response => {
            console.log('User:', response.data);
            res.send(response.data);
        }).catch(err => {
            res.send(err);
        });
    }).catch(error => {
        res.send(error);
    });
});



app.listen(PORT || 3001, () => {
    console.log("Server is running on port 3001");
});
