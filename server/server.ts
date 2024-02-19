import express from "express";
import expressSession from "express-session";
import OAuth2Server, { AuthorizationCode, Client, Token, User } from "@node-oauth/oauth2-server";


const app = express();
const Request = OAuth2Server.Request;
const Response = OAuth2Server.Response;
const PORT = 3000;

app.use(express.static("server/html"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(expressSession({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: !true } // Set to true in production with HTTPS
}));

// In-memory data storage for simplicity
let users: User[] = [{ id: '1', username: 'test', password: 'password' }];
let clients: Client[] = [{ id: '1123', clientId: "client1", clientSecret: 'secret1', redirectUris: ['http://localhost:3001/callback'], grants: ['authorization_code'] }];
let tokens: Token[] = [];
let authorizationCodes: AuthorizationCode[] = [];

const model: OAuth2Server.AuthorizationCodeModel = {
    getClient: async (clientId: string, clientSecret: string) => {
        return clients.find(client => client.clientId === clientId && (clientSecret == null || client.clientSecret === clientSecret));
    },
    // generateAuthorizationCode: async (client: Client, user: User, scope: string[]) => {
    //     console.log('generateAuthorizationCode:', client, user, scope)
    //     return Math.random().toString(36).slice(2);
    // },
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
        return Token;
    },
    saveAuthorizationCode: async (code: AuthorizationCode, client: Client, user: User) => {
        const savedCode = { ...code, clientId: client.id, userId: user.id, client, user };
        authorizationCodes.push(savedCode);
        return savedCode;
    },
    revokeAuthorizationCode: async (code: AuthorizationCode) => {
        const index = authorizationCodes.findIndex(c => c.authorizationCode === code.authorizationCode);
        console.log('revokeAuthorizationCode:', code, index)
        if (index !== -1) {
            authorizationCodes.splice(index, 1);
            return true;
        }
        return false;
    }
};

const oauth = new OAuth2Server({
    model,
    // This is where we have to authenticate the user, commented out for now
    // authenticateHandler: {
    //     handle: (req: any) => {
    //         return req.session.user;
    //     }
    accessTokenLifetime: 60 * 60,
    allowBearerTokensInQueryString: true,
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Simple authentication for demonstration
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        req.session.user = user; // Store user in session
        res.json({ success: true });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// OAuth authorization endpoint
app.get('/authorize', async (req, res) => {

    const { client_id, redirect_uri, state } = req.query;
    if (!req.session.user) {
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
