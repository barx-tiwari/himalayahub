import { LogoMark } from '../layout/Logo';

export default function Spinner({ label = 'Loading…' }) {
  return <div className="spinner" role="status" aria-label={label} />;
}

/** Branded loading screen shown while a page's code downloads. */
export function PageLoader() {
  return (
    <div className="loader-page" role="status" aria-label="Loading HimalayaHub">
      <div className="brand-loader"><LogoMark className="brand-loader-mark" /><span className="brand-loader-bar" aria-hidden="true" /></div>
    </div>
  );
}
