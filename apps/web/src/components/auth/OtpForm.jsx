import { useEffect, useRef, useState } from 'react';
import { MailCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * 6-digit email code entry. Accepts paste of the whole code, auto-submits when complete,
 * and offers "Resend" after a 60-second cooldown (the API enforces the same limits).
 */
export default function OtpForm({ onVerified, intro }) {
  const { user, verifyOtp, resendOtp } = useAuth();
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(60);
  const refs = useRef([]);
  useEffect(() => { refs.current[0]?.focus(); }, []);
  useEffect(() => { if (cooldown <= 0) return undefined; const t = setTimeout(() => setCooldown((c) => c - 1), 1000); return () => clearTimeout(t); }, [cooldown]);

  const submit = async (code) => {
    if (busy || !/^\d{6}$/.test(code)) return;
    setBusy(true); setMsg(null);
    try { await verifyOtp(code); onVerified?.(); }
    catch (e) { setMsg({ type: 'error', text: e.message }); setDigits(['', '', '', '', '', '']); refs.current[0]?.focus(); }
    finally { setBusy(false); }
  };
  const setAt = (i, v) => {
    const clean = v.replace(/\D/g, '');
    if (clean.length > 1) { // pasted or autofilled the whole code
      const next = clean.slice(0, 6).padEnd(6, ' ').split('').map((c) => c.trim());
      setDigits(next); refs.current[Math.min(clean.length, 5)]?.focus();
      if (clean.length >= 6) submit(clean.slice(0, 6));
      return;
    }
    const next = [...digits]; next[i] = clean; setDigits(next);
    if (clean && i < 5) refs.current[i + 1]?.focus();
    if (next.every(Boolean)) submit(next.join(''));
  };
  const onKey = (i, e) => { if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus(); };
  const resend = async () => {
    setMsg(null);
    try { setMsg({ type: 'success', text: await resendOtp() }); setCooldown(60); }
    catch (e) { setMsg({ type: 'error', text: e.message }); }
  };

  return (
    <form className="otp" onSubmit={(e) => { e.preventDefault(); submit(digits.join('')); }} noValidate>
      <p className="otp-intro"><MailCheck aria-hidden="true" className="inline-ico" /> {intro || <>We emailed a 6-digit code to <strong>{user?.email}</strong>. It’s valid for 10 minutes.</>}</p>
      <fieldset className="otp-boxes"><legend className="sr-only">Verification code</legend>
        {digits.map((d, i) => (
          <input key={i} ref={(el) => { refs.current[i] = el; }} className="input otp-box" inputMode="numeric" autoComplete={i === 0 ? 'one-time-code' : 'off'}
            pattern="[0-9]*" maxLength={i === 0 ? 6 : 1} aria-label={`Digit ${i + 1} of 6`} value={d} disabled={busy}
            onChange={(e) => setAt(i, e.target.value)} onKeyDown={(e) => onKey(i, e)} />
        ))}
      </fieldset>
      {msg && <p className={`alert-inline ${msg.type === 'error' ? 'error' : 'success'}`} role={msg.type === 'error' ? 'alert' : 'status'}>{msg.text}</p>}
      <button type="submit" className="btn btn-primary btn-block" disabled={busy || !digits.every(Boolean)}>{busy ? 'Checking…' : 'Confirm email'}</button>
      <p className="small muted" style={{ margin: 0, textAlign: 'center' }}>
        Didn’t get it? Check spam, or {cooldown > 0 ? <>resend in {cooldown}s</> : <button type="button" className="linklike" onClick={resend}>send a new code</button>}.
      </p>
    </form>
  );
}
