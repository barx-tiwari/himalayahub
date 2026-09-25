import { memo, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';

const Chars = memo(function Chars({ text, input }) {
  const caret = input.length;
  return text.split('').map((ch, i) => {
    let cls = 'ch';
    if (i < caret) cls += input[i] === ch ? ' ch-correct' : ` ch-wrong${ch === ' ' ? ' space' : ''}`;
    if (i === caret) cls += ' ch-current';
    return <span key={i} className={cls} data-i={i}>{ch}</span>;
  });
});

/**
 * Keyboard-first typing surface. A transparent <textarea> sits over the
 * rendered text so it works with physical keyboards, mobile keyboards and
 * screen readers. Enter and paste are blocked; Esc restarts.
 */
export default function TypingBox({ text, input, status, onChange, onRestart, autoFocus = true, label = 'Typing area' }) {
  const inputRef = useRef(null);
  const innerRef = useRef(null);
  const surfaceRef = useRef(null);
  const [focused, setFocused] = useState(false);
  const [offset, setOffset] = useState(0);
  const descId = useId();

  useEffect(() => { if (autoFocus) inputRef.current?.focus(); }, [autoFocus, text]);

  // Keep the current line visible: scroll so the caret sits on the 2nd line.
  useLayoutEffect(() => {
    const inner = innerRef.current;
    const surface = surfaceRef.current;
    if (!inner || !surface) return;
    const el = inner.querySelector(`[data-i="${Math.min(input.length, text.length - 1)}"]`);
    if (!el) return;
    const lineH = parseFloat(getComputedStyle(surface).lineHeight) || 40;
    const top = el.offsetTop;
    setOffset(Math.max(0, top - lineH));
  }, [input.length, text]);

  useEffect(() => { if (status === 'idle') setOffset(0); }, [status, text]);

  const onKeyDown = (e) => {
    if (e.key === 'Enter') e.preventDefault();
    if (e.key === 'Escape') { e.preventDefault(); onRestart?.(); }
  };

  const showOverlay = !focused && status !== 'finished';

  return (
    <div className="typing-card card" onClick={() => inputRef.current?.focus()}>
      <div ref={surfaceRef} className={`typing-surface${showOverlay ? ' is-blurred' : ''}`} aria-hidden="true">
        <div ref={innerRef} style={{ transform: `translateY(-${offset}px)`, transition: 'transform .15s ease' }}>
          <Chars text={text} input={input} />
        </div>
      </div>
      <p id={descId} className="sr-only">Type this text: {text}</p>
      <textarea
        ref={inputRef}
        className="typing-input"
        value={input}
        onChange={(e) => onChange(e.target.value.replace(/\n/g, ''))}
        onKeyDown={onKeyDown}
        onPaste={(e) => e.preventDefault()}
        onDrop={(e) => e.preventDefault()}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        disabled={status === 'finished'}
        aria-label={label}
        aria-describedby={descId}
        autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
      />
      {showOverlay && (
        <div className="typing-overlay"><span>{status === 'running' ? 'Paused view — click or press Tab to continue' : 'Click here or press Tab, then start typing'}</span></div>
      )}
    </div>
  );
}
