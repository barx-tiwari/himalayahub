import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ExternalLink, Phone } from 'lucide-react';
import Alert from '../components/ui/Alert';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { areaContacts, loadEmergencyData, officialDirectories, telHref } from '../services/emergencyService';
import { emergencyCategories, nationalContacts, LAST_REVIEWED } from '../data/emergencyContacts';
import { getProvince, provinces } from '../data/nepalPlaces';
import { formatShortDate } from '../utils/format';

function ContactRows({ rows }) {
  return rows.map((c) => (
    <tr key={c.id || `${c.service}-${c.number}`}>
      <td><strong>{c.service}</strong>{c.category && <><br /><span className="small muted">{c.category}</span></>}{c.note && <><br /><span className="small muted">{c.note}</span></>}
        {c.link && <><br /><a className="small" href={c.link.url} target="_blank" rel="noopener noreferrer">{c.link.label}</a></>}</td>
      <td>{c.number ? <a href={telHref(c.number)}>{c.number}</a> : <span className="muted">See source</span>}</td>
      <td>{c.availability}</td>
      <td>{c.sourceUrl ? <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer">{c.source}</a> : c.source}<br /><span className="small muted">Last verified {formatShortDate(c.verifiedOn)}</span></td>
    </tr>
  ));
}

export default function Emergency() {
  useDocumentTitle('Emergency Help');
  const [data, setData] = useState({ national: nationalContacts, districts: {}, reviewed: LAST_REVIEWED });
  const [cat, setCat] = useState('All');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [municipality, setMunicipality] = useState('');
  useEffect(() => { loadEmergencyData().then(setData); }, []);

  const primary = data.national.filter((c) => c.primary && c.number);
  const rows = cat === 'All' ? data.national : data.national.filter((c) => c.category === cat);
  const area = useMemo(() => areaContacts(data.districts, district, municipality), [data.districts, district, municipality]);

  return (
    <div className="container page" data-domain="alert">
      <header className="page-header">
        <h1><span className="h1-emoji" aria-hidden="true">🚨</span> Emergency Help</h1>
        <p>Nepal-wide emergency and help numbers, each with its official source and the date it was last checked.</p>
      </header>
      <section className="card emergency-hero" aria-labelledby="now-title">
        <h2 id="now-title" className="card-title"><AlertTriangle size={20} aria-hidden="true" style={{ verticalAlign: '-3px', color: 'var(--c-red)' }} /> In immediate danger? Call now</h2>
        <div className="hotline-grid">
          {primary.map((c) => (
            <a key={c.id} className="hotline" href={telHref(c.number)}>
              <span className="num">{c.number}</span><span className="svc">{c.service}</span><small><Phone size={12} aria-hidden="true" /> Tap to call · {c.availability}</small>
            </a>
          ))}
        </div>
      </section>
      <Alert type="warning" className="section">Verify important emergency numbers from official government sources because contact information can change.</Alert>

      <section className="section" aria-labelledby="nat-title">
        <div className="section-title"><h2 id="nat-title">National Emergency Contacts</h2><span className="small muted">Directory reviewed {formatShortDate(data.reviewed)}</span></div>
        <div className="chip-tabs" role="group" aria-label="Filter by category" style={{ marginBottom: 12 }}>
          {['All', ...emergencyCategories].map((c) => <button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>)}
        </div>
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap"><table className="table contact-table"><caption className="sr-only">National emergency contacts</caption>
            <thead><tr><th scope="col">Service</th><th scope="col">Number</th><th scope="col">Availability</th><th scope="col">Source</th></tr></thead>
            <tbody><ContactRows rows={rows} /></tbody></table></div>
        </div>
      </section>

      <section className="section" aria-labelledby="area-title">
        <div className="section-title"><h2 id="area-title">Province / District Information</h2></div>
        <div className="toolbar">
          <div className="field"><label htmlFor="em-prov">Province</label>
            <select id="em-prov" className="select" value={province} onChange={(e) => { setProvince(e.target.value); setDistrict(''); setMunicipality(''); }}>
              <option value="">Select province</option>{provinces.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
          <div className="field"><label htmlFor="em-dist">District</label>
            <select id="em-dist" className="select" value={district} disabled={!province} onChange={(e) => { setDistrict(e.target.value); setMunicipality(''); }}>
              <option value="">Select district</option>{province && getProvince(province).districts.map((d) => <option key={d} value={d}>{d}</option>)}</select></div>
          <div className="field"><label htmlFor="em-mun">Municipality</label>
            <select id="em-mun" className="select" value={municipality} disabled={!area.municipalities.length} onChange={(e) => setMunicipality(e.target.value)}>
              <option value="">{district && !area.municipalities.length ? 'No verified entries yet' : 'Select municipality'}</option>
              {area.municipalities.map((m) => <option key={m} value={m}>{m}</option>)}</select></div>
        </div>
        {district ? (
          <div className="card">
            {area.contacts.length || area.municipalityContacts.length ? (
              <div className="table-wrap"><table className="table contact-table"><caption className="sr-only">Contacts for {district}</caption>
                <thead><tr><th scope="col">Service</th><th scope="col">Number</th><th scope="col">Availability</th><th scope="col">Source</th></tr></thead>
                <tbody><ContactRows rows={[...area.municipalityContacts, ...area.contacts]} /></tbody></table></div>
            ) : (
              <>
                <h3 className="card-title">{district} District</h3>
                <p className="small">HimalayaHub does not yet list verified local numbers for {district}. The national numbers above work everywhere in Nepal and route to your nearest unit. For the District Police Office, District Administration Office or your municipality, use these official directories:</p>
              </>
            )}
            <ul className="plain-list" style={{ marginTop: 8 }}>
              {officialDirectories.map((d) => <li key={d.url}><a href={d.url} target="_blank" rel="noopener noreferrer"><span>{d.label}</span><ExternalLink size={14} aria-hidden="true" /></a></li>)}
            </ul>
          </div>
        ) : <p className="small muted">Choose a province and district to see local information.</p>}
      </section>
      <p className="src-note section">Numbers are listed only when an official or cited source was checked. Where sources disagree (for example electricity fault lines), we link to the official contact page instead of guessing.</p>
    </div>
  );
}
