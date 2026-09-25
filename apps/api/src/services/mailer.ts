import { env, isProd } from '../config/env.js';
import { logger } from '../lib/logger.js';

/**
 * Mail delivery behind a tiny interface. Development prints links to the console so
 * verification/reset flows can be tested without an SMTP account. In production,
 * plug in a provider (SMTP via nodemailer, Resend, SES…) in `send()`.
 */
export interface Mail { to: string; subject: string; text: string }

export async function sendMail(mail: Mail) {
  if (!isProd && !env.MAIL_SEND_IN_DEV) {
    // eslint-disable-next-line no-console
    console.log(`\n── Dev email to ${mail.to} ──\nSubject: ${mail.subject}\n${mail.text}\n──────────────\n`);
    return;
  }
  try {
    if (env.MAIL_PROVIDER === 'resend' && env.MAIL_API_KEY) return await viaResend(mail);
    if (env.MAIL_PROVIDER === 'brevo' && env.MAIL_API_KEY) return await viaBrevo(mail);
    if (env.SMTP_URL) return await viaSmtp(mail);
  } catch (e) {
    logger.error('Email delivery failed', { subject: mail.subject, error: (e as Error).message });
    throw new Error('MAIL_FAILED');
  }
  logger.error('Email not sent: set MAIL_PROVIDER + MAIL_API_KEY, or SMTP_URL (see docs/V5.md).', { subject: mail.subject });
  throw new Error('MAIL_NOT_CONFIGURED');
}

/** "Name <addr@x>" → { name, email } */
function fromParts() {
  const m = env.MAIL_FROM.match(/^\s*"?([^"<]*)"?\s*<([^>]+)>\s*$/);
  return m ? { name: m[1]!.trim(), email: m[2]!.trim() } : { name: 'HimalayaHub', email: env.MAIL_FROM.trim() };
}
async function post(url: string, headers: Record<string, string>, body: unknown) {
  const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body), signal: AbortSignal.timeout(10_000) });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
}
const viaResend = (m: Mail) => post('https://api.resend.com/emails', { authorization: `Bearer ${env.MAIL_API_KEY}` }, { from: env.MAIL_FROM, to: [m.to], subject: m.subject, text: m.text });
const viaBrevo = (m: Mail) => post('https://api.brevo.com/v3/smtp/email', { 'api-key': env.MAIL_API_KEY! }, { sender: fromParts(), to: [{ email: m.to }], subject: m.subject, textContent: m.text });
/** SMTP needs the optional `nodemailer` package: npm i nodemailer -w @himalayahub/api */
async function viaSmtp(m: Mail) {
  let nm: { createTransport(url: string): { sendMail(o: object): Promise<unknown> } };
  try { nm = (await import('nodemailer' as string)).default; } catch { throw new Error('SMTP_URL is set but nodemailer is not installed'); }
  await nm.createTransport(env.SMTP_URL!).sendMail({ from: env.MAIL_FROM, to: m.to, subject: m.subject, text: m.text });
}

export const verifyEmailMail = (to: string, link: string, code?: string): Mail => ({
  to, subject: code ? `${code} is your HimalayaHub code` : 'Confirm your HimalayaHub email',
  text: `Namaste!\n\n${code ? `Your verification code is:\n\n    ${code}\n\nEnter it on the website within 10 minutes. Never share this code — HimalayaHub staff will never ask for it.\n\nOr confirm with this link (valid 24 hours):\n` : 'Confirm your email to finish setting up your HimalayaHub account:\n'}${link}\n\nIf you didn’t create an account, you can ignore this email.`,
});
export const resetPasswordMail = (to: string, link: string): Mail => ({
  to, subject: 'Reset your HimalayaHub password',
  text: `Someone asked to reset the password for this HimalayaHub account.\n\nReset it here (valid for 30 minutes):\n${link}\n\nIf this wasn’t you, ignore this email — your password stays the same.`,
});
