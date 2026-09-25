import { useState } from 'react';

/** Team name with its crest when the provider supplies one (initials otherwise). */
export default function Team({ name, logo }) {
  const [ok, setOk] = useState(Boolean(logo));
  const initials = (name || '?').split(/\s+/).map((w) => w[0]).join('').slice(0, 3).toUpperCase();
  return (
    <span className="team">
      {ok ? <img src={logo} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setOk(false)} /> : <span className="fallback-logo" aria-hidden="true">{initials}</span>}
      <span>{name}</span>
    </span>
  );
}
