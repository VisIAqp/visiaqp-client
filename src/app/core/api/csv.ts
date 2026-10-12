export function csvCell(value: string | number): string {
  let text = String(value);
  if (typeof value === 'string' && /^\s*[=+@-]/.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
}
export function createCsv(rows: (string | number)[][]): string {
  return (
    String.fromCharCode(0xfeff) +
    rows.map((row) => row.map(csvCell).join(';')).join(String.fromCharCode(13, 10))
  );
}
