import { Link } from 'react-router-dom';
import { toolLinks } from '../data/navigation';
import { Icon } from '../utils/icons';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const MORE = [
  { to: '/typing', label: 'Typing Challenge', desc: 'Measure your WPM and accuracy', icon: 'Keyboard' },
  { to: '/astrology', label: 'AI Astrologer', desc: 'Entertainment horoscope and chat', icon: 'Sparkles' },
  { to: '/tarot', label: 'Tarot Cards', desc: 'Reflection spreads, just for fun', icon: 'Star' },
  { to: '/weather', label: 'Nepal Weather', desc: '7-day forecast for any place', icon: 'CloudSun' },
  { to: '/emergency', label: 'Emergency Help', desc: 'Verified national emergency numbers', icon: 'Siren' },
];

export default function Tools() {
  useDocumentTitle('Tools');
  return (
    <div className="container page" data-domain="tools">
      <header className="page-header">
        <h1>Learning Tools</h1>
        <p>Everyday utilities for students in Nepal and beyond. The calendar, converters and BMI calculator work offline; currency rates need a connection.</p>
      </header>
      <div className="hub-grid">
        {toolLinks.map((t) => (
          <Link key={t.to} to={t.to} className="card card-link hub-card">
            <span className="icon-tile"><Icon name={t.icon} /></span>
            <h2 className="card-title" style={{ margin: 0 }}>{t.label}</h2>
            <p className="card-sub">{t.desc}</p>
          </Link>
        ))}
      </div>
      <section className="section" aria-labelledby="more-tools">
        <div className="section-title"><h2 id="more-tools">More to explore</h2></div>
        <div className="hub-grid">
          {MORE.map((t) => (
            <Link key={t.to} to={t.to} className="card card-link hub-card card-flat">
              <span className="icon-tile accent"><Icon name={t.icon} /></span>
              <h3 className="card-title" style={{ margin: 0 }}>{t.label}</h3>
              <p className="card-sub">{t.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
