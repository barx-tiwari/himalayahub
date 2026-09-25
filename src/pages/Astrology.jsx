import { useMemo, useState } from 'react';
import { Info, Sparkles } from 'lucide-react';
import AstrologyChat from '../components/astrology/AstrologyChat';
import { zodiacSigns, signFromDate, getSign } from '../data/zodiac';
import { buildReading } from '../services/astrologyService';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useProgress } from '../context/ProgressContext';

const EMPTY = { name: '', birthDate: '', birthTime: '', birthPlace: '', sign: '' };

export default function Astrology() {
  useDocumentTitle('AI Astrologer');
  const { state } = useProgress();
  const [saved, setSaved] = useLocalStorage('astro:profile', null);
  const [form, setForm] = useState(() => saved || { ...EMPTY, name: state.profile?.name || '' });
  const [error, setError] = useState('');

  const autoSign = useMemo(() => {
    if (!form.birthDate) return null;
    const [, m, d] = form.birthDate.split('-').map(Number);
    return m && d ? signFromDate(m, d) : null;
  }, [form.birthDate]);

  const submit = (e) => {
    e.preventDefault();
    const sign = form.sign || autoSign?.id;
    if (!sign) { setError('Choose your zodiac sign or enter your date of birth.'); return; }
    setError('');
    setSaved({ ...form, sign });
  };

  const profile = saved ? { ...saved, signName: getSign(saved.sign)?.name } : null;
  const reading = useMemo(() => (profile ? buildReading(profile) : null), [saved]); // eslint-disable-line react-hooks/exhaustive-deps
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="container page">
      <div className="astro">
        <header style={{ marginBottom: 24, maxWidth: '70ch' }}>
          <h1 style={{ color: 'var(--a-text)' }}><Sparkles aria-hidden="true" style={{ color: 'var(--a-gold)', verticalAlign: '-4px', marginRight: 8 }} />AI Astrologer</h1>
          <p className="muted" style={{ margin: 0 }}>A playful horoscope and chat companion. Enter your details to get today's reading.</p>
        </header>

        <div className="astro-grid">
          <div className="stack">
            <form className="astro-panel stack" onSubmit={submit} aria-labelledby="astro-form-title">
              <h2 id="astro-form-title" style={{ fontSize: 'var(--fs-lg)', margin: 0 }}>Your details</h2>
              <div className="field"><label htmlFor="a-name">Name</label><input id="a-name" className="input" value={form.name} onChange={set('name')} autoComplete="given-name" /></div>
              <div className="field"><label htmlFor="a-dob">Date of birth</label><input id="a-dob" className="input" type="date" value={form.birthDate} onChange={set('birthDate')} max={new Date().toISOString().slice(0, 10)} /></div>
              <div className="field"><label htmlFor="a-time">Birth time (optional)</label><input id="a-time" className="input" type="time" value={form.birthTime} onChange={set('birthTime')} /></div>
              <div className="field"><label htmlFor="a-place">Birth place (optional)</label><input id="a-place" className="input" value={form.birthPlace} onChange={set('birthPlace')} placeholder="e.g. Pokhara" /></div>
              <div className="field">
                <label htmlFor="a-sign">Zodiac sign</label>
                <select id="a-sign" className="select" value={form.sign} onChange={set('sign')} aria-describedby="a-sign-hint">
                  <option value="">{autoSign ? `Auto: ${autoSign.name}` : 'Select or enter date of birth'}</option>
                  {zodiacSigns.map((s) => <option key={s.id} value={s.id}>{s.glyph} {s.name} ({s.dates})</option>)}
                </select>
                <span id="a-sign-hint" className="field-hint" style={{ color: 'var(--a-muted)' }}>Western sun sign, worked out from your birth date.</span>
              </div>
              {error && <p role="alert" style={{ color: '#ffb4bf', margin: 0 }}>{error}</p>}
              <button type="submit" className="btn btn-primary">{saved ? 'Update reading' : 'Reveal my reading'}</button>
            </form>

            {reading && (
              <section className="astro-panel" aria-labelledby="sign-title">
                <div className="astro-sign">
                  <span className="astro-glyph" aria-hidden="true">{reading.sign.glyph}</span>
                  <div>
                    <h2 id="sign-title" style={{ margin: 0 }}>{reading.sign.name}</h2>
                    <span className="muted small">{reading.sign.dates}</span>
                  </div>
                </div>
                <div className="astro-facts">
                  <div><small>Element</small><strong>{reading.sign.element}</strong></div>
                  <div><small>Ruling planet</small><strong>{reading.sign.planet}</strong></div>
                  <div><small>Quality</small><strong>{reading.sign.quality}</strong></div>
                  <div><small>Lucky number</small><strong>{reading.luckyNumber}</strong></div>
                  <div style={{ gridColumn: '1 / -1' }}><small>Lucky color today</small><strong>{reading.luckyColor}</strong></div>
                </div>
              </section>
            )}
          </div>

          <div className="stack">
            {reading ? (
              <>
                <section className="astro-panel" aria-labelledby="today-title">
                  <h2 id="today-title" className="sr-only">Today's reading</h2>
                  <div className="astro-section"><h4>Daily horoscope</h4><p>{reading.daily}</p></div>
                  <div className="astro-section"><h4>Personality</h4><p>{reading.personality}</p></div>
                  <div className="astro-section"><h4>Career &amp; life themes</h4><p>{reading.career}</p></div>
                  <div className="astro-section"><h4>Relationships</h4><p>{reading.relationships}</p></div>
                </section>
                <section className="astro-panel" aria-labelledby="chat-title">
                  <h2 id="chat-title" style={{ fontSize: 'var(--fs-lg)' }}>Ask the astrologer</h2>
                  <AstrologyChat key={saved.sign + saved.name} profile={profile} />
                </section>
              </>
            ) : (
              <div className="astro-panel" style={{ display: 'grid', placeItems: 'center', minHeight: 320, textAlign: 'center' }}>
                <div>
                  <div className="astro-glyph" style={{ margin: '0 auto 16px' }} aria-hidden="true">✦</div>
                  <h2 style={{ fontSize: 'var(--fs-lg)' }}>Your stars are waiting</h2>
                  <p className="muted" style={{ margin: 0 }}>Fill in your details to see your zodiac profile, today's horoscope and chat with the astrologer.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="astro-disclaimer">
          <Info aria-hidden="true" />
          <span>Entertainment and general guidance only. Astrology is not scientific and this is not professional medical, financial, legal or psychological advice. Readings are generated from templates{' '}
            (or an AI model if the site owner connects one) and nothing here can predict real events.</span>
        </p>
      </div>
    </div>
  );
}
