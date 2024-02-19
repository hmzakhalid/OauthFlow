import express from "express";
import axios from "axios";
import open from "open";
import { URLSearchParams, fileURLToPath } from "url";
import path, { dirname } from "path";
const __dirname = dirname(fileURLToPath(import.meta.url));


const app = express();
const PORT = 3001;

app.use(express.static("client/dist"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let users: any = []
const client_id = 'client1';
const client_secret = 'secret1';
const redirect_uri = 'http://localhost:3001/callback';

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
        console.log('Response:', response.data);
        const { accessToken } = response.data;
        axios.get('http://localhost:3000/user', {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        }).then(response => {
            users = response.data.user;
            res.redirect('/success');
        }).catch(err => {
            res.send(err);
        });
    }).catch(error => {
        res.send(error);
    });
});

app.get('/user', (req, res) => {
    res.json(users);
});


app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT || 3001, () => {
    console.log("Server is running on port 3001");
});
