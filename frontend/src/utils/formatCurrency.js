import { getCurrencyByCode } from '@/constants/currencies';

export function formatCurrency(amount, currencyCode = 'NPR', showCents = true) {
  const num = Number(amount);
  if (Number.isNaN(num)) return '—';

  const { code, locale } = getCurrencyByCode(currencyCode);
  const fractionDigits = showCents ? 2 : 0;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: code,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(num);
}

export function formatCompactCurrency(amount, currencyCode = 'NPR') {
  const num = Number(amount);
  if (Number.isNaN(num)) return '—';

  const { code, locale } = getCurrencyByCode(currencyCode);
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: code,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(num);
}

export function parseCurrencyInput(value) {
  if (typeof value === 'number') return value;
  const cleaned = String(value).replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return Number.isNaN(parsed) ? 0 : parsed;
}
