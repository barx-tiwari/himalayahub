// Vercel serverless function: GET /api/football  (logic lives in _lib/handlers.js)
import { football } from './_lib/handlers.js';
import { toNode } from './_lib/http.js';

export default toNode(football);
