/**
 * Small fetch wrapper shared by all services.
 * When you add a backend, point VITE_API_BASE_URL at it and use apiGet/apiPost.
 *
 * v2: errors now carry a `kind` so the UI can explain what went wrong
 * (not configured, rate limited, bad key, offline, invalid data) and every
 * response is checked to really be JSON — a static host that answers
 * /api/... with index.html must not be mistaken for data.
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export class ApiError extends Error {
  constructor(message, status, kind = 'http', detail = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.kind = kind; // 'network' | 'timeout' | 'http' | 'not_configured' | 'rate_limited' | 'auth' | 'invalid' | 'upstream'
    this.detail = detail;
  }
}

function kindForStatus(status, body) {
  if (body?.error === 'not_configured') return 'not_configured';
  if (status === 429 || body?.error === 'rate_limited') return 'rate_limited';
  if (status === 401 || status === 403 || body?.error === 'auth') return 'auth';
  if (status === 502 || status === 504 || body?.error === 'upstream') return 'upstream';
  return 'http';
}

export async function requestJSON(url, { method = 'GET', body, headers, timeoutMs = 10000, signal } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const onAbort = () => controller.abort();
  signal?.addEventListener?.('abort', onAbort);
  try {
    const res = await fetch(url, {
      method,
      headers: { Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}), ...headers },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    const type = res.headers.get('content-type') || '';
    let data = null;
    if (type.includes('json')) {
      try { data = await res.json(); } catch { data = null; }
    }
    if (!res.ok) {
      const kind = kindForStatus(res.status, data);
      throw new ApiError(data?.message || `Request failed with status ${res.status}`, res.status, kind, data);
    }
    if (data === null) throw new ApiError('The service did not return JSON data.', res.status, type.includes('html') ? 'not_configured' : 'invalid');
    return data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err.name === 'AbortError') throw new ApiError('The request timed out.', 0, 'timeout');
    throw new ApiError(err.message || 'Network error', 0, 'network');
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener?.('abort', onAbort);
  }
}

export const apiGet = (path) => requestJSON(`${API_BASE_URL}${path}`);
export const apiPost = (path, body) => requestJSON(`${API_BASE_URL}${path}`, { method: 'POST', body });
