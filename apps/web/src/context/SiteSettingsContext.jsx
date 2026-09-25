import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { BRAND, WHATSAPP } from '../data/site';
import { readStorage, writeStorage } from '../utils/storage';

/**
 * Site-wide settings managed in the CMS (name, tagline, WhatsApp…).
 * Load order: last saved copy on this device → API. If the API is unreachable the
 * built-in defaults from data/site.js are used, so the site never breaks.
 */
const FALLBACK = {
  siteName: BRAND.name, tagline: BRAND.tagline, secondaryTagline: BRAND.secondary, description: BRAND.description,
  whatsappNumber: `+977 ${WHATSAPP.local}`, whatsappDigits: WHATSAPP.international, whatsappMessage: WHATSAPP.defaultMessage,
  contactPhone: null, contactEmail: null, socialLinks: null, footerText: null, logoUrl: null, faviconUrl: null, seo: {}, theme: null,
};
const CACHE_KEY = 'site-settings:v1';
const SiteSettingsContext = createContext({ settings: FALLBACK, source: 'default', reload: () => {} });

export function SiteSettingsProvider({ children }) {
  const [state, setState] = useState(() => {
    const cached = readStorage(CACHE_KEY, null);
    return cached ? { settings: { ...FALLBACK, ...cached }, source: 'cache' } : { settings: FALLBACK, source: 'default' };
  });
  const reload = useCallback(async () => {
    try {
      const s = await api.get('/site-settings', { timeoutMs: 8000 });
      writeStorage(CACHE_KEY, s);
      setState({ settings: { ...FALLBACK, ...s }, source: 'api' });
    } catch { /* keep cache/defaults */ }
  }, []);
  useEffect(() => { reload(); }, [reload]);
  const value = useMemo(() => ({ ...state, reload }), [state, reload]);
  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
}

export const useSiteSettings = () => useContext(SiteSettingsContext);

/** wa.me link for the current settings (digits only, message URL-encoded). */
export function useWhatsAppLink(message) {
  const { settings } = useSiteSettings();
  const digits = settings.whatsappDigits || String(settings.whatsappNumber || '').replace(/\D/g, '');
  const text = message ?? settings.whatsappMessage;
  return { href: `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`, number: settings.whatsappNumber, digits };
}
