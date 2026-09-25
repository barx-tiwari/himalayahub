import { useState } from 'react';
import { Mail } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { WhatsAppButton } from '../components/contact/WhatsApp';
import { useWhatsAppLink } from '../context/SiteSettingsContext';

// Change this to your real address. To store messages instead, POST the form to your backend.
const CONTACT_EMAIL = 'hello@himalayahub.example';

export default function Contact() {
  useDocumentTitle('Contact');
  const wa = useWhatsAppLink();
  const [form, setForm] = useState({ name: '', subject: '', message: '' });
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) { setError('Please add your name and a message.'); return; }
    setError('');
    const body = `${form.message}\n\n— ${form.name}`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(form.subject || 'HimalayaHub feedback')}&body=${encodeURIComponent(body)}`;
  };
  return (
    <div className="container page">
      <header className="page-header"><h1>Contact</h1><p>Questions, corrections or ideas? The quickest way to reach us is WhatsApp.</p></header>
      <section className="card wa-card" style={{ maxWidth: 620, marginBottom: 24 }} aria-labelledby="wa-h">
        <h2 id="wa-h" style={{ fontSize: 'var(--fs-xl)' }}>Need help? Chat on WhatsApp</h2>
        <p className="muted">Message us on WhatsApp at <strong>{wa.number}</strong>.</p>
        <WhatsAppButton>Need Help? Chat on WhatsApp</WhatsAppButton>
      </section>
      <h2 style={{ fontSize: 'var(--fs-lg)' }}>Or send an email</h2>
      <form className="card stack" style={{ maxWidth: 620 }} onSubmit={submit} noValidate>
        <div className="field"><label htmlFor="c-name">Name</label><input id="c-name" className="input" value={form.name} onChange={set('name')} autoComplete="name" /></div>
        <div className="field"><label htmlFor="c-subject">Subject</label><input id="c-subject" className="input" value={form.subject} onChange={set('subject')} /></div>
        <div className="field"><label htmlFor="c-msg">Message</label><textarea id="c-msg" className="textarea" rows={6} value={form.message} onChange={set('message')} /></div>
        {error && <p role="alert" style={{ color: 'var(--danger)', margin: 0 }}>{error}</p>}
        <div className="row">
          <button type="submit" className="btn btn-primary"><Mail aria-hidden="true" /> Open in email app</button>
          <span className="small muted">This opens your email app addressed to {CONTACT_EMAIL}.</span>
        </div>
      </form>
    </div>
  );
}
