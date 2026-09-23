import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { computeTypingStats } from '../utils/typingStats';

/**
 * Core typing state machine used by the challenge and the lessons.
 * status: 'idle' -> 'running' -> 'finished'
 * durationSec = null means untimed (finishes when the text is complete).
 */
export function useTypingEngine({ text, durationSec = null, onFinish }) {
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('idle');
  const [startedAt, setStartedAt] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [keystrokes, setKeystrokes] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const finishedRef = useRef(false);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  const reset = useCallback(() => {
    setInput('');
    setStatus('idle');
    setStartedAt(null);
    setKeystrokes(0);
    setMistakes(0);
    finishedRef.current = false;
  }, []);

  // Reset whenever the text or duration changes.
  useEffect(() => { reset(); }, [text, durationSec, reset]);

  useEffect(() => {
    if (status !== 'running') return undefined;
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, [status]);

  const elapsedMs = startedAt ? Math.max(0, now - startedAt) : 0;
  const cappedElapsed = durationSec ? Math.min(elapsedMs, durationSec * 1000) : elapsedMs;

  const stats = useMemo(
    () => computeTypingStats({ text, input, keystrokes, mistakes, elapsedMs: cappedElapsed }),
    [text, input, keystrokes, mistakes, cappedElapsed],
  );

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setStatus('finished');
    setNow(Date.now());
  }, []);

  // Time limit reached
  useEffect(() => {
    if (status === 'running' && durationSec && elapsedMs >= durationSec * 1000) finish();
  }, [status, durationSec, elapsedMs, finish]);

  // Report results once, after the finished render has the final numbers.
  const reportedRef = useRef(false);
  useEffect(() => {
    if (status === 'finished' && !reportedRef.current) {
      reportedRef.current = true;
      onFinishRef.current?.({ ...stats, elapsedMs: cappedElapsed });
    }
    if (status !== 'finished') reportedRef.current = false;
  }, [status, stats, cappedElapsed]);

  const handleChange = useCallback((value) => {
    if (status === 'finished') return;
    const next = value.slice(0, text.length);
    if (next.length > input.length) {
      // count each newly typed character
      let added = 0;
      let wrong = 0;
      for (let i = input.length; i < next.length; i += 1) {
        added += 1;
        if (next[i] !== text[i]) wrong += 1;
      }
      setKeystrokes((k) => k + added);
      setMistakes((m) => m + wrong);
    }
    if (status === 'idle' && next.length > 0) {
      const t = Date.now();
      setStartedAt(t);
      setNow(t);
      setStatus('running');
    }
    setInput(next);
    if (next.length >= text.length && text.length > 0) {
      setNow(Date.now());
      finish();
    }
  }, [status, text, input.length, finish]);

  const timeLeft = durationSec ? Math.max(0, Math.ceil(durationSec - cappedElapsed / 1000)) : null;

  return { input, status, stats, timeLeft, elapsedMs: cappedElapsed, handleChange, reset, finish };
}
