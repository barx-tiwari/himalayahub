import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../ui/Modal';
import SearchBar from './SearchBar';
import SearchResults from './SearchResults';
import { searchAll } from '../../utils/search';
import { useUI } from '../../context/UIContext';

const SUGGESTIONS = ['DBMS', 'OSI', 'Accounting', 'NPL', 'Gold', 'Weather Pokhara', 'Ambulance', 'BMI'];

export default function SearchModal() {
  const { searchOpen, setSearchOpen } = useUI();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(-1);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const groups = useMemo(() => searchAll(query, { perGroup: 5 }), [query]);
  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  useEffect(() => { setActive(flat.length ? 0 : -1); }, [flat]);
  useEffect(() => { if (!searchOpen) setQuery(''); }, [searchOpen]);

  const close = () => setSearchOpen(false);

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(flat.length - 1, a + 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (flat[active]?.href) window.open(flat[active].href, '_blank', 'noopener,noreferrer');
      else if (flat[active]) navigate(flat[active].to);
      else if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      else return;
      close();
    }
  };

  useEffect(() => {
    if (active >= 0) document.getElementById(`sm-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  return (
    <Modal open={searchOpen} onClose={close} title="Search HimalayaHub" wide initialFocusRef={inputRef}>
      <SearchBar ref={inputRef} value={query} onChange={setQuery} label="Search notes, university subjects, news, sports, markets, weather and tools"
        placeholder="Try “DBMS”, “NPL” or “Pokhara”" onKeyDown={onKeyDown}
        role="combobox" aria-expanded={flat.length > 0} aria-controls="search-modal-results"
        aria-activedescendant={active >= 0 ? `sm-${active}` : undefined} />
      <div className="search-results" id="search-modal-results">
        {!query.trim() && (
          <div>
            <p className="small muted">Popular searches</p>
            <div className="row">
              {SUGGESTIONS.map((s) => <button key={s} type="button" className="chip" onClick={() => setQuery(s)}>{s}</button>)}
            </div>
          </div>
        )}
        {query.trim() && !flat.length && <p className="muted">No results for “{query}”. Try a shorter word.</p>}
        <SearchResults groups={groups} activeIndex={active} onNavigate={close} idPrefix="sm" />
      </div>
      <p className="small muted" style={{ marginTop: 12, marginBottom: 0 }}>
        <kbd>↑</kbd> <kbd>↓</kbd> to move, <kbd>Enter</kbd> to open, <kbd>Esc</kbd> to close
      </p>
    </Modal>
  );
}
