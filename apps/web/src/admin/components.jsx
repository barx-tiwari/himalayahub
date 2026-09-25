import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';

/** Labelled form field with hint, character counter and error message wired for screen readers. */
export function Field({ id, label, hint, error, count, max, required, children }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}{required && <span aria-hidden="true" className="req"> *</span>}{max != null && <span className={`count${count > max ? ' over' : ''}`} aria-hidden="true">{count}/{max}</span>}</label>
      {children}
      {hint && !error && <span className="field-hint" id={`${id}-hint`}>{hint}</span>}
      {error && <span className="field-error" id={`${id}-err`} role="alert">{error}</span>}
    </div>
  );
}
/** Props for an input bound to a form object with error wiring. */
export const bind = (form, setForm, errors, id, extra = {}) => ({
  id, value: form[id] ?? '', onChange: (e) => setForm((f) => ({ ...f, [id]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })),
  'aria-invalid': Boolean(errors[id]) || undefined, 'aria-describedby': errors[id] ? `${id}-err` : undefined, ...extra,
});

const STATUS_LABEL = { PUBLISHED: 'Published', DRAFT: 'Draft', ARCHIVED: 'Archived' };
export const StatusPill = ({ status }) => <span className={`pill status-${String(status).toLowerCase()}`}>{STATUS_LABEL[status] || status}</span>;

/** Editable list of short text lines (activities, tips…) with add / remove / reorder. */
export function ListEditor({ id, label, items, onChange, placeholder, max = 30, disabled, error }) {
  const set = (i, v) => onChange(items.map((x, k) => (k === i ? v : x)));
  const move = (i, d) => { const n = [...items]; const j = i + d; [n[i], n[j]] = [n[j], n[i]]; onChange(n); };
  return (
    <fieldset className="list-editor" id={id} aria-describedby={error ? `${id}-err` : undefined}>
      <legend>{label}</legend>
      {items.length === 0 && <p className="small muted">Nothing added yet.</p>}
      <ol>{items.map((v, i) => (
        <li key={i}>
          <input className="input" value={v} onChange={(e) => set(i, e.target.value)} aria-label={`${label} ${i + 1}`} disabled={disabled} maxLength={300} />
          <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={() => move(i, -1)} disabled={disabled || i === 0} aria-label={`Move ${label.toLowerCase()} ${i + 1} up`}><ArrowUp aria-hidden="true" /></button>
          <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={() => move(i, 1)} disabled={disabled || i === items.length - 1} aria-label={`Move ${label.toLowerCase()} ${i + 1} down`}><ArrowDown aria-hidden="true" /></button>
          <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={() => onChange(items.filter((_, k) => k !== i))} disabled={disabled} aria-label={`Remove ${label.toLowerCase()} ${i + 1}`}><Trash2 aria-hidden="true" /></button>
        </li>
      ))}</ol>
      {items.length < max && <button type="button" className="btn btn-secondary btn-sm" onClick={() => onChange([...items, ''])} disabled={disabled}><Plus aria-hidden="true" /> Add {placeholder || 'item'}</button>}
      {error && <span className="field-error" id={`${id}-err`} role="alert">{error}</span>}
    </fieldset>
  );
}

/** Thumbnail for an admin image record (uploaded URL or Commons file). */
export function thumbUrl(img, width = 330) {
  if (!img) return null;
  if (img.imageUrl) return img.imageUrl;
  if (img.commonsFile) return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(img.commonsFile.replace(/ /g, '_'))}?width=${width}`;
  return null;
}
