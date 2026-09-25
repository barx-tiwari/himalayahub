import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, API_URL, setCsrfToken } from '../api/client';
import { productRole } from '@shared/rbac';

const GUEST_KEY = 'himalayahub:guest';
const readGuest = () => { try { return localStorage.getItem(GUEST_KEY) === '1'; } catch { return false; } };

const AuthContext = createContext(null);

/**
 * Account session from the API (httpOnly cookie). Separate from the older on-device
 * "profile" in ProgressContext, which keeps working for visitors who never sign in.
 * `apiDown` is true when the server can't be reached — the public site still works.
 */
export function AuthProvider({ children }) {
  const [state, setState] = useState({ status: 'loading', user: null, permissions: [], apiDown: false });
  const [guest, setGuest] = useState(readGuest);
  const [providers, setProviders] = useState({ password: true, google: false, apple: false });
  useEffect(() => { api.get('/auth/providers').then(setProviders).catch(() => {}); }, []);

  const refresh = useCallback(async () => {
    try {
      const d = await api.get('/auth/me');
      setCsrfToken(d.csrfToken);
      setState({ status: 'ready', user: d.user, permissions: d.permissions || [], apiDown: false });
      return d.user;
    } catch (e) {
      setState({ status: 'ready', user: null, permissions: [], apiDown: e.code === 'NETWORK' || e.status >= 500 || e.status === 404 });
      return null;
    }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);

  const login = useCallback(async (email, password) => {
    const d = await api.post('/auth/login', { email, password });
    setCsrfToken(d.csrfToken);
    return refresh();
  }, [refresh]);

  const register = useCallback(async (name, email, password) => {
    const d = await api.post('/auth/register', { name, email, password }, { full: true });
    setCsrfToken(d.data.csrfToken);
    await refresh();
    return { mailSent: d.data.mailSent !== false, message: d.message };
  }, [refresh]);
  /** Email OTP: confirm the signed-in account with the 6-digit code, or ask for a new one. */
  const verifyOtp = useCallback(async (code) => { await api.post('/auth/verify-otp', { code }); return refresh(); }, [refresh]);
  const resendOtp = useCallback(async () => (await api.post('/auth/resend-verification', undefined, { full: true })).message, []);

  /** Guest = "Visitor": browse everything, nothing is sent to the server, no account created. */
  const continueAsGuest = useCallback(() => { try { localStorage.setItem(GUEST_KEY, '1'); } catch { /* private mode */ } setGuest(true); }, []);
  const leaveGuest = useCallback(() => { try { localStorage.removeItem(GUEST_KEY); } catch { /* ignore */ } setGuest(false); }, []);
  /** Full-page redirects: OAuth must run in the top window. */
  const oauthUrl = useCallback((provider) => `${API_URL}/api/auth/${provider}`, []);

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout'); } finally { setCsrfToken(null); setState((s) => ({ ...s, user: null, permissions: [] })); }
  }, []);

  const can = useCallback((perm) => state.permissions.includes(perm), [state.permissions]);
  const value = useMemo(() => ({
    ...state, refresh, login, register, verifyOtp, resendOtp, logout, can, providers, oauthUrl,
    guest: guest && !state.user, continueAsGuest, leaveGuest,
    role: productRole(state.user), isStaff: state.permissions.includes('cms.access'),
  }), [state, refresh, login, register, verifyOtp, resendOtp, logout, can, providers, oauthUrl, guest, continueAsGuest, leaveGuest]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
