import { Link } from 'react-router-dom';
import { Icon } from '../../utils/icons';

/** Grouped results list shared by the modal and the /search page. */
export default function SearchResults({ groups, activeIndex = -1, onNavigate, idPrefix = 'sr' }) {
  let n = -1;
  return groups.map((g) => (
    <section key={g.group} className="search-group" aria-label={g.group}>
      <h3>{g.group}</h3>
      <ul role="listbox" aria-label={g.group}>
        {g.items.map((it) => {
          n += 1;
          const idx = n;
          return (
            <li key={`${it.group}-${it.to || it.href}-${it.title}`} role="option" aria-selected={idx === activeIndex} id={`${idPrefix}-${idx}`}>
              {it.href ? (
                <a href={it.href} target="_blank" rel="noopener noreferrer nofollow" className={`search-hit${idx === activeIndex ? ' is-active' : ''}`} onClick={onNavigate}>
                  <Icon name={it.icon} />
                  <span><strong>{it.title}</strong><small>{it.subtitle} (opens publisher site)</small></span>
                </a>
              ) : (
                <Link to={it.to} className={`search-hit${idx === activeIndex ? ' is-active' : ''}`} onClick={onNavigate}>
                  <Icon name={it.icon} />
                  <span><strong>{it.title}</strong><small>{it.subtitle}</small></span>
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  ));
}
