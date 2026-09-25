import { redact } from './redact.js';

type Level = 'debug' | 'info' | 'warn' | 'error';
const ORDER: Level[] = ['debug', 'info', 'warn', 'error'];
const min = ORDER.indexOf((process.env.LOG_LEVEL as Level) || 'info');

/** Structured JSON logs to stdout (collected by the host). Everything passes through redact(). */
function write(level: Level, msg: string, ctx?: Record<string, unknown>) {
  if (ORDER.indexOf(level) < min) return;
  const line = JSON.stringify({ t: new Date().toISOString(), level, msg, ...(ctx ? (redact(ctx) as object) : {}) });
  (level === 'error' ? process.stderr : process.stdout).write(line + '\n');
}
export const logger = {
  debug: (m: string, c?: Record<string, unknown>) => write('debug', m, c),
  info: (m: string, c?: Record<string, unknown>) => write('info', m, c),
  warn: (m: string, c?: Record<string, unknown>) => write('warn', m, c),
  error: (m: string, c?: Record<string, unknown>) => write('error', m, c),
};
