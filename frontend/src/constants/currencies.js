export const CURRENCIES = [
  { code: 'NPR', symbol: 'Rs.', name: 'Nepalese Rupee', locale: 'ne-NP' },
  { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
];

export const DEFAULT_CURRENCY = 'NPR';

export const getCurrencyByCode = (code) =>
  CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];

export const DATE_FORMATS = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
];

export const FIRST_DAY_OPTIONS = [
  { value: 'sunday', label: 'Sunday' },
  { value: 'monday', label: 'Monday' },
];
