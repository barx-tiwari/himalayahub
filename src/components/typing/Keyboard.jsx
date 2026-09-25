const ROWS = [
  [['`'], ['1'], ['2'], ['3'], ['4'], ['5'], ['6'], ['7'], ['8'], ['9'], ['0'], ['-'], ['='], ['Backspace', 'w18']],
  [['Tab', 'w15'], ['q'], ['w'], ['e'], ['r'], ['t'], ['y'], ['u'], ['i'], ['o'], ['p'], ['['], [']'], ['\\', 'w15']],
  [['Caps', 'w18'], ['a'], ['s'], ['d'], ['f'], ['g'], ['h'], ['j'], ['k'], ['l'], [';'], ["'"], ['Enter', 'w22']],
  [['Shift', 'w22'], ['z'], ['x'], ['c'], ['v'], ['b'], ['n'], ['m'], [','], ['.'], ['/'], ['Shift', 'w22']],
  [[' ', 'w6']],
];

const SHIFTED = {
  '~': '`', '!': '1', '@': '2', '#': '3', $: '4', '%': '5', '^': '6', '&': '7', '*': '8', '(': '9', ')': '0',
  _: '-', '+': '=', '{': '[', '}': ']', '|': '\\', ':': ';', '"': "'", '<': ',', '>': '.', '?': '/',
};

/** Returns the base key for a character, and whether Shift is needed. */
export function keyFor(ch) {
  if (ch == null) return { key: null, shift: false };
  if (SHIFTED[ch]) return { key: SHIFTED[ch], shift: true };
  if (ch >= 'A' && ch <= 'Z') return { key: ch.toLowerCase(), shift: true };
  return { key: ch, shift: false };
}

/**
 * Visual keyboard. `highlight` = keys taught in the lesson, `next` = the next
 * character to type (shown filled, with Shift when needed).
 */
export default function Keyboard({ highlight = [], next }) {
  const targets = new Set(highlight.map((k) => keyFor(k).key));
  const { key: nextKey, shift } = keyFor(next);
  return (
    <div className="keyboard" aria-hidden="true">
      {ROWS.map((row, r) => (
        <div className="kb-row" key={r}>
          {row.map(([k, w], i) => {
            const isNext = k === nextKey || (shift && k === 'Shift');
            const cls = ['key', w, targets.has(k) && 'target', isNext && 'next', (k === 'f' || k === 'j') && 'home-bump'].filter(Boolean).join(' ');
            return <span key={`${k}-${i}`} className={cls}>{k === ' ' ? 'Space' : k.length === 1 ? k.toUpperCase() : k}</span>;
          })}
        </div>
      ))}
    </div>
  );
}
