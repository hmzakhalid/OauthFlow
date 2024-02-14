import express from "express";
import OAuth2Server from "@node-oauth/oauth2-server";

const app = express();
const Request = OAuth2Server.Request;
const Response = OAuth2Server.Response;
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const model = {
    getAccessToken: () => { },
    getRefreshToken: () => { },
    getClient: () => { },
    getUser: () => { },
    saveToken: () => { },
    saveAuthorizationCode: () => { },
    revokeToken: () => { },
    validateScope: () => { },
    verifyScope: () => { },
};

const oauth = new OAuth2Server({
    model,
});

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.post("/login", (req, res) => {
    const { username, password } = req.body;
    console.log(username, password);

    res.send("Login");
});

app.listen(PORT || 3000, () => {
    console.log("Server is running on port 3000");
});
