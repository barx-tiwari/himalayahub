/**
 * Weather via Open-Meteo (https://open-meteo.com): free, no API key, CORS-enabled.
 * Attribution required: "Weather data by Open-Meteo.com" (CC BY 4.0).
 * To switch providers, keep the normalised shape returned by normalize().
 */
import { requestJSON, ApiError } from './apiClient';
import { DEMO_MODE } from './config';
import { cleanText, num, arr } from '../utils/safe';

const FORECAST = 'https://api.open-meteo.com/v1/forecast';
const GEO = 'https://geocoding-api.open-meteo.com/v1/search';
export const WEATHER_SOURCE = { source: 'Open-Meteo.com', sourceUrl: 'https://open-meteo.com/' };

const PARAMS = {
  current: 'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,visibility,is_day,precipitation',
  hourly: 'precipitation_probability,uv_index',
  daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,sunrise,sunset,uv_index_max,wind_speed_10m_max',
  timezone: 'Asia/Kathmandu',
  forecast_days: '7',
};

/** WMO weather codes → label + emoji. */
const WMO = {
  0: ['Clear sky', '☀️', '🌙'], 1: ['Mainly clear', '🌤️', '🌙'], 2: ['Partly cloudy', '⛅', '☁️'], 3: ['Overcast', '☁️', '☁️'],
  45: ['Fog', '🌫️'], 48: ['Freezing fog', '🌫️'], 51: ['Light drizzle', '🌦️'], 53: ['Drizzle', '🌦️'], 55: ['Heavy drizzle', '🌧️'],
  56: ['Freezing drizzle', '🌧️'], 57: ['Freezing drizzle', '🌧️'], 61: ['Light rain', '🌦️'], 63: ['Rain', '🌧️'], 65: ['Heavy rain', '🌧️'],
  66: ['Freezing rain', '🌧️'], 67: ['Freezing rain', '🌧️'], 71: ['Light snow', '🌨️'], 73: ['Snow', '🌨️'], 75: ['Heavy snow', '❄️'], 77: ['Snow grains', '🌨️'],
  80: ['Rain showers', '🌦️'], 81: ['Rain showers', '🌧️'], 82: ['Violent rain showers', '⛈️'], 85: ['Snow showers', '🌨️'], 86: ['Heavy snow showers', '❄️'],
  95: ['Thunderstorm', '⛈️'], 96: ['Thunderstorm with hail', '⛈️'], 99: ['Thunderstorm with heavy hail', '⛈️'],
};
export function describe(code, isDay = 1) {
  const w = WMO[code];
  if (!w) return { label: 'Unknown', emoji: '🌡️' };
  return { label: w[0], emoji: !isDay && w[2] ? w[2] : w[1] };
}

/** Open-Meteo local times are Nepal time without an offset. */
const npt = (s) => (s ? new Date(`${s}+05:45`).toISOString() : null);

function normalize(raw) {
  if (!raw?.current || !raw?.daily) throw new ApiError('Unexpected weather response.', 200, 'invalid');
  const c = raw.current;
  const hourIdx = arr(raw.hourly?.time).findIndex((t) => t.slice(0, 13) === String(c.time).slice(0, 13));
  const d = raw.daily;
  const days = arr(d.time).map((date, i) => ({
    date,
    code: num(d.weather_code?.[i]), max: num(d.temperature_2m_max?.[i]), min: num(d.temperature_2m_min?.[i]),
    rainChance: num(d.precipitation_probability_max?.[i]), rainMm: num(d.precipitation_sum?.[i]),
    sunrise: d.sunrise?.[i] || null, sunset: d.sunset?.[i] || null, uvMax: num(d.uv_index_max?.[i]), windMax: num(d.wind_speed_10m_max?.[i]),
  }));
  return {
    lat: num(raw.latitude), lon: num(raw.longitude), elevation: num(raw.elevation),
    current: {
      time: npt(c.time), temp: num(c.temperature_2m), feelsLike: num(c.apparent_temperature), humidity: num(c.relative_humidity_2m),
      code: num(c.weather_code), windSpeed: num(c.wind_speed_10m), windDir: num(c.wind_direction_10m), visibility: num(c.visibility),
      isDay: num(c.is_day), precipitation: num(c.precipitation),
      rainChance: hourIdx >= 0 ? num(raw.hourly.precipitation_probability?.[hourIdx]) : days[0]?.rainChance ?? null,
      uv: hourIdx >= 0 ? num(raw.hourly.uv_index?.[hourIdx]) : null,
    },
    days,
  };
}

export async function getForecast(lat, lon) {
  if (DEMO_MODE) {
    const { demoWeather } = await import('./demo/fixtures');
    return { data: normalize(demoWeather(lat, lon)), meta: { source: 'Demo data', demo: true } };
  }
  const q = new URLSearchParams({ latitude: lat, longitude: lon, ...PARAMS });
  const data = normalize(await requestJSON(`${FORECAST}?${q}`));
  return { data, meta: { ...WEATHER_SOURCE, dataAsOf: data.current.time, realtime: false } };
}

/** Many locations in one request (Open-Meteo accepts comma-separated coordinates). */
export async function getForecastMany(places) {
  if (DEMO_MODE) {
    const { demoWeather } = await import('./demo/fixtures');
    const data = Object.fromEntries(places.map((p, i) => {
      const w = demoWeather(p.lat, p.lon);
      w.daily.precipitation_probability_max = w.daily.precipitation_probability_max.map((v, k) => (v + i * 13 + k) % 100);
      return [p.id, normalize(w)];
    }));
    return { data, meta: { source: 'Demo data', demo: true } };
  }
  const q = new URLSearchParams({ latitude: places.map((p) => p.lat).join(','), longitude: places.map((p) => p.lon).join(','), ...PARAMS });
  const raw = await requestJSON(`${FORECAST}?${q}`, { timeoutMs: 15000 });
  const list = Array.isArray(raw) ? raw : [raw];
  const data = {};
  places.forEach((p, i) => { try { if (list[i]) data[p.id] = normalize(list[i]); } catch { /* skip bad entry */ } });
  if (!Object.keys(data).length) throw new ApiError('No weather data returned.', 200, 'invalid');
  const first = Object.values(data)[0];
  return { data, meta: { ...WEATHER_SOURCE, dataAsOf: first.current.time, realtime: false } };
}

/** Search Nepal places by name (Open-Meteo geocoding, filtered to NP). */
export async function searchPlaces(name) {
  const q = new URLSearchParams({ name, count: '10', language: 'en', format: 'json', countryCode: 'NP' });
  const data = await requestJSON(`${GEO}?${q}`);
  return arr(data?.results).filter((r) => r.country_code === 'NP' && num(r.latitude) != null).map((r) => ({
    id: `geo-${r.id}`, name: cleanText(r.name, 60), district: cleanText(r.admin2 || r.admin3, 60), province: cleanText(r.admin1, 60),
    lat: num(r.latitude), lon: num(r.longitude),
  }));
}

export const OFFICIAL_WEATHER = { label: 'Department of Hydrology and Meteorology (Nepal)', url: 'https://www.dhm.gov.np/' };

/**
 * General, conservative travel suggestion from the forecast.
 * Never claims a place is "safe"; mountain areas always get an official-check note.
 */
export function travelAdvice(w, dest = {}, dayIndex = 0) {
  const d = w?.days?.[dayIndex];
  if (!d) return { level: 'info', score: null, messages: ['Forecast unavailable for this day.'] };
  const msgs = [];
  let level = 'good';
  let score = 100;
  const thunder = d.code >= 95;
  const heavyRain = (d.rainChance ?? 0) >= 80 && (d.rainMm ?? 0) >= 20;
  const windy = (d.windMax ?? 0) >= 50;
  if (thunder || heavyRain || windy) {
    level = 'warn'; score -= 60;
    msgs.push('Weather conditions may affect travel. Check official local advisories before travelling.');
    if (thunder) msgs.push('Thunderstorms are in the forecast.');
    if (windy) msgs.push(`Strong winds forecast (up to ${Math.round(d.windMax)} km/h).`);
  } else if ((d.rainChance ?? 0) >= 60 || (d.rainMm ?? 0) >= 5) {
    level = 'caution'; score -= 35;
    msgs.push('Rain is currently forecast. Consider indoor activities and check local travel conditions before travelling.');
  }
  if ((d.max ?? 0) >= 36) { score -= 20; if (level === 'good') level = 'caution'; msgs.push('Very hot daytime temperatures are forecast. Plan outdoor time for mornings and evenings.'); }
  if ((d.min ?? 99) <= -5) { score -= 15; if (level === 'good') level = 'caution'; msgs.push('Freezing night temperatures are forecast. Carry suitable clothing.'); }
  if (dest.viewDependent && dayIndex === 0 && ((w.current.visibility ?? 99999) < 5000 || [3, 45, 48].includes(w.current.code))) {
    score -= 15; msgs.push('Cloud or haze may limit mountain views right now.');
  }
  if (level === 'good') msgs.unshift('Current forecast appears suitable for outdoor sightseeing. Check the latest local forecast before travelling.');
  if (dest.mountain) msgs.push('This is a trekking/mountain area: forecasts here are less certain. Check official weather and local safety information before setting out.');
  return { level, score: Math.max(0, score), messages: msgs };
}
