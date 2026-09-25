export const currencies = [
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'NPR', name: 'Nepalese Rupee', flag: '🇳🇵' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
  { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳' },
  { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵' },
  { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳' },
  { code: 'AED', name: 'UAE Dirham', flag: '🇦🇪' },
  { code: 'SAR', name: 'Saudi Riyal', flag: '🇸🇦' },
];

/**
 * Offline SAMPLE rates (units per 1 USD) for demonstration only.
 * They are approximate, not live, and must not be used for real transactions.
 * INR→NPR uses Nepal's fixed peg of 1 INR = 1.6 NPR.
 */
export const SAMPLE_RATES_USD = {
  USD: 1,
  NPR: 142.4,
  EUR: 0.86,
  GBP: 0.75,
  INR: 89,
  AUD: 1.52,
  CAD: 1.38,
  JPY: 148,
  CNY: 7.12,
  AED: 3.6725,
  SAR: 3.75,
};
