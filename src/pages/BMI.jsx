import { useMemo, useState } from 'react';
import Segmented from '../components/ui/Segmented';
import Alert from '../components/ui/Alert';
import Disclaimer, { HEALTH_DISCLAIMER } from '../components/live/Disclaimer';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

/** Standard adult categories (WHO). Neutral, clinical wording only. */
const CATEGORIES = [
  { max: 18.5, label: 'Underweight range', note: 'BMI below 18.5.' },
  { max: 25, label: 'Healthy weight range', note: 'BMI 18.5 to 24.9.' },
  { max: 30, label: 'Overweight range', note: 'BMI 25 to 29.9.' },
  { max: Infinity, label: 'Obesity range', note: 'BMI 30 or above.' },
];

function toMeters(unit, cm, m, ft, inch) {
  if (unit === 'cm') return Number(cm) / 100;
  if (unit === 'm') return Number(m);
  return (Number(ft || 0) * 12 + Number(inch || 0)) * 0.0254;
}

export default function BMI() {
  useDocumentTitle('BMI Calculator');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');
  const [hUnit, setHUnit] = useState('cm');
  const [cm, setCm] = useState(''); const [m, setM] = useState(''); const [ft, setFt] = useState(''); const [inch, setIn] = useState('');
  const [wUnit, setWUnit] = useState('kg');
  const [weight, setWeight] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const result = useMemo(() => {
    const h = toMeters(hUnit, cm, m, ft, inch);
    const kg = wUnit === 'kg' ? Number(weight) : Number(weight) * 0.45359237;
    const a = Number(age);
    const errors = [];
    if (!(a >= 2 && a <= 120)) errors.push('Enter an age between 2 and 120.');
    if (!(h >= 0.5 && h <= 2.5)) errors.push('Enter a height between 50 cm and 250 cm (1 ft 8 in to 8 ft 2 in).');
    if (!(kg >= 2 && kg <= 400)) errors.push('Enter a weight between 2 kg and 400 kg.');
    if (errors.length) return { errors };
    const bmi = kg / (h * h);
    return { bmi, adult: a >= 18, category: CATEGORIES.find((c) => bmi < c.max) };
  }, [age, hUnit, cm, m, ft, inch, wUnit, weight]);

  const pos = result.bmi ? Math.min(100, Math.max(0, ((result.bmi - 10) / 30) * 100)) : 0;

  return (
    <div className="container page" data-domain="tools">
      <header className="page-header">
        <h1>BMI Calculator</h1>
        <p>Body Mass Index is a simple screening number based on height and weight. Learn what it measures — and what it doesn&apos;t.</p>
      </header>
      <div className="bmi-layout">
        <form className="card stack" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} noValidate>
          <div className="unit-row">
            <div className="field"><label htmlFor="bmi-age">Age (years)</label><input id="bmi-age" className="input" type="number" inputMode="numeric" min="2" max="120" value={age} onChange={(e) => setAge(e.target.value)} required /></div>
            <div className="field"><label htmlFor="bmi-sex">Sex (optional)</label>
              <select id="bmi-sex" className="select" value={sex} onChange={(e) => setSex(e.target.value)}><option value="">Prefer not to say</option><option value="female">Female</option><option value="male">Male</option></select>
              <span className="field-hint">Only relevant to child growth charts; not used for adult BMI.</span></div>
          </div>
          <fieldset style={{ border: 0, padding: 0, margin: 0 }} className="stack">
            <legend className="label">Height</legend>
            <Segmented options={[{ id: 'cm', label: 'cm' }, { id: 'm', label: 'm' }, { id: 'ftin', label: 'ft / in' }]} value={hUnit} onChange={setHUnit} label="Height unit" />
            {hUnit === 'cm' && <div className="field"><label htmlFor="h-cm">Height in centimetres</label><input id="h-cm" className="input" type="number" inputMode="decimal" value={cm} onChange={(e) => setCm(e.target.value)} /></div>}
            {hUnit === 'm' && <div className="field"><label htmlFor="h-m">Height in metres</label><input id="h-m" className="input" type="number" step="0.01" inputMode="decimal" value={m} onChange={(e) => setM(e.target.value)} /></div>}
            {hUnit === 'ftin' && <div className="unit-row">
              <div className="field"><label htmlFor="h-ft">Feet</label><input id="h-ft" className="input" type="number" inputMode="numeric" value={ft} onChange={(e) => setFt(e.target.value)} /></div>
              <div className="field"><label htmlFor="h-in">Inches</label><input id="h-in" className="input" type="number" inputMode="decimal" value={inch} onChange={(e) => setIn(e.target.value)} /></div></div>}
          </fieldset>
          <fieldset style={{ border: 0, padding: 0, margin: 0 }} className="stack">
            <legend className="label">Weight</legend>
            <Segmented options={[{ id: 'kg', label: 'kg' }, { id: 'lb', label: 'lb' }]} value={wUnit} onChange={setWUnit} label="Weight unit" />
            <div className="field"><label htmlFor="w">Weight in {wUnit === 'kg' ? 'kilograms' : 'pounds'}</label><input id="w" className="input" type="number" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} /></div>
          </fieldset>
          <button type="submit" className="btn btn-primary">Calculate BMI</button>
        </form>

        <section className="card stack" aria-live="polite" aria-labelledby="bmi-result">
          <h2 id="bmi-result" className="card-title">Your result</h2>
          {!submitted ? <p className="muted" style={{ margin: 0 }}>Enter your details and select Calculate BMI.</p>
            : result.errors ? <Alert type="error"><ul style={{ margin: 0, paddingLeft: 18 }}>{result.errors.map((e) => <li key={e}>{e}</li>)}</ul></Alert>
              : (
                <>
                  <div><span className="stat-label">BMI</span><div className="bmi-value">{result.bmi.toFixed(1)}</div></div>
                  {result.adult ? (
                    <>
                      <p style={{ margin: 0 }}>Standard adult category: <strong>{result.category.label}</strong> <span className="muted">({result.category.note})</span></p>
                      <div className="bmi-scale" aria-hidden="true">
                        <div className="bands"><span /><span /><span /><span /></div>
                        <span className="marker" style={{ left: `${pos}%` }} />
                        <div className="ticks"><span>10</span><span>18.5</span><span>25</span><span>30</span><span>40</span></div>
                      </div>
                      <p className="small muted" style={{ margin: 0 }}>BMI does not measure body fat, muscle, bone density or where weight is carried, and it cannot describe how healthy a person is. Some health bodies use different cut-offs for people of Asian descent. A qualified healthcare professional can interpret it alongside other measures.</p>
                    </>
                  ) : (
                    <Alert type="info">For people under 18, BMI is interpreted using age- and sex-specific growth charts. Please discuss the result with a parent/guardian or qualified healthcare professional.</Alert>
                  )}
                </>
              )}
          <Disclaimer>{HEALTH_DISCLAIMER}</Disclaimer>
        </section>
      </div>

      <section className="section card prose" aria-labelledby="learn-bmi">
        <h2 id="learn-bmi">How BMI works</h2>
        <p>BMI = weight in kilograms ÷ (height in metres)². For example, 60 kg and 1.65 m gives 60 ÷ 2.72 ≈ 22.0.</p>
        <p>It was designed as a quick population-level screening tool. Two people with the same BMI can have very different health, fitness and body composition. If you have questions about your health, talk to a doctor or other qualified professional rather than relying on a single number.</p>
      </section>
    </div>
  );
}
