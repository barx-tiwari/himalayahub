// Vercel serverless function: GET /api/gold  (logic lives in _lib/handlers.js)
import { gold } from './_lib/handlers.js';
import { toNode } from './_lib/http.js';

export default toNode(gold);
