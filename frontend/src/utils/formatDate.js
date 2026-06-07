import { format, parseISO, isValid } from 'date-fns';

const FORMAT_MAP = {
  'DD/MM/YYYY': 'dd/MM/yyyy',
  'MM/DD/YYYY': 'MM/dd/yyyy',
  'YYYY-MM-DD': 'yyyy-MM-dd',
};

export function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return isValid(value) ? value : null;
  const parsed = parseISO(String(value));
  return isValid(parsed) ? parsed : null;
}

export function formatDate(value, dateFormat = 'DD/MM/YYYY') {
  const date = toDate(value);
  if (!date) return '—';
  const pattern = FORMAT_MAP[dateFormat] ?? FORMAT_MAP['DD/MM/YYYY'];
  return format(date, pattern);
}

export function formatDateTime(value, dateFormat = 'DD/MM/YYYY') {
  const date = toDate(value);
  if (!date) return '—';
  const pattern = FORMAT_MAP[dateFormat] ?? FORMAT_MAP['DD/MM/YYYY'];
  return format(date, `${pattern} HH:mm`);
}

export function formatMonthYear(month, year) {
  const date = new Date(year, month - 1, 1);
  return format(date, 'MMMM yyyy');
}

export function toISODateString(value) {
  const date = toDate(value);
  return date ? format(date, 'yyyy-MM-dd') : '';
}
