import express from "express";
import expressSession from "express-session";
import jwt from 'jsonwebtoken';
import OAuth2Server, { AuthorizationCode, Client, Token, User } from "@node-oauth/oauth2-server";
import dotenv from "dotenv";
dotenv.config();



const app = express();
const Request = OAuth2Server.Request;
const Response = OAuth2Server.Response;
const PORT = 3000;

app.use(express.static("server/dist"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(expressSession({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: !true } // Set to true in production with HTTPS
}));

// In-memory data storage for simplicity
let users: User[] = [{ id: '9ce9b091-6bf4-4733-a646-ce01a05577b7', email: 'local.test@yopmail.com', username: 'test', password: 'password' }];
let clients: Client[] = [{ id: '1123', clientId: "client1", clientSecret: 'secret1', redirectUris: ['http://localhost:3001/callback'], grants: ['authorization_code'] }];
let tokens: Token[] = [];
let authorizationCodes: AuthorizationCode[] = [];

const model: OAuth2Server.AuthorizationCodeModel = {
    getClient: async (clientId: string, clientSecret: string) => {
        const c = clients.find(client => client.clientId === clientId && (clientSecret == null || client.clientSecret === clientSecret));
        console.log('Client:', c);
        // Remove clientSecret from the client object before returning it
        if (c) {
            const { clientSecret, ...client } = c;
            return client;
        }
        return null;
    },
    getAccessToken: async (accessToken: string) => {
        return tokens.find(token => token.accessToken === accessToken) as OAuth2Server.Token;
    },
    getAuthorizationCode: async (authorizationCode) => {
        const code = authorizationCodes.find(c => c.authorizationCode === authorizationCode);
        if (!code) return null;

        const client = clients.find(client => client.id === code.clientId);
        const user = users.find(user => user.id === code.userId);

        if (!client || !user) return null;

        return { ...code, client, user: { id: user.id, username: user.username } };
    },
    saveToken: async (token: Token, client: Client, user: User) => {
        const Token: Token = { ...token, client, user };
        tokens.push(Token);
        const { authorizationCode, ...response } = Token;
        return response;
    },
    saveAuthorizationCode: async (code: AuthorizationCode, client: Client, user: User) => {
        const savedCode = { ...code, clientId: client.id, userId: user.id, client, user };
        authorizationCodes.push(savedCode);
        return savedCode;
    },
    revokeAuthorizationCode: async (code: AuthorizationCode) => {
        const index = authorizationCodes.findIndex(c => c.authorizationCode === code.authorizationCode);
        if (index !== -1) {
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



app.post('/auth/verify', async (req, res) => {
    const { authToken } = req.body;

    try {
        const publicKey = Buffer.from(process.env.DYNAMIC_PUBLIC_KEY!, 'base64').toString('utf-8');
        const decoded = jwt.verify(authToken, publicKey, {
            algorithms: ['RS256'],
        });
        if (typeof decoded === 'object') {
            const userDetails = { id: decoded.last_verified_credential_id, email: decoded.email };

            if (!req.session) {
                return res.status(500).send('Session handling not configured.');
            }
            req.session.user = userDetails;
        } else {
            return res.status(401).json({ success: false, message: 'Invalid token.' });
        }

        res.json({ success: true, message: 'User authenticated and session set.' });
    } catch (error) {
        console.error('Error verifying JWT:', error);
        res.status(401).json({ success: false, message: 'Invalid token.' });
    }
});

// OAuth authorization endpoint
app.get('/authorize', async (req, res) => {
    console.log('Query:', req.query);

    const { client_id, redirect_uri, state } = req.query;
    if (!req.session.user) {
        console.log('User not authenticated');
        if (typeof client_id === 'string' && typeof redirect_uri === 'string' && typeof state === 'string') {
            return res.redirect(`http://localhost:3000/?client_id=${client_id}&redirect_uri=${encodeURIComponent(`${redirect_uri}`)}&response_type=code&state=${state}`);

        } else {
            return res.status(400).send("Invalid query parameters");
        }
    }

    const request = new Request(req);
    const response = new Response(res);

    return oauth.authorize(request, response, {
        authenticateHandler: {
            handle: (req: any) => {
                // User is already authenticated so return the user
                return req.session.user;
            }
        }
    }).then(code => {
        const redirectUri = `${req.query.redirect_uri}?code=${code.authorizationCode}`;
        res.redirect(redirectUri);
        // res.json(code);
    }).catch(err => {
        console.error(err);
        res.status(err.code || 500).json(err);
    });
});

// OAuth token endpoint
app.post('/token', async (req, res) => {
    const request = new Request(req);
    const response = new Response(res);

    console.log('Request:', request.body);

    return oauth.token(request, response).then(token => {
        console.log('Token:', token);
        res.json(token);
    }).catch(err => {
        console.error(err);
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
