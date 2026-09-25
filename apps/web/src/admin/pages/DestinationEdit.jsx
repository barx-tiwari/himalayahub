import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowDown, ArrowLeft, ArrowUp, Eye, ImagePlus, MapPin, Trash2, Upload } from 'lucide-react';
import { api } from '../../api/client';
import { useApi } from '../../api/useApi';
import { useAuth } from '../../context/AuthContext';
import { useDestinations } from '../../context/DestinationsContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { ZONES, provinces } from '../../data/nepalPlaces';
import { Field, ListEditor, StatusPill, bind, thumbUrl } from '../components';

const EMPTY = {
  name: '', slug: '', tagline: '', shortDescription: '', description: '', knownFor: '', province: '', district: '', zone: '',
  latitude: '', longitude: '', bestTimeToVisit: '', typicalDuration: '', gettingThere: '',
  activities: [], nearbyAttractions: [], travelTips: [], safetyInformation: [],
  isMountainArea: false, isViewDependent: false, isFeatured: false, sortOrder: 0, status: 'DRAFT', metaTitle: '', metaDescription: '',
  categorySlugs: [], nearbySlugs: [],
};
const toSlug = (s) => s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
const FIELDS = Object.keys(EMPTY);
let flash = null; // message carried across the redirect after creating

function fromApi(d) {
  const f = { ...EMPTY };
  for (const k of FIELDS) if (d[k] !== undefined && d[k] !== null) f[k] = d[k];
  f.latitude = String(d.latitude ?? ''); f.longitude = String(d.longitude ?? '');
  return f;
}
/** Same rules as the API (which validates again). */
function validate(f) {
  const e = {};
  if (f.name.trim().length < 2) e.name = 'Enter a name.';
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(f.slug)) e.slug = 'Use lowercase letters, numbers and hyphens.';
  if (!f.province) e.province = 'Choose a province.';
  const lat = Number(f.latitude); const lon = Number(f.longitude);
  if (f.latitude === '' || !Number.isFinite(lat) || lat < 26.3 || lat > 30.5) e.latitude = 'Latitude must be inside Nepal (26.3–30.5).';
  if (f.longitude === '' || !Number.isFinite(lon) || lon < 80 || lon > 88.3) e.longitude = 'Longitude must be inside Nepal (80.0–88.3).';
  if (f.metaTitle.length > 70) e.metaTitle = 'Keep under 70 characters.';
  if (f.metaDescription.length > 170) e.metaDescription = 'Keep under 170 characters.';
  for (const k of ['activities', 'nearbyAttractions', 'travelTips', 'safetyInformation']) if (f[k].some((x) => !x.trim())) e[k] = 'Fill in or remove empty lines.';
  return e;
}
function toPayload(f, status) {
  const n = (v) => (String(v).trim() === '' ? null : String(v).trim());
  return {
    name: f.name.trim(), slug: f.slug, tagline: n(f.tagline), shortDescription: n(f.shortDescription), description: n(f.description), knownFor: n(f.knownFor),
    province: f.province, district: n(f.district), zone: f.zone || null, latitude: Number(f.latitude), longitude: Number(f.longitude),
    bestTimeToVisit: n(f.bestTimeToVisit), typicalDuration: n(f.typicalDuration), gettingThere: n(f.gettingThere),
    activities: f.activities.map((x) => x.trim()), nearbyAttractions: f.nearbyAttractions.map((x) => x.trim()), travelTips: f.travelTips.map((x) => x.trim()), safetyInformation: f.safetyInformation.map((x) => x.trim()),
    isMountainArea: f.isMountainArea, isViewDependent: f.isViewDependent, isFeatured: status === 'PUBLISHED' ? f.isFeatured : false, sortOrder: Number(f.sortOrder) || 0,
    status, metaTitle: n(f.metaTitle), metaDescription: n(f.metaDescription), categorySlugs: f.categorySlugs, nearbySlugs: f.nearbySlugs,
  };
}

function Gallery({ destinationId, images: rawImages, onChange, canEdit }) {
  const images = [...rawImages].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const [add, setAdd] = useState({ mode: 'upload', file: null, commonsFile: '', altText: '', caption: '', credit: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const fileRef = useRef(null);
  const run = async (fn, okMsg) => { setBusy(true); setErr(''); try { await fn(); await onChange(okMsg); } catch (e) { setErr(e.message); } finally { setBusy(false); } };
  const addImage = () => run(async () => {
    if (add.altText.trim().length < 3) throw new Error('Describe the photo (alt text) before adding it.');
    let body;
    if (add.mode === 'upload') {
      if (!add.file) throw new Error('Choose an image file.');
      if (add.file.size > 8 * 1024 * 1024) throw new Error('That file is larger than 8 MB.');
      const asset = await api.upload('/admin/media', add.file, { alt: add.altText });
      body = { imageUrl: asset.variants?.webp1600 || asset.url };
    } else {
      if (add.commonsFile.trim().length < 3) throw new Error('Enter the Wikimedia Commons file name, e.g. Rara Lake in its reflection.jpg');
      body = { commonsFile: add.commonsFile.trim().replace(/^File:/i, '') };
    }
    await api.post(`/admin/destinations/${destinationId}/images`, { ...body, altText: add.altText.trim(), caption: add.caption.trim() || null, credit: add.credit.trim() || null });
    setAdd({ mode: add.mode, file: null, commonsFile: '', altText: '', caption: '', credit: '' }); if (fileRef.current) fileRef.current.value = '';
  }, 'Photo added.');
  const move = (i, d) => run(async () => {
    const ids = images.map((x) => x.id); const j = i + d; [ids[i], ids[j]] = [ids[j], ids[i]];
    await api.put(`/admin/destinations/${destinationId}/images/order`, { ids });
  }, 'Order saved.');
  const save = (img, patch) => run(() => api(`/admin/destinations/${destinationId}/images/${img.id}`, { method: 'PATCH', body: patch }), 'Photo details saved.');
  const remove = (img) => { if (window.confirm('Remove this photo from the destination?')) run(() => api.del(`/admin/destinations/${destinationId}/images/${img.id}`), 'Photo removed.'); };

  return (
    <div className="gallery-admin">
      {err && <p className="alert-inline error" role="alert">{err}</p>}
      {images.length === 0 ? <p className="small muted">No photos yet. The first photo is used on cards and as the page hero.</p> : (
        <ol className="img-list">{images.map((img, i) => (
          <li key={img.id}>
            <img src={thumbUrl(img)} alt="" loading="lazy" />
            <div className="img-fields">
              <label className="sr-only" htmlFor={`alt-${img.id}`}>Alt text for photo {i + 1}</label>
              <input id={`alt-${img.id}`} className="input" defaultValue={img.altText} disabled={!canEdit || busy} placeholder="Alt text (required)" onBlur={(e) => e.target.value.trim() !== img.altText && e.target.value.trim().length >= 3 && save(img, { altText: e.target.value.trim() })} />
              <label className="sr-only" htmlFor={`cap-${img.id}`}>Caption for photo {i + 1}</label>
              <input id={`cap-${img.id}`} className="input" defaultValue={img.caption || ''} disabled={!canEdit || busy} placeholder="Caption (optional)" onBlur={(e) => e.target.value.trim() !== (img.caption || '') && save(img, { caption: e.target.value.trim() || null })} />
              <span className="small muted">{i === 0 ? 'Cover photo · ' : ''}{img.commonsFile ? `Wikimedia Commons: ${img.commonsFile}` : img.credit || 'Uploaded photo'}</span>
            </div>
            {canEdit && <div className="img-actions">
              <button type="button" className="btn btn-ghost btn-icon btn-sm" disabled={busy || i === 0} onClick={() => move(i, -1)} aria-label={`Move photo ${i + 1} earlier`}><ArrowUp aria-hidden="true" /></button>
              <button type="button" className="btn btn-ghost btn-icon btn-sm" disabled={busy || i === images.length - 1} onClick={() => move(i, 1)} aria-label={`Move photo ${i + 1} later`}><ArrowDown aria-hidden="true" /></button>
              <button type="button" className="btn btn-ghost btn-icon btn-sm" disabled={busy} onClick={() => remove(img)} aria-label={`Remove photo ${i + 1}`}><Trash2 aria-hidden="true" /></button>
            </div>}
          </li>
        ))}</ol>
      )}
      {canEdit && (
        <div className="img-add">
          <h3><ImagePlus aria-hidden="true" /> Add a photo</h3>
          <div className="chip-tabs" role="group" aria-label="Photo source">
            <button type="button" aria-pressed={add.mode === 'upload'} onClick={() => setAdd((a) => ({ ...a, mode: 'upload' }))}>Upload</button>
            <button type="button" aria-pressed={add.mode === 'commons'} onClick={() => setAdd((a) => ({ ...a, mode: 'commons' }))}>Wikimedia Commons</button>
          </div>
          <div className="form-grid">
            {add.mode === 'upload'
              ? <Field id="img-file" label="Image file" hint="JPEG, PNG, WebP, GIF or AVIF, up to 8 MB. Only upload photos you own or have permission to use."><input key="file" id="img-file" ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" className="input" onChange={(e) => setAdd((a) => ({ ...a, file: e.target.files?.[0] || null }))} /></Field>
              : <Field id="img-commons" label="Commons file name" hint="Freely licensed; author and licence are shown automatically."><input key="commons" id="img-commons" className="input" value={add.commonsFile} onChange={(e) => setAdd((a) => ({ ...a, commonsFile: e.target.value }))} placeholder="Rara Lake in its reflection.jpg" /></Field>}
            <Field id="img-alt" label="Alt text" required hint="What the photo shows, for screen readers and search engines."><input id="img-alt" className="input" value={add.altText} onChange={(e) => setAdd((a) => ({ ...a, altText: e.target.value }))} placeholder="Rara Lake surrounded by pine forest" /></Field>
            <Field id="img-cap" label="Caption"><input id="img-cap" className="input" value={add.caption} onChange={(e) => setAdd((a) => ({ ...a, caption: e.target.value }))} /></Field>
            {add.mode === 'upload' && <Field id="img-credit" label="Credit" hint="e.g. Photo: Ram Thapa"><input id="img-credit" className="input" value={add.credit} onChange={(e) => setAdd((a) => ({ ...a, credit: e.target.value }))} /></Field>}
          </div>
          <button type="button" className="btn btn-primary btn-sm" onClick={addImage} disabled={busy}><Upload aria-hidden="true" /> {busy ? 'Working…' : 'Add photo'}</button>
        </div>
      )}
    </div>
  );
}

export default function DestinationEdit() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const { can } = useAuth();
  const { reload: reloadSite } = useDestinations();
  const canEdit = can(isNew ? 'destinations.create' : 'destinations.update');
  const item = useApi(isNew ? null : `/admin/destinations/${id}`);
  const cats = useApi('/admin/destination-categories');
  const all = useApi('/admin/destinations?status=ALL&limit=100');
  const initial = useMemo(() => (item.data ? fromApi(item.data) : EMPTY), [item.data]);
  const [form, setForm] = useState(initial);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [errors, setErrors] = useState({});
  const [state, setState] = useState({ busy: false, ok: null, message: '' });
  useEffect(() => { setForm(initial); }, [initial]);
  useDocumentTitle(`${isNew ? 'New destination' : form.name || 'Destination'} · Admin`);
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const b = (k, extra) => bind(form, setForm, errors, k, { disabled: !canEdit || state.busy, ...extra });
  const onName = (e) => { const v = e.target.value; setForm((f) => ({ ...f, name: v, slug: slugTouched ? f.slug : toSlug(v) })); };
  const toggleIn = (key, v) => setForm((f) => ({ ...f, [key]: f[key].includes(v) ? f[key].filter((x) => x !== v) : [...f[key], v] }));

  const submit = async (status) => {
    const errs = validate(form); setErrors(errs);
    if (Object.keys(errs).length) { setState({ busy: false, ok: false, message: 'Please fix the highlighted fields.' }); document.getElementById(Object.keys(errs)[0])?.focus(); return; }
    setState({ busy: true, ok: null, message: '' });
    try {
      const body = toPayload(form, status);
      const saved = isNew ? await api.post('/admin/destinations', body) : await api(`/admin/destinations/${id}`, { method: 'PATCH', body });
      reloadSite();
      const message = status === 'PUBLISHED' ? 'Published — it’s now live on Explore Nepal.' : status === 'ARCHIVED' ? 'Archived — hidden from the website.' : 'Draft saved.';
      if (isNew) { flash = message; navigate(`/admin/destinations/${saved.id}`, { replace: true }); }
      else { await item.refetch(); setState({ busy: false, ok: true, message }); }
    } catch (e) {
      setErrors(e.fieldErrors); setState({ busy: false, ok: false, message: e.message });
    }
  };
  const remove = async () => {
    if (!window.confirm(`Delete “${form.name}”? It will be hidden everywhere. An administrator can restore it from the database if needed.`)) return;
    setState({ busy: true, ok: null, message: '' });
    try { await api.del(`/admin/destinations/${id}`); reloadSite(); navigate('/admin/destinations', { replace: true }); } catch (e) { setState({ busy: false, ok: false, message: e.message }); }
  };
  useEffect(() => { if (flash && !isNew) { setState({ busy: false, ok: true, message: flash }); flash = null; } }, [id, isNew]);

  if (!isNew && item.status === 'loading') return <div className="admin-page"><span className="skeleton title" /><span className="skeleton block" /></div>;
  if (!isNew && item.status === 'error') return <div className="admin-page"><p className="alert-inline error" role="alert">{item.error.message}</p><Link to="/admin/destinations">Back to destinations</Link></div>;

  const current = item.data?.status || 'DRAFT';
  const others = (all.data || []).filter((d) => d.slug !== form.slug);
  const osm = form.latitude && form.longitude ? `https://www.openstreetmap.org/?mlat=${form.latitude}&mlon=${form.longitude}#map=12/${form.latitude}/${form.longitude}` : null;

  return (
    <form className="admin-page" onSubmit={(e) => { e.preventDefault(); submit(current === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT'); }} noValidate>
      <header className="admin-head sticky-head">
        <div>
          <Link to="/admin/destinations" className="back-link"><ArrowLeft aria-hidden="true" /> Destinations</Link>
          <h1>{isNew ? 'New destination' : form.name || 'Untitled'} {!isNew && <StatusPill status={current} />}</h1>
        </div>
        {canEdit && (
          <div className="row action-row">
            {!isNew && <a className={`btn btn-ghost btn-sm${dirty ? ' disabled' : ''}`} href={`/explore-nepal/${initial.slug}?preview=1`} target="_blank" rel="noopener" aria-disabled={dirty} onClick={(e) => dirty && e.preventDefault()} title={dirty ? 'Save first to preview your changes' : 'Open a preview in a new tab'}><Eye aria-hidden="true" /> Preview</a>}
            {current !== 'PUBLISHED' && <button type="button" className="btn btn-secondary btn-sm" disabled={state.busy} onClick={() => submit('DRAFT')}>Save draft</button>}
            {current === 'PUBLISHED'
              ? <><button type="button" className="btn btn-secondary btn-sm" disabled={state.busy} onClick={() => submit('DRAFT')}>Unpublish</button><button type="submit" className="btn btn-primary btn-sm" disabled={state.busy || !dirty}>{state.busy ? 'Saving…' : 'Update'}</button></>
              : <button type="button" className="btn btn-primary btn-sm" disabled={state.busy} onClick={() => submit('PUBLISHED')}>{state.busy ? 'Saving…' : 'Publish'}</button>}
          </div>
        )}
      </header>
      {state.message && <p className={`alert-inline ${state.ok ? 'ok' : 'error'}`} role={state.ok ? 'status' : 'alert'}>{state.message}</p>}

      <div className="editor-cols">
        <div className="editor-main">
          <section className="admin-card form-card" aria-labelledby="d-basic"><h2 id="d-basic">Basics</h2>
            <div className="form-grid">
              <Field id="name" label="Name" required error={errors.name}><input className="input" {...b('name')} onChange={onName} /></Field>
              <Field id="slug" label="Web address" required error={errors.slug} hint={`himalayahub.com/explore-nepal/${form.slug || '…'}`}><input className="input" {...b('slug')} onChange={(e) => { setSlugTouched(true); setForm((f) => ({ ...f, slug: toSlug(e.target.value) })); }} /></Field>
              <Field id="tagline" label="Tagline" hint="One line shown on cards." error={errors.tagline} count={form.tagline.length} max={160}><input className="input" {...b('tagline')} /></Field>
              <Field id="knownFor" label="Best known for" error={errors.knownFor}><input className="input" {...b('knownFor')} /></Field>
            </div>
            <Field id="description" label="Description" error={errors.description}><textarea className="textarea" rows={4} {...b('description')} /></Field>
          </section>

          <section className="admin-card form-card" aria-labelledby="d-loc"><h2 id="d-loc">Location</h2>
            <div className="form-grid">
              <Field id="province" label="Province" required error={errors.province}><select className="select" {...b('province')}><option value="">Choose…</option>{provinces.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>
              <Field id="district" label="District" error={errors.district}><input className="input" list="districts" {...b('district')} /><datalist id="districts">{(provinces.find((p) => p.id === form.province)?.districts || []).map((d) => <option key={d} value={d} />)}</datalist></Field>
              <Field id="latitude" label="Latitude" required error={errors.latitude} hint="e.g. 28.2096"><input className="input" inputMode="decimal" {...b('latitude')} /></Field>
              <Field id="longitude" label="Longitude" required error={errors.longitude} hint="e.g. 83.9856"><input className="input" inputMode="decimal" {...b('longitude')} /></Field>
              <Field id="zone" label="Landscape"><select className="select" {...b('zone')}><option value="">Not set</option>{ZONES.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}</select></Field>
            </div>
            {osm && !errors.latitude && !errors.longitude && <a href={osm} target="_blank" rel="noopener noreferrer" className="small"><MapPin aria-hidden="true" className="inline-icon" /> Check these coordinates on OpenStreetMap</a>}
          </section>

          <section className="admin-card form-card" aria-labelledby="d-visit"><h2 id="d-visit">Visiting</h2>
            <div className="form-grid">
              <Field id="bestTimeToVisit" label="Best time to visit" hint="Keep it general (“usually…”). Weather varies year to year."><textarea className="textarea" rows={2} {...b('bestTimeToVisit')} /></Field>
              <Field id="gettingThere" label="Getting there"><textarea className="textarea" rows={2} {...b('gettingThere')} /></Field>
              <Field id="typicalDuration" label="Typical trip length"><input className="input" {...b('typicalDuration')} placeholder="2–4 days" /></Field>
            </div>
            <div className="form-grid">
              <ListEditor id="activities" label="Activities" placeholder="activity" items={form.activities} onChange={(v) => setForm((f) => ({ ...f, activities: v }))} disabled={!canEdit} error={errors.activities} />
              <ListEditor id="nearbyAttractions" label="Nearby attractions" placeholder="attraction" items={form.nearbyAttractions} onChange={(v) => setForm((f) => ({ ...f, nearbyAttractions: v }))} disabled={!canEdit} error={errors.nearbyAttractions} />
              <ListEditor id="travelTips" label="Travel tips" placeholder="tip" items={form.travelTips} onChange={(v) => setForm((f) => ({ ...f, travelTips: v }))} disabled={!canEdit} error={errors.travelTips} />
              <ListEditor id="safetyInformation" label="Safety information" placeholder="safety note" items={form.safetyInformation} onChange={(v) => setForm((f) => ({ ...f, safetyInformation: v }))} disabled={!canEdit} error={errors.safetyInformation} />
            </div>
          </section>

          <section className="admin-card form-card" aria-labelledby="d-gal"><h2 id="d-gal">Photos</h2>
            {isNew ? <p className="small muted">Save the destination first, then add photos here.</p>
              : <Gallery destinationId={id} images={item.data?.images || []} canEdit={canEdit} onChange={async (m) => { await item.refetch(); reloadSite(); setState({ busy: false, ok: true, message: m }); }} />}
          </section>
        </div>

        <aside className="editor-side">
          <section className="admin-card form-card" aria-labelledby="d-vis"><h2 id="d-vis">Visibility</h2>
            <label className="check"><input type="checkbox" {...b('isFeatured')} checked={form.isFeatured} /> Feature on the homepage</label>
            <p className="field-hint">Only published destinations can be featured. The homepage shows up to six.</p>
            <Field id="sortOrder" label="Display order" hint="Lower numbers appear first."><input className="input" type="number" min="0" {...b('sortOrder')} /></Field>
            <label className="check"><input type="checkbox" {...b('isMountainArea')} checked={form.isMountainArea} /> Trekking / high-altitude area</label>
            <label className="check"><input type="checkbox" {...b('isViewDependent')} checked={form.isViewDependent} /> Views depend on clear weather</label>
          </section>
          <section className="admin-card form-card" aria-labelledby="d-cat"><h2 id="d-cat">Categories</h2>
            {cats.status === 'loading' ? <span className="skeleton line" /> : (
              <div className="chip-tabs wrap" role="group" aria-label="Travel categories">
                {(cats.data || []).map((c) => <button key={c.slug} type="button" aria-pressed={form.categorySlugs.includes(c.slug)} disabled={!canEdit} onClick={() => toggleIn('categorySlugs', c.slug)}>{c.emoji} {c.name}</button>)}
              </div>
            )}
          </section>
          <section className="admin-card form-card" aria-labelledby="d-near"><h2 id="d-near">Nearby destinations</h2>
            <div className="check-list-admin">{others.map((o) => (
              <label key={o.slug} className="check"><input type="checkbox" checked={form.nearbySlugs.includes(o.slug)} disabled={!canEdit} onChange={() => toggleIn('nearbySlugs', o.slug)} /> {o.name}{o.status !== 'PUBLISHED' && <small className="muted"> ({o.status.toLowerCase()})</small>}</label>
            ))}</div>
          </section>
          <section className="admin-card form-card" aria-labelledby="d-seo"><h2 id="d-seo">SEO</h2>
            <Field id="metaTitle" label="Meta title" error={errors.metaTitle} count={form.metaTitle.length} max={70}><input className="input" {...b('metaTitle')} placeholder={`${form.name || 'Destination'}, Nepal — travel guide & weather | HimalayaHub`.slice(0, 70)} /></Field>
            <Field id="metaDescription" label="Meta description" error={errors.metaDescription} count={form.metaDescription.length} max={170}><textarea className="textarea" rows={3} {...b('metaDescription')} placeholder={form.tagline || 'Defaults to the tagline'} /></Field>
          </section>
          {!isNew && canEdit && (
            <section className="admin-card form-card danger-zone" aria-labelledby="d-danger"><h2 id="d-danger">Archive or delete</h2>
              {current !== 'ARCHIVED' && <button type="button" className="btn btn-secondary btn-sm" disabled={state.busy} onClick={() => submit('ARCHIVED')}>Archive (hide from website)</button>}
              {can('destinations.delete') && <button type="button" className="btn btn-danger btn-sm" disabled={state.busy} onClick={remove}><Trash2 aria-hidden="true" /> Delete</button>}
            </section>
          )}
        </aside>
      </div>
    </form>
  );
}
