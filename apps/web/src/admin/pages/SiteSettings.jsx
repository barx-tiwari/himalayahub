import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ExternalLink, Save, Undo2 } from 'lucide-react';
import { normalizeWhatsApp } from '@shared/contact';
import { api } from '../../api/client';
import { useApi } from '../../api/useApi';
import { useAuth } from '../../context/AuthContext';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Field } from '../components';

const SOCIAL = [['facebook', 'Facebook'], ['instagram', 'Instagram'], ['youtube', 'YouTube'], ['tiktok', 'TikTok'], ['x', 'X (Twitter)']];
const TEXT_FIELDS = ['siteName', 'tagline', 'secondaryTagline', 'description', 'logoUrl', 'faviconUrl', 'contactPhone', 'contactEmail', 'whatsappNumber', 'whatsappMessage', 'footerText', 'defaultMetaTitle', 'defaultMetaDescription', 'defaultOgImage'];

function toForm(s) {
  const f = Object.fromEntries(TEXT_FIELDS.map((k) => [k, '']));
  if (!s) return { ...f, social: {}, accent: '', defaultMode: 'system' };
  TEXT_FIELDS.forEach((k) => { f[k] = s[k] ?? ''; });
  f.defaultMetaTitle = s.seo?.title ?? ''; f.defaultMetaDescription = s.seo?.description ?? ''; f.defaultOgImage = s.seo?.ogImage ?? '';
  return { ...f, social: { ...(s.socialLinks || {}) }, accent: s.theme?.accent ?? '', defaultMode: s.theme?.defaultMode ?? 'system' };
}
const isUrl = (v) => { try { const u = new URL(v); return u.protocol === 'https:' || u.protocol === 'http:'; } catch { return false; } };
const isUrlOrPath = (v) => !v || v.startsWith('/') || isUrl(v);

/** Mirrors the server's validation for instant feedback; the server re-validates everything. */
function validate(f) {
  const e = {};
  if (f.siteName.trim().length < 2) e.siteName = 'Enter the website name.';
  if (f.tagline.length > 120) e.tagline = 'Keep the tagline under 120 characters.';
  if (!normalizeWhatsApp(f.whatsappNumber)) e.whatsappNumber = 'Enter a valid WhatsApp number, e.g. +977 9863903703.';
  if (f.whatsappMessage.length > 200) e.whatsappMessage = 'Keep the message under 200 characters.';
  if (f.contactEmail && !/^\S+@\S+\.\S+$/.test(f.contactEmail)) e.contactEmail = 'Enter a valid email address.';
  for (const k of ['logoUrl', 'faviconUrl', 'defaultOgImage']) if (f[k] && !isUrlOrPath(f[k])) e[k] = 'Use a full https:// address or a path starting with /.';
  if (f.defaultMetaTitle.length > 70) e.defaultMetaTitle = 'Search engines cut titles after about 70 characters.';
  if (f.defaultMetaDescription.length > 170) e.defaultMetaDescription = 'Keep this under 170 characters.';
  for (const [k] of SOCIAL) if (f.social[k] && !isUrl(f.social[k])) e[`social.${k}`] = 'Use a full https:// address.';
  if (f.accent && !/^#[0-9a-f]{6}$/i.test(f.accent)) e.accent = 'Use a colour like #1d3f94.';
  return e;
}
function toPayload(f) {
  const n = (v) => (v.trim() === '' ? null : v.trim());
  const social = Object.fromEntries(Object.entries(f.social).filter(([, v]) => v && v.trim()).map(([k, v]) => [k, v.trim()]));
  const out = { siteName: f.siteName.trim(), tagline: f.tagline.trim(), whatsappNumber: f.whatsappNumber.trim(), whatsappMessage: f.whatsappMessage.trim(), socialLinks: Object.keys(social).length ? social : null, theme: { ...(f.accent ? { accent: f.accent } : {}), defaultMode: f.defaultMode } };
  for (const k of ['secondaryTagline', 'description', 'logoUrl', 'faviconUrl', 'contactPhone', 'contactEmail', 'footerText', 'defaultMetaTitle', 'defaultMetaDescription', 'defaultOgImage']) out[k] = n(f[k]);
  return out;
}

export default function SiteSettings() {
  useDocumentTitle('Site settings · Admin');
  const { can } = useAuth();
  const { reload: reloadSite } = useSiteSettings();
  const canEdit = can('settings.manage');
  const q = useApi('/site-settings');
  const initial = useMemo(() => toForm(q.data), [q.data]);
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [state, setState] = useState({ saving: false, saved: null, message: '' });
  useEffect(() => { setForm(initial); }, [initial]);
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setState((s) => ({ ...s, saved: null })); };
  const setSocial = (k) => (e) => setForm((f) => ({ ...f, social: { ...f.social, [k]: e.target.value } }));
  const digits = normalizeWhatsApp(form.whatsappNumber);
  const preview = digits ? `https://wa.me/${digits}${form.whatsappMessage ? `?text=${encodeURIComponent(form.whatsappMessage)}` : ''}` : null;
  const a = (id) => ({ id, 'aria-invalid': Boolean(errors[id]) || undefined, 'aria-describedby': errors[id] ? `${id}-err` : undefined, disabled: !canEdit || state.saving });

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate(form); setErrors(errs);
    if (Object.keys(errs).length) { setState({ saving: false, saved: false, message: 'Please fix the highlighted fields.' }); document.getElementById(Object.keys(errs)[0].replace('social.', 'social-'))?.focus(); return; }
    setState({ saving: true, saved: null, message: '' });
    try {
      await api.put('/site-settings', toPayload(form));
      await Promise.all([q.refetch(), reloadSite()]);
      setState({ saving: false, saved: true, message: 'Saved. The website now uses these settings.' });
    } catch (err) {
      setErrors(err.fieldErrors);
      setState({ saving: false, saved: false, message: err.message });
    }
  };

  if (q.status === 'loading') return <div className="admin-page"><h1>Site settings</h1><div className="admin-card"><span className="skeleton title" /><span className="skeleton line" /></div></div>;
  if (q.status === 'error' && !q.data) return <div className="admin-page"><h1>Site settings</h1><div className="admin-card error" role="alert"><p>{q.error.message}</p><button type="button" className="btn btn-secondary btn-sm" onClick={q.refetch}>Try again</button></div></div>;

  return (
    <form className="admin-page" onSubmit={submit} noValidate>
      <header className="admin-head sticky-head">
        <div><h1>Site settings</h1><p className="muted">Changes apply across the whole website as soon as you save.</p></div>
        {canEdit && (
          <div className="row">
            <button type="button" className="btn btn-ghost btn-sm" disabled={!dirty || state.saving} onClick={() => { setForm(initial); setErrors({}); }}><Undo2 aria-hidden="true" /> Discard</button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={!dirty || state.saving}><Save aria-hidden="true" /> {state.saving ? 'Saving…' : 'Save changes'}</button>
          </div>
        )}
      </header>
      {!canEdit && <p className="alert-inline warn" role="status">Only a Super admin can change site settings. You can view them here.</p>}
      {state.message && <p className={`alert-inline ${state.saved ? 'ok' : 'error'}`} role={state.saved ? 'status' : 'alert'}>{state.saved && <CheckCircle2 aria-hidden="true" />} {state.message}</p>}

      <section className="admin-card form-card" aria-labelledby="s-brand"><h2 id="s-brand">Brand</h2>
        <div className="form-grid">
          <Field id="siteName" label="Website name" error={errors.siteName}><input className="input" {...a('siteName')} value={form.siteName} onChange={set('siteName')} /></Field>
          <Field id="tagline" label="Tagline" error={errors.tagline} count={form.tagline.length} max={120}><input className="input" {...a('tagline')} value={form.tagline} onChange={set('tagline')} /></Field>
          <Field id="secondaryTagline" label="Secondary tagline" error={errors.secondaryTagline}><input className="input" {...a('secondaryTagline')} value={form.secondaryTagline} onChange={set('secondaryTagline')} /></Field>
          <Field id="description" label="Short description" error={errors.description} count={form.description.length} max={300}><textarea className="textarea" rows={2} {...a('description')} value={form.description} onChange={set('description')} /></Field>
          <Field id="logoUrl" label="Logo URL" hint="Leave empty to use the built-in HimalayaHub logo." error={errors.logoUrl}><input className="input" {...a('logoUrl')} value={form.logoUrl} onChange={set('logoUrl')} placeholder="https://… or /logo.svg" /></Field>
          <Field id="faviconUrl" label="Favicon URL" hint="Leave empty to use /favicon.svg." error={errors.faviconUrl}><input className="input" {...a('faviconUrl')} value={form.faviconUrl} onChange={set('faviconUrl')} placeholder="/favicon.svg" /></Field>
        </div>
      </section>

      <section className="admin-card form-card" aria-labelledby="s-contact"><h2 id="s-contact">Contact &amp; WhatsApp</h2>
        <div className="form-grid">
          <Field id="whatsappNumber" label="WhatsApp number" hint="Any format works: +977 9863903703, 9863903703 …" error={errors.whatsappNumber}><input className="input" inputMode="tel" {...a('whatsappNumber')} value={form.whatsappNumber} onChange={set('whatsappNumber')} /></Field>
          <Field id="whatsappMessage" label="Pre-filled message" error={errors.whatsappMessage} count={form.whatsappMessage.length} max={200}><input className="input" {...a('whatsappMessage')} value={form.whatsappMessage} onChange={set('whatsappMessage')} /></Field>
          <Field id="contactPhone" label="Contact phone" error={errors.contactPhone}><input className="input" inputMode="tel" {...a('contactPhone')} value={form.contactPhone} onChange={set('contactPhone')} /></Field>
          <Field id="contactEmail" label="Contact email" error={errors.contactEmail}><input className="input" type="email" {...a('contactEmail')} value={form.contactEmail} onChange={set('contactEmail')} /></Field>
        </div>
        <div className="wa-preview" aria-live="polite">
          {preview ? <>All WhatsApp buttons will open <code>wa.me/{digits}</code> <a href={preview} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm"><ExternalLink aria-hidden="true" /> Test this link</a></> : <span className="field-error">Enter a valid number to see the link.</span>}
        </div>
      </section>

      <section className="admin-card form-card" aria-labelledby="s-social"><h2 id="s-social">Social links</h2>
        <div className="form-grid">{SOCIAL.map(([k, label]) => (
          <Field key={k} id={`social-${k}`} label={label} error={errors[`social.${k}`]}><input className="input" type="url" id={`social-${k}`} disabled={!canEdit || state.saving} aria-invalid={Boolean(errors[`social.${k}`]) || undefined} value={form.social[k] || ''} onChange={setSocial(k)} placeholder="https://" /></Field>
        ))}</div>
      </section>

      <section className="admin-card form-card" aria-labelledby="s-seo"><h2 id="s-seo">Footer &amp; default SEO</h2>
        <div className="form-grid">
          <Field id="footerText" label="Footer text" hint="Shown under the logo in the footer. Empty = short description." error={errors.footerText}><textarea className="textarea" rows={2} {...a('footerText')} value={form.footerText} onChange={set('footerText')} /></Field>
          <Field id="defaultMetaTitle" label="Default page title" error={errors.defaultMetaTitle} count={form.defaultMetaTitle.length} max={70}><input className="input" {...a('defaultMetaTitle')} value={form.defaultMetaTitle} onChange={set('defaultMetaTitle')} /></Field>
          <Field id="defaultMetaDescription" label="Default description" error={errors.defaultMetaDescription} count={form.defaultMetaDescription.length} max={170}><textarea className="textarea" rows={2} {...a('defaultMetaDescription')} value={form.defaultMetaDescription} onChange={set('defaultMetaDescription')} /></Field>
          <Field id="defaultOgImage" label="Default share image" error={errors.defaultOgImage}><input className="input" {...a('defaultOgImage')} value={form.defaultOgImage} onChange={set('defaultOgImage')} placeholder="/og-image.png" /></Field>
        </div>
        <div className="serp" aria-label="Search result preview"><span className="serp-t">{form.defaultMetaTitle || form.siteName}</span><span className="serp-u">himalayahub.com</span><span className="serp-d">{form.defaultMetaDescription || form.description}</span></div>
      </section>

      <section className="admin-card form-card" aria-labelledby="s-theme"><h2 id="s-theme">Theme</h2>
        <div className="form-grid">
          <Field id="accent" label="Accent colour" hint="Optional; used by future theme options." error={errors.accent}><div className="row"><input type="color" aria-label="Pick accent colour" value={form.accent || '#1d3f94'} disabled={!canEdit} onChange={set('accent')} /><input className="input" {...a('accent')} value={form.accent} onChange={set('accent')} placeholder="#1d3f94" style={{ maxWidth: 140 }} /></div></Field>
          <Field id="defaultMode" label="Default colour mode for new visitors"><select className="select" {...a('defaultMode')} value={form.defaultMode} onChange={set('defaultMode')}><option value="system">Follow device</option><option value="light">Light</option><option value="dark">Dark</option></select></Field>
        </div>
      </section>
    </form>
  );
}
