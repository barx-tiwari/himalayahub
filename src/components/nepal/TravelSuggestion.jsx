import { AlertTriangle, CheckCircle2, CloudRain } from 'lucide-react';
import { describe, travelAdvice, OFFICIAL_WEATHER } from '../../services/weatherService';

const ICON = { good: CheckCircle2, caution: CloudRain, warn: AlertTriangle, info: AlertTriangle };

/** Current conditions + a conservative suggestion. Never says a place is "safe". */
export default function TravelSuggestion({ weather, dest, compact = false }) {
  const c = describe(weather.current.code, weather.current.isDay);
  const a = travelAdvice(weather, dest, 0);
  const I = ICON[a.level] || AlertTriangle;
  const rain = weather.current.rainChance ?? weather.days[0]?.rainChance;
  return (
    <div className={`travel-sugg level-${a.level}${compact ? ' compact' : ''}`}>
      <div className="ts-now">
        <span className="ts-emoji" aria-hidden="true">{c.emoji}</span>
        <div>
          <div className="ts-temp">{Number.isFinite(weather.current.temp) ? `${Math.round(weather.current.temp)}°C` : '—'}</div>
          <div className="ts-label">{c.label}</div>
          <div className="small muted">Rain probability: {Number.isFinite(rain) ? `${rain}%` : '—'}</div>
        </div>
      </div>
      <div className="ts-advice">
        <h3><I aria-hidden="true" />Travel suggestion</h3>
        <p>{a.messages[0]}</p>
        {!compact && a.messages.slice(1).map((m) => <p key={m} className="small">{m}</p>)}
        {!compact && <p className="src-note">Official forecasts and warnings: <a href={OFFICIAL_WEATHER.url} target="_blank" rel="noopener noreferrer">{OFFICIAL_WEATHER.label}</a>.</p>}
      </div>
    </div>
  );
}
