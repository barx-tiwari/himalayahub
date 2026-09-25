/**
 * Weather-based travel suggestion engine (pure; used by the API and usable in the web app).
 * It classifies conditions, it never certifies safety.
 */
export interface Conditions {
  temperature?: number | null; rainProbability?: number | null; windSpeed?: number | null;
  visibility?: number | null; weatherCode?: number | null;
}
export type Suitability = 'SUITABLE' | 'MIXED' | 'POOR' | 'SEVERE' | 'UNKNOWN';

export const SUITABILITY_MESSAGE: Record<Suitability, string> = {
  SUITABLE: 'Conditions appear suitable for outdoor sightseeing. Check the latest local forecast before travelling.',
  MIXED: 'Conditions are mixed. Plan flexible outdoor time and check local conditions before travelling.',
  POOR: 'Rain is currently forecast. Consider indoor activities and check local travel conditions before travelling.',
  SEVERE: 'Weather conditions may affect travel. Check official local advisories before travelling.',
  UNKNOWN: 'Forecast unavailable. Check official local forecasts before travelling.',
};

export function classify(c: Conditions): { level: Suitability; score: number; message: string } {
  const has = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
  if (!has(c.temperature) && !has(c.rainProbability)) return { level: 'UNKNOWN', score: 0, message: SUITABILITY_MESSAGE.UNKNOWN };
  const thunder = has(c.weatherCode) && c.weatherCode >= 95;
  const wind = has(c.windSpeed) ? c.windSpeed : 0;
  const rain = has(c.rainProbability) ? c.rainProbability : 0;
  const temp = has(c.temperature) ? c.temperature : 20;
  const vis = has(c.visibility) ? c.visibility : 10_000;
  let level: Suitability;
  if (thunder || wind >= 50) level = 'SEVERE';
  else if (rain >= 60) level = 'POOR';
  else if (rain < 20 && temp >= 15 && temp <= 30 && vis >= 5000) level = 'SUITABLE';
  else level = 'MIXED';
  const score = Math.max(0, Math.round(100 - rain * 0.6 - Math.max(0, Math.abs(temp - 22) - 6) * 3 - Math.max(0, wind - 20) - (vis < 5000 ? 15 : 0) - (thunder ? 60 : 0)));
  return { level, score, message: SUITABILITY_MESSAGE[level] };
}
