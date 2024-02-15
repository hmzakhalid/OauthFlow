import express from "express";
import axios from "axios";
import open from "open";


const app = express();
const PORT = 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const client_id = 'client1';
const client_secret = 'secret1';
const redirect_uri = 'http://localhost:3001/callback';
app.get('/auth', (req, res) => {
    const url = `http://localhost:3000/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code`;
    open(url);
    res.send('Please check your browser to authenticate.');
});

app.get('/callback', (req, res) => {
    const { code } = req.query;
    axios.post('http://localhost:3000/token', {
        client_id,
        client_secret,
        redirect_uri,
        code,
        grant_type: 'authorization_code',
    }).then(response => {
        const { access_token } = response.data;
        console.log('Access Token:', access_token);
        axios.get('http://localhost:3000/user', {
            headers: { 'Authorization': `Bearer ${access_token}` }
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
