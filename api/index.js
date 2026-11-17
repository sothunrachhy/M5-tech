// Vercel serverless entry: every /api/* request is routed here (see vercel.json).
// The React site itself is served as static files from client/dist by Vercel's CDN.
import { createApp } from '../server/src/app.js';

export default createApp({ serveClient: false });
