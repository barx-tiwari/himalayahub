import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { destinations as PLACES } from '../data/nepalPlaces';
import { hiddenGems } from '../data/hiddenGems';

/** Hidden Gems in the destination shape, so Explore Nepal, the map and search list them offline too. */
const GEMS_AS_DESTINATIONS = hiddenGems.map((g) => ({
  id: g.slug, name: g.name, province: g.province, district: g.district, zone: (g.elevationM ?? 0) >= 3000 ? 'himalaya' : 'hill',
  lat: g.lat, lon: g.lon, tagline: g.tagline, knownFor: g.tagline, tags: g.tags || [], activities: g.activities || [],
  bestTime: g.bestTime || '', photos: g.photos || [], hiddenGem: true, region: 'eastern', emoji: '💎', sortOrder: 100 + g.rank,
  mountain: (g.elevationM ?? 0) >= 3000,
}));
const BUNDLED = [...PLACES, ...GEMS_AS_DESTINATIONS.filter((g) => !PLACES.some((p) => p.id === g.id))];
import { readStorage, writeStorage } from '../utils/storage';

/**
 * Destinations managed in the CMS. Shows the last saved list (or the bundled list) instantly,
 * then loads the published list from the API. If the API is unreachable the bundled data is
 * used, so Explore Nepal, the homepage, the map and the finder always work.
 */
const CACHE_KEY = 'destinations:v1';
const Ctx = createContext(null);

const withDefaults = (d, i) => ({
  tags: [], activities: [], nearbyAttractions: [], tips: [], safety: [], nearby: [], photos: [], emoji: '📍', outdoor: true,
  bestTime: '', duration: '', travel: '', tagline: '', knownFor: '', sortOrder: i, ...d,
});

export function DestinationsProvider({ children }) {
  const [state, setState] = useState(() => {
    const cached = readStorage(CACHE_KEY, null);
    return cached?.length ? { list: cached.map(withDefaults), source: 'cache', status: 'loading' } : { list: BUNDLED.map(withDefaults), source: 'bundled', status: 'loading' };
  });
  const reload = useCallback(async () => {
    try {
      const list = await api.get('/destinations?limit=100', { timeoutMs: 10000 });
      if (!Array.isArray(list)) throw new Error('Unexpected response');
      writeStorage(CACHE_KEY, list);
      // Seeded gems may have no gallery rows yet: fall back to the bundled photos for them.
      const merged = list.map((d) => { const g = GEMS_AS_DESTINATIONS.find((x) => x.id === d.id); return g && !(d.photos?.length) ? { ...d, photos: g.photos, hiddenGem: true } : g ? { ...d, hiddenGem: true } : d; });
      setState({ list: merged.map(withDefaults), source: 'api', status: 'ready' });
    } catch {
      setState((s) => ({ ...s, status: 'ready' })); // keep cache/bundled data
    }
  }, []);
  useEffect(() => { reload(); }, [reload]);

  const value = useMemo(() => {
    const byId = new Map(state.list.map((d) => [d.id, d]));
    const sorted = [...state.list].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    return {
      destinations: sorted,
      featured: sorted.filter((d) => d.featured),
      getDestination: (id) => byId.get(id),
      source: state.source, status: state.status, reload,
    };
  }, [state, reload]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDestinations() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useDestinations must be used inside DestinationsProvider');
  return v;
}
