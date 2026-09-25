import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from './client';

/**
 * Minimal data hook: loading / error / retry / refetch with request cancellation.
 * Deliberately small and dependency-free; can be swapped for TanStack Query later
 * without changing callers much (same { data, error, status, refetch } shape).
 */
export function useApi(path, { enabled = true, full = false } = {}) {
  const [state, setState] = useState({ data: undefined, error: null, status: enabled && path ? 'loading' : 'idle' });
  const ctrlRef = useRef(null);
  const load = useCallback(async () => {
    if (!enabled || !path) return;
    ctrlRef.current?.abort();
    const ctrl = new AbortController(); ctrlRef.current = ctrl;
    setState((s) => ({ ...s, status: s.data === undefined ? 'loading' : 'refreshing', error: null }));
    try {
      const data = await api.get(path, { signal: ctrl.signal, full });
      if (!ctrl.signal.aborted) setState({ data, error: null, status: 'success' });
    } catch (error) {
      if (!ctrl.signal.aborted) setState((s) => ({ ...s, error, status: 'error' }));
    }
  }, [path, enabled, full]);
  useEffect(() => { load(); return () => ctrlRef.current?.abort(); }, [load]);
  return { ...state, refetch: load };
}
