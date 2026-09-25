import { Link } from 'react-router-dom';
import { BRAND } from '../../data/site';

/**
 * HimalayaHub mark: a Himalayan ridge whose summit carries a small
 * "knowledge node" that rises on a thin line — mountains + learning/digital.
 */
export function LogoMark({ className = 'logo-mark', title }) {
  return (
    <svg className={className} viewBox="0 0 32 32" role={title ? 'img' : undefined} aria-hidden={title ? undefined : 'true'} aria-label={title}>
      <defs>
        <linearGradient id="hh-sky" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#1d3f94" /><stop offset="1" stopColor="#0a8fb0" /></linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#hh-sky)" />
      <path d="M3.5 25 L11.5 13.5 L15 18 L19.5 10.5 L28.5 25 Z" fill="#fff" />
      <path d="M19.5 10.5 L22.2 15 L20.4 14.2 L19.5 15.4 L18.2 14 L16.9 14.6 Z" fill="#cfe6f3" />
      <path d="M19.5 10.5 L24.6 5.6" stroke="#f2b33d" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="24.8" cy="5.4" r="1.9" fill="#f2b33d" />
    </svg>
  );
}

export default function Logo({ tagline = false, onDark = false }) {
  return (
    <Link to="/" className={`logo${onDark ? ' on-dark' : ''}`} aria-label={`${BRAND.name} home`}>
      <LogoMark />
      <span className="logo-text">
        <span className="logo-name">{BRAND.name}</span>
        {tagline && <span className="logo-tag">{BRAND.tagline}</span>}
      </span>
    </Link>
  );
}
