import express from "express";
import OAuth2Server, { AuthorizationCode, Client, Token, User } from "@node-oauth/oauth2-server";


const app = express();
const Request = OAuth2Server.Request;
const Response = OAuth2Server.Response;
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory data storage for simplicity
let users: User[] = [{ id: '1', username: 'test', password: 'password' }];
let clients: Client[] = [{ id: 'client1', clientSecret: 'secret1', redirectUris: ['http://localhost:3001/callback'], grants: ['authorization_code'] }];
let tokens: Token[] = [];
let authorizationCodes: AuthorizationCode[] = [];

const model: OAuth2Server.AuthorizationCodeModel = {
    getAccessToken: async (accessToken: string) => {
        return tokens.find(token => token.accessToken === accessToken) as OAuth2Server.Token;
    },
    getAuthorizationCode: async (authorizationCode: string) => {
        return authorizationCodes.find(code => code.authorizationCode === authorizationCode);
    },
    getClient: async (clientId: string, clientSecret: string) => {
        return clients.find(client => client.clientId === clientId && client.clientSecret === clientSecret);
    },
    saveToken: async (token: Token, client: Client, user: User) => {
        const Token: Token = { ...token, user };
        tokens.push(Token);
        return Token;
    },
    saveAuthorizationCode: async (code: AuthorizationCode, client: Client, user: User) => {
        authorizationCodes.push(code);
        return code;
    },
    revokeAuthorizationCode: async (code: AuthorizationCode) => {
        const index = authorizationCodes.findIndex(c => c.authorizationCode === code.authorizationCode);
        if (index > -1) {
            authorizationCodes.splice(index, 1);
            return true;
        }
        return false;
    }
};

const oauth = new OAuth2Server({
    model,
    accessTokenLifetime: 60 * 60,
    allowBearerTokensInQueryString: true,
});

// OAuth authorization endpoint
app.get('/authorize', async (req, res) => {
    const request = new Request(req);
    const response = new Response(res);

    return oauth.authorize(request, response, {
        authenticateHandler: {
            handle: (req: any) => {
                req.user = users[0];
                // Should implement user authentication, simplified here
                return users[0]; // Assuming the first user is always the authenticated user
            }
        }
    }).then(code => {
        res.json(code);
    }).catch(err => {
        res.status(err.code || 500).json(err);
    });
});

// OAuth token endpoint
app.post('/token', async (req, res) => {
    const request = new Request(req);
    const response = new Response(res);

    return oauth.token(request, response).then(token => {
        res.json(token);
    }).catch(err => {
        res.status(err.code || 500).json(err);
    });
});

// Protected resource endpoint
app.get('/user', async (req, res) => {
    const request = new Request(req);
    const response = new Response(res);

    return oauth.authenticate(request, response).then(token => {
        res.json({ user: token.user }); // In a real app, fetch user data based on the token
    }).catch(err => {
        res.status(err.code || 500).json(err);
    });
});

app.listen(PORT || 3000, () => {
    console.log("Server is running on port 3000");
});
