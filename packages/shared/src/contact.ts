/** Builds a wa.me link from whatever format an admin types (+977 986-390-3703, 9863903703…). */
export function normalizeWhatsApp(input: string, defaultCountry = '977'): string | null {
  const digits = String(input || '').replace(/\D/g, '');
  if (!digits) return null;
  if (digits.length === 10 && digits.startsWith('9')) return defaultCountry + digits; // Nepal mobile without code
  if (digits.startsWith('00')) return digits.slice(2);
  return digits.length >= 8 && digits.length <= 15 ? digits : null;
}

export function whatsappUrl(number: string, message?: string): string | null {
  const n = normalizeWhatsApp(number);
  if (!n) return null;
  return `https://wa.me/${n}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
}

export const slugify = (s: string) => String(s).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
  .trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 120);
