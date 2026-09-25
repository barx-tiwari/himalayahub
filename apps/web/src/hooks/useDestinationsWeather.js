import { useLiveDataRefresh } from './useLiveDataRefresh';
import { getForecastMany } from '../services/weatherService';
import { REFRESH } from '../services/config';
import { useDestinations } from '../context/DestinationsContext';

/** One shared request for every destination's forecast. The cache key follows the current list. */
export function useDestinationsWeather() {
  const { destinations } = useDestinations();
  const ids = destinations.map((d) => d.id).join(',');
  let h = 0; for (let i = 0; i < ids.length; i += 1) h = (Math.imul(31, h) + ids.charCodeAt(i)) | 0;
  return useLiveDataRefresh(`weather:destinations:${(h >>> 0).toString(36)}`, () => getForecastMany(destinations), { interval: REFRESH.weather.base });
}
