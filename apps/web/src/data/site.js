/**
 * Brand and contact details in one place. Change them here and every
 * component (navbar, footer, WhatsApp buttons, metadata) follows.
 */
export const BRAND = {
  name: 'HimalayaHub',
  wordmark: 'HIMALAYAHUB',
  tagline: 'Learn • Explore • Discover',
  secondary: 'Your gateway to knowledge, Nepal, travel, technology and the world.',
  description: 'A modern digital platform connecting learning, technology, Nepal, travel and everyday information.',
  seoTitle: 'HimalayaHub — Learn • Explore • Discover Nepal',
  seoDescription: 'HimalayaHub is a modern platform for learning, Nepal travel discovery, live news, sports, weather, markets and useful student tools.',
};

/** WhatsApp: local number shown to people, international number used in the link. */
export const WHATSAPP = {
  local: '9863903703',
  display: '986-390-3703',
  international: '9779863903703', // +977 (Nepal) + number, no plus sign or spaces
  defaultMessage: 'Hello HimalayaHub, I need some help.',
};

export function whatsappLink(message = WHATSAPP.defaultMessage) {
  const base = `https://wa.me/${WHATSAPP.international}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
