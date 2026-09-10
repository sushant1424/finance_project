import { getCurrencyByCode } from '@/constants/currencies';

/** Format amount with currency symbol (e.g. Rs. 1,250.00). */
export function formatCurrency(amount, currencyCode = 'NPR', showCents = true) {
  const num = Number(amount);
  const { code, symbol, locale } = getCurrencyByCode(currencyCode);
  if (Number.isNaN(num)) return `${symbol} 0`;

  const fractionDigits = showCents ? 2 : 0;
  // NPR: Latin digits + Indian grouping; other codes use their locale
  const numberLocale = code === 'NPR' ? 'en-IN' : locale;
  const formatted = new Intl.NumberFormat(numberLocale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(num);

  return `${symbol} ${formatted}`;
}
