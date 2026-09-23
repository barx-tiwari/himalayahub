import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const timer = useRef(null);

  const toast = useCallback((msg) => {
    setToastMsg(msg);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToastMsg(null), 2600);
  }, []);

  const value = useMemo(
    () => ({ searchOpen, setSearchOpen, shortcutsOpen, setShortcutsOpen, toast }),
    [searchOpen, shortcutsOpen, toast],
  );

  return (
    <UIContext.Provider value={value}>
      {children}
      <div aria-live="polite" role="status">
        {toastMsg && <div className="toast">{toastMsg}</div>}
      </div>
    </UIContext.Provider>
  );
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used inside UIProvider');
  return ctx;
}
