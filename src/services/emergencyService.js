/**
 * Emergency contacts. Data is bundled (works offline). Optionally set
 * VITE_EMERGENCY_DATA_URL to a JSON file you maintain with the same shape as
 * data/emergencyContacts.js to update numbers without redeploying.
 */
import { requestJSON } from './apiClient';
import { nationalContacts, districtContacts, officialDirectories, LAST_REVIEWED } from '../data/emergencyContacts';
import { arr, cleanText, safeUrl } from '../utils/safe';

const REMOTE = import.meta.env.VITE_EMERGENCY_DATA_URL || '';

const valid = (c) => c && typeof c.service === 'string' && (c.number === null || /^[+\d][\d\s-]{1,20}$/.test(String(c.number))) && (c.sourceUrl === null || safeUrl(c.sourceUrl));

export async function loadEmergencyData() {
  if (!REMOTE) return { national: nationalContacts, districts: districtContacts, reviewed: LAST_REVIEWED, remote: false };
  try {
    const d = await requestJSON(REMOTE);
    const national = arr(d.national).filter(valid);
    if (!national.length) throw new Error('empty');
    return { national, districts: d.districts || {}, reviewed: cleanText(d.reviewed, 12) || LAST_REVIEWED, remote: true };
  } catch {
    return { national: nationalContacts, districts: districtContacts, reviewed: LAST_REVIEWED, remote: false };
  }
}

export function areaContacts(districts, district, municipality) {
  const d = districts?.[district];
  if (!d) return { contacts: [], municipalities: [], municipalityContacts: [] };
  return {
    contacts: arr(d.contacts).filter(valid),
    municipalities: Object.keys(d.municipalities || {}),
    municipalityContacts: municipality ? arr(d.municipalities?.[municipality]).filter(valid) : [],
  };
}

export const telHref = (n) => `tel:${String(n).replace(/[^\d+]/g, '')}`;
export { officialDirectories };
