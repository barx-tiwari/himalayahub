import { codeSnippets, paragraphs, wordBank } from '../data/typingTexts';
import { pick, seededRandom, shuffle } from './random';

/**
 * Build a practice text long enough for the chosen duration.
 * Roughly 14 characters per second covers even very fast typists (~170 WPM).
 */
export function generateText({ mode, level, durationSec, seed }) {
  const rand = seed ? seededRandom(seed) : Math.random;
  const target = durationSec ? Math.max(200, durationSec * 14) : 320;

  if (mode === 'words') {
    const words = [];
    let length = 0;
    while (length < target) {
      const w = pick(wordBank[level], rand);
      words.push(w);
      length += w.length + 1;
    }
    return words.join(' ');
  }

  // Code snippets are flattened to one line so the typing surface is a single
  // stream of characters (Enter is not part of the challenge).
  const source = mode === 'code'
    ? codeSnippets[level].map((s) => s.replace(/\n\s*/g, ' '))
    : paragraphs[level];

  let pieces = shuffle(source, rand);
  let out = '';
  while (out.length < target) {
    if (!pieces.length) pieces = shuffle(source, rand);
    out = out ? `${out} ${pieces.shift()}` : pieces.shift();
  }
  return out;
}
