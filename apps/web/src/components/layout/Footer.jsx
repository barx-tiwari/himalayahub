import { Link } from 'react-router-dom';
import Logo from './Logo';
import { ChatIcon } from '../contact/WhatsApp';
import { useSiteSettings, useWhatsAppLink } from '../../context/SiteSettingsContext';

const COLS = [
  ['Explore', [['/explore-nepal', 'Nepal'], ['/hidden-gems', 'Hidden Gems'], ['/travel-guide', 'Travel Guide'], ['/community', 'Community'], ['/explore-nepal#all', 'Destinations'], ['/weather', 'Weather']]],
  ['Learn', [['/courses', 'Courses'], ['/notes', 'IT Notes'], ['/notes/csit', 'CSIT'], ['/notes/bca', 'BCA'], ['/notes/bim', 'BIM'], ['/notes/bba', 'BBA'], ['/typing', 'Typing']]],
  ['Tools', [['/tools/calendar', 'Calendar'], ['/tools/date-converter', 'Date Converter'], ['/tools/currency', 'Currency'], ['/tools/world-clock', 'World Clock'], ['/bmi', 'BMI']]],
  ['Live', [['/news', 'News'], ['/football', 'Football'], ['/cricket', 'Cricket'], ['/nepse', 'NEPSE'], ['/crypto', 'Crypto']]],
];

export default function Footer() {
  const { settings } = useSiteSettings();
  const wa = useWhatsAppLink();
  return (
    <footer className="footer">
      <div className="prayer-strip" aria-hidden="true"><span /><span /><span /><span /><span /></div>
      <div className="container footer-grid">
        <div className="footer-brand">
          <Logo tagline />
          <p className="footer-tagline">{settings.footerText || settings.description}</p>
        </div>
        {COLS.map(([h, links]) => (
          <nav key={h} aria-label={h}>
            <h3>{h}</h3>
            <ul>{links.map(([to, label]) => <li key={to + label}><Link to={to}>{label}</Link></li>)}</ul>
          </nav>
        ))}
        <nav aria-label="Help">
          <h3>Help</h3>
          <ul>
            <li><Link to="/emergency">Emergency</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><a href={wa.href} target="_blank" rel="noopener noreferrer" className="footer-wa"><ChatIcon width="16" height="16" /> WhatsApp {wa.digits.startsWith('977') ? wa.digits.slice(3) : wa.digits}</a></li>
          </ul>
        </nav>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} {settings.siteName} · {settings.tagline}</span>
        <span className="footer-legal"><Link to="/about">About</Link><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link><Link to="/image-credits">Image credits</Link><span>Press <kbd>?</kbd> for shortcuts</span></span>
      </div>
    </footer>
  );
}
