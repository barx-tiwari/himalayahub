/**
 * Client for the HimalayaHub REST API (apps/api).
 * - Sends the session cookie (credentials: 'include').
 * - Adds the X-CSRF-Token header on state-changing requests.
 * - Unwraps the { success, data, message } envelope; throws ApiError otherwise.
 *
 * VITE_API_URL: leave empty when the API is served from the same origin under /api
 * (Vite dev proxy locally; a rewrite in production). Set it for a separate API host.
 */
export const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, { status = 0, code, errors } = {}) {
    super(message);
    this.status = status; this.code = code; this.errors = errors || [];
  }
  /** { fieldName: message } for showing errors next to inputs. */
  get fieldErrors() { return Object.fromEntries(this.errors.map((e) => [e.path, e.message])); }
}

let csrfToken = null;
export const setCsrfToken = (t) => { csrfToken = t || null; };
function readCsrfCookie() {
  const m = document.cookie.match(/(?:^|;\s*)(?:__Host-)?hh_csrf=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

export async function api(path, { method = 'GET', body, signal, timeoutMs = 15000, full = false } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (method !== 'GET' && method !== 'HEAD') {
    const t = csrfToken || readCsrfCookie();
    if (t) headers['X-CSRF-Token'] = t;
  }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  signal?.addEventListener('abort', () => ctrl.abort());
  let res;
  try {
    res = await fetch(`${API_URL}/api${path}`, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined, credentials: 'include', signal: ctrl.signal });
  } catch (e) {
    if (signal?.aborted) throw e;
    throw new ApiError('Can’t reach the HimalayaHub server. Check your connection and try again.', { code: 'NETWORK' });
  } finally { clearTimeout(timer); }
  let json = null;
  try { json = await res.json(); } catch { /* non-JSON (e.g. proxy error page) */ }
  if (!res.ok || !json || json.success === false) {
    throw new ApiError(json?.message || (res.status >= 500 ? 'The server had a problem. Please try again.' : 'Request failed.'), { status: res.status, code: json?.code || (res.status >= 500 ? 'SERVER' : undefined), errors: json?.errors });
  }
  return full ? { data: json.data, meta: json.meta || null, message: json.message } : json.data;
}

api.get = (p, o) => api(p, { ...o, method: 'GET' });
api.post = (p, body, o) => api(p, { ...o, method: 'POST', body });
api.put = (p, body, o) => api(p, { ...o, method: 'PUT', body });
api.del = (p, o) => api(p, { ...o, method: 'DELETE' });

/** Uploads one file as the raw request body (the API checks the real type from its bytes). */
api.upload = async (path, file, { alt } = {}) => {
  const headers = { 'Content-Type': file.type || 'application/octet-stream', 'X-Filename': encodeURIComponent(file.name).slice(0, 120) };
  if (alt) headers['X-Alt'] = alt.slice(0, 200);
  const t = csrfToken || readCsrfCookie();
  if (t) headers['X-CSRF-Token'] = t;
  let res;
  try { res = await fetch(`${API_URL}/api${path}`, { method: 'POST', headers, body: file, credentials: 'include' }); } catch {
    throw new ApiError('Upload failed — check your connection and try again.', { code: 'NETWORK' });
  }
  let json = null; try { json = await res.json(); } catch { /* ignore */ }
  if (!res.ok || !json?.success) throw new ApiError(json?.message || (res.status === 413 ? 'That file is too large (max 8 MB).' : 'Upload failed.'), { status: res.status, code: json?.code, errors: json?.errors });
  return json.data;
};
