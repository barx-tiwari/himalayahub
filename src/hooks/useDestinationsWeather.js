import { useLiveDataRefresh } from './useLiveDataRefresh';
import { getForecastMany } from '../services/weatherService';
import { REFRESH } from '../services/config';
import { destinations } from '../data/nepalPlaces';

/** One shared request for every destination's forecast (home, Explore, Where to go, destination pages). */
export function useDestinationsWeather() {
  return useLiveDataRefresh('weather:destinations:v2', () => getForecastMany(destinations), { interval: REFRESH.weather.base });
}
