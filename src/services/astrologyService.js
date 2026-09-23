/**
 * Entertainment-only astrology.
 *
 * By default readings are generated locally from templates (deterministic per
 * person + day). To use a real AI model, deploy a small backend or serverless
 * function that holds the AI provider key and set VITE_ASTROLOGY_API_URL.
 * The frontend never sees the secret key.
 *
 * Expected backend contract:
 *   POST { question, profile: { name, sign, birthDate, birthTime, birthPlace } }
 *   → { reply: string }
 */
import { requestJSON } from './apiClient';
import { getSign } from '../data/zodiac';
import { pick, seededRandom } from '../utils/random';
import { dateKey } from '../utils/format';

const API_URL = import.meta.env.VITE_ASTROLOGY_API_URL || '';
export const isAstrologyApiConfigured = () => Boolean(API_URL);

const THEMES = {
  day: [
    'a steady, productive rhythm if you tackle the hardest task first',
    'small conversations that turn out more useful than they seem',
    'a good moment to tidy up unfinished work before starting something new',
    'curiosity: follow a question further than usual',
    'patience, especially with plans that depend on other people',
    'a quiet boost of confidence after you finish one clear goal',
  ],
  career: [
    'Focus on one skill and practise it deliberately; progress will be easier to see.',
    'Share an idea you have been holding back. Timing favours clear, simple proposals.',
    'Organise your notes and deadlines; structure brings calm this week.',
    'Collaboration helps more than competition right now. Ask a classmate or colleague to review your work.',
    'Revisit fundamentals. A basic concept you strengthen today supports bigger goals later.',
  ],
  relationships: [
    'Listening closely matters more than having the perfect answer.',
    'A thoughtful message to an old friend could brighten both your days.',
    'Be clear about what you need; people cannot guess.',
    'Shared activities build connection better than long discussions this week.',
    'Kindness toward yourself makes it easier to be patient with others.',
  ],
  advice: [
    'Take short breaks and drink water between study sessions.',
    'Write tomorrow\'s top three tasks before you sleep.',
    'Say yes to one new experience, and no to one unnecessary obligation.',
    'Finish what you start today, even if it is small.',
    'Step outside for fresh air; a short walk resets focus.',
  ],
};

function seedFor(profile, extra = '') {
  return `${profile.name || 'guest'}|${profile.sign}|${dateKey()}|${extra}`;
}

export function buildReading(profile) {
  const sign = getSign(profile.sign);
  const rand = seededRandom(seedFor(profile));
  return {
    sign,
    daily: `Today highlights ${pick(THEMES.day, rand)}. ${pick(THEMES.advice, rand)}`,
    personality: `${sign.name} is traditionally described as ${sign.traits}. Typical strengths: ${sign.strengths}.`,
    career: pick(THEMES.career, rand),
    relationships: pick(THEMES.relationships, rand),
    luckyNumber: 1 + Math.floor(rand() * 9) + Math.floor(rand() * 3) * 9,
    luckyColor: pick(sign.colors, rand),
  };
}

const SENSITIVE = [
  { re: /(health|sick|ill|disease|pain|medicine|doctor|pregnan)/i, note: 'For anything about health, please talk to a qualified doctor. Astrology cannot diagnose or treat anything.' },
  { re: /(money|invest|stock|loan|lottery|crypto|business|salary)/i, note: 'For money decisions, rely on real information and a qualified financial adviser, not astrology.' },
  { re: /(court|legal|lawyer|case|visa)/i, note: 'For legal matters, consult a qualified lawyer or the relevant official office.' },
];

function localReply(question, profile) {
  const sign = getSign(profile.sign);
  const rand = seededRandom(seedFor(profile, question.toLowerCase()));
  const q = question.toLowerCase();
  let body;
  if (/(love|relationship|partner|crush|friend|family|marriage)/.test(q)) {
    body = `For ${sign.name}, relationship themes today lean toward openness. ${pick(THEMES.relationships, rand)}`;
  } else if (/(career|job|work|study|exam|college|interview|project)/.test(q)) {
    body = `${sign.element} signs like ${sign.name} are said to do well with a clear plan. ${pick(THEMES.career, rand)}`;
  } else if (/(week|month|year|future)/.test(q)) {
    body = `The coming days suggest ${pick(THEMES.day, rand)}. ${pick(THEMES.career, rand)}`;
  } else {
    body = `Today looks like ${pick(THEMES.day, rand)}. With ${sign.planet} as your traditional ruling planet, lean into your ${sign.strengths.split(',')[0].trim()}. ${pick(THEMES.advice, rand)}`;
  }
  const sensitive = SENSITIVE.find((s) => s.re.test(question));
  return sensitive ? `${body}\n\n${sensitive.note}` : body;
}

export async function askAstrologer(question, profile) {
  if (API_URL) {
    const data = await requestJSON(API_URL, { method: 'POST', body: { question, profile } });
    if (!data || typeof data.reply !== 'string') throw new Error('Unexpected response from the astrology service.');
    return data.reply;
  }
  // Simulate a short "thinking" delay so the UI feels like a chat.
  await new Promise((r) => setTimeout(r, 650));
  return localReply(question, profile);
}
