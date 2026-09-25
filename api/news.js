// Vercel serverless function: GET /api/news  (logic lives in _lib/handlers.js)
import { news } from './_lib/handlers.js';
import { toNode } from './_lib/http.js';

export default toNode(news);
