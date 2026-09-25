import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSiteSettings, useWhatsAppLink } from '../../context/SiteSettingsContext';

/** Generic chat-bubble glyph (not WhatsApp's trademarked logo — swap in the official asset if you wish). */
export function ChatIcon(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M12 2.5a9.5 9.5 0 0 0-8.2 14.3L2.6 21.4l4.8-1.2A9.5 9.5 0 1 0 12 2.5Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M8.6 7.6c.3-.3.8-.3 1 0l1 1.6c.2.3.1.7-.1 1l-.5.5c.5 1.2 1.5 2.2 2.7 2.8l.5-.5c.3-.3.7-.3 1-.1l1.6 1c.3.2.4.7.1 1l-.7.8c-.5.5-1.3.7-2 .4a8.4 8.4 0 0 1-4.7-4.7c-.3-.7-.1-1.5.4-2Z" fill="currentColor" />
    </svg>
  );
}

/** ContactWhatsAppButton: inline button; number and default message come from Site Settings. */
export function WhatsAppButton({ children = 'Chat with us on WhatsApp', message, className = '', size = 'lg' }) {
  const { href } = useWhatsAppLink(message);
  return (
    <a className={`btn btn-wa btn-${size} ${className}`} href={href} target="_blank" rel="noopener noreferrer">
      <ChatIcon /> {children}<span className="sr-only"> (opens WhatsApp in a new tab)</span>
    </a>
  );
}

/** Floating button, bottom-right. Hides while an inline WhatsApp section is on screen so the two never stack. */
/** FloatingWhatsAppButton. */
export function WhatsAppFloat() {
  const { pathname } = useLocation();
  const { href } = useWhatsAppLink();
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    setHidden(false);
    if (!('IntersectionObserver' in window)) return undefined;
    const targets = document.querySelectorAll('[data-wa-section], .footer');
    if (!targets.length) return undefined;
    const seen = new Set();
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => (e.isIntersecting ? seen.add(e.target) : seen.delete(e.target)));
      setHidden([...seen].some((t) => t.hasAttribute('data-wa-section')));
    }, { threshold: 0.25 });
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [pathname]);
  return (
    <a className={`wa-float${hidden ? ' is-hidden' : ''}`} href={href} target="_blank" rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp (opens in a new tab)" tabIndex={hidden ? -1 : undefined} aria-hidden={hidden || undefined}>
      <ChatIcon className="wa-float-icon" />
      <span className="wa-float-label" aria-hidden="true">Chat with us</span>
    </a>
  );
}

export function WhatsAppSection({ title = 'Have a question?' }) {
  const { settings } = useSiteSettings();
  const { digits } = useWhatsAppLink();
  const local = digits.startsWith('977') ? digits.slice(3) : digits;
  return (
    <section className="wa-section" data-wa-section aria-labelledby="wa-title">
      <div className="container wa-inner">
        <div>
          <h2 id="wa-title">{title}</h2>
          <p>Need help, want to report an issue, or have a suggestion?</p>
        </div>
        <div className="wa-actions">
          <WhatsAppButton>Chat with {settings.siteName}</WhatsAppButton>
          <p className="wa-number">WhatsApp <a href={`tel:+${digits}`}>{local}</a></p>
        </div>
      </div>
    </section>
  );
}

export const FloatingWhatsAppButton = WhatsAppFloat;
export const ContactWhatsAppButton = WhatsAppButton;
