// Vercel serverless function: GET /api/nepse  (logic lives in _lib/handlers.js)
import { nepse } from './_lib/handlers.js';
import { toNode } from './_lib/http.js';

export default toNode(nepse);
