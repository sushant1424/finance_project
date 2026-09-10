/** Trigger a browser download for CSV text. */
export function downloadCsv(filename, csvText) {
  const url = URL.createObjectURL(new Blob([csvText], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Build CSV from a header row and data rows (values are stringified, commas escaped). */
export function rowsToCsv(headers, rows) {
  const escape = (v) => {
    const s = String(v ?? '');
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  return [headers, ...rows].map((r) => r.map(escape).join(',')).join('\n');
}

export default downloadCsv;
