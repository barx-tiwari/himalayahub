// Vercel serverless function: GET /api/cricket  (logic lives in _lib/handlers.js)
import { cricket } from './_lib/handlers.js';
import { toNode } from './_lib/http.js';

export default toNode(cricket);
