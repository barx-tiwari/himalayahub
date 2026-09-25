// Vercel serverless function: GET /api/f1  (logic lives in _lib/handlers.js)
import { f1 } from './_lib/handlers.js';
import { toNode } from './_lib/http.js';

export default toNode(f1);
