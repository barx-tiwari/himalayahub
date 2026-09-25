import { forwardRef } from 'react';
import { Search } from 'lucide-react';

/** Labelled search input with icon. */
const SearchBar = forwardRef(function SearchBar({ value, onChange, label = 'Search', placeholder = 'Search…', id, ...rest }, ref) {
  const inputId = id || `search-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div className="search-input">
      <label htmlFor={inputId} className="sr-only">{label}</label>
      <Search aria-hidden="true" />
      <input ref={ref} id={inputId} type="search" className="input" value={value}
        onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoComplete="off" {...rest} />
    </div>
  );
});

export default SearchBar;
