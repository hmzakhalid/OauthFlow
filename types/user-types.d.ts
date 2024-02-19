import 'express-session';

declare module 'express-session' {
    export interface SessionData {
        user?: any; // Adjust according to your user object's type
    }
}
