import { useMemo } from 'react';
import { useApi } from '../api/useApi';
import { hiddenGems as bundled } from '../data/hiddenGems';

/** API destination (isHiddenGem) → the bundled gem shape. The CMS copy wins where it has data. */
function fromApi(d) {
  const local = bundled.find((g) => g.slug === d.id) || {};
  const guide = d.guide || {};
  return {
    ...local,
    slug: d.id, name: d.name, district: d.district ?? local.district, province: d.province, lat: d.lat, lon: d.lon,
    rank: d.hiddenGemRank ?? local.rank, tagline: d.tagline || local.tagline, elevationM: d.elevationM ?? local.elevationM,
    difficulty: d.difficulty ?? local.difficulty, distanceFromKtmKm: d.distanceFromKtmKm ?? local.distanceFromKtmKm,
    bestTime: d.bestTime || local.bestTime, activities: d.activities?.length ? d.activities : local.activities,
    safety: d.safety?.length ? d.safety : local.safety, photos: d.photos?.length ? d.photos : local.photos || [],
    ...Object.fromEntries(Object.entries(guide).filter(([, v]) => v != null)),
    wildlife: guide.adventure?.wildlife || local.wildlife, camping: guide.adventure?.camping || local.camping,
    fromCms: true,
  };
}

export function useHiddenGems() {
  const r = useApi('/destinations?hiddenGem=true&limit=50');
  return useMemo(() => {
    const list = Array.isArray(r.data) && r.data.length ? r.data.map(fromApi).sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99)) : bundled;
    return { gems: list, status: r.status, offline: r.status === 'error' };
  }, [r.data, r.status]);
}

export function useHiddenGem(slug) {
  const r = useApi(slug ? `/destinations/${slug}` : null);
  return useMemo(() => {
    if (r.data && r.data.hiddenGem) return { gem: fromApi(r.data), status: 'success' };
    const local = bundled.find((g) => g.slug === slug);
    if (r.status === 'loading' && !local) return { gem: null, status: 'loading' };
    return { gem: local || null, status: local ? 'success' : r.status === 'loading' ? 'loading' : 'notfound', offline: r.status === 'error' };
  }, [r.data, r.status, slug]);
}
