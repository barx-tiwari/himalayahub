import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { askAstrologer, isAstrologyApiConfigured } from '../../services/astrologyService';

const PROMPTS = ['What does today look like for me?', 'Any advice for my studies?', 'How can I improve my relationships?', 'What is my lucky color?'];

/** Chat-style interface. Every AI reply is clearly labelled as entertainment. */
export default function AstrologyChat({ profile }) {
  const [messages, setMessages] = useState(() => [{
    role: 'ai', text: `Namaste${profile.name ? `, ${profile.name}` : ''}! Ask me anything about your day, studies or relationships. I'll answer in the spirit of ${profile.signName} — just for fun.`,
  }]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const logRef = useRef(null);

  useEffect(() => { logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' }); }, [messages, busy]);

  const send = async (q) => {
    const question = q.trim();
    if (!question || busy) return;
    setMessages((m) => [...m, { role: 'user', text: question }]);
    setText('');
    setBusy(true);
    try {
      const reply = await askAstrologer(question, profile);
      setMessages((m) => [...m, { role: 'ai', text: reply }]);
    } catch {
      setMessages((m) => [...m, { role: 'ai', error: true, text: 'Something went wrong. Please try again.' }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="chat">
      <div className="chat-log" ref={logRef} role="log" aria-live="polite" aria-label="Conversation with the AI astrologer">
        {messages.map((m, i) => (
          <div key={i} className={`bubble ${m.role === 'user' ? 'bubble-user' : 'bubble-ai'}`}>
            {m.role === 'ai' && <span className="bubble-tag">{m.error ? 'Error' : `AI Astrologer · entertainment${isAstrologyApiConfigured() ? '' : ' · offline mode'}`}</span>}
            <span className="sr-only">{m.role === 'user' ? 'You said: ' : 'Astrologer replied: '}</span>
            {m.text}
          </div>
        ))}
        {busy && <div className="bubble bubble-ai" aria-label="Astrologer is typing"><span className="typing-dots" aria-hidden="true"><span /><span /><span /></span></div>}
      </div>
      <div className="prompt-chips" aria-label="Suggested questions">
        {PROMPTS.map((p) => <button key={p} type="button" onClick={() => send(p)} disabled={busy}>{p}</button>)}
      </div>
      <form className="chat-form" onSubmit={(e) => { e.preventDefault(); send(text); }}>
        <label htmlFor="astro-q" className="sr-only">Ask the astrologer</label>
        <input id="astro-q" className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask a question…" maxLength={300} autoComplete="off" />
        <button type="submit" className="btn btn-primary btn-icon" disabled={busy || !text.trim()} aria-label="Send question"><Send aria-hidden="true" /></button>
      </form>
    </div>
  );
}
