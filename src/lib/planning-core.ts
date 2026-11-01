export function numberIn(value: number, label: string, min = 0, max = 1e12, integer = false): void {
  if (!Number.isFinite(value) || value < min || value > max || (integer && !Number.isInteger(value))) throw new Error(`${label}: enter ${integer ? 'a whole number' : 'a number'} between ${min} and ${max}.`);
}
export function dateValue(value: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Enter a valid calendar date.');
  const n = Date.parse(`${value}T00:00:00Z`);
  if (!Number.isFinite(n) || new Date(n).toISOString().slice(0, 10) !== value) throw new Error('Enter a valid calendar date.');
  return n;
}
export function addMonths(date: string, months: number): string {
  const d = new Date(dateValue(date));
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + months, 1));
  const end = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(d.getUTCDate(), end));
  return target.toISOString().slice(0, 10);
}
export function yearFraction(start: string, end: string, basis: 'actual365' | 'actualActual' = 'actual365'): number {
  let a = dateValue(start); const b = dateValue(end);
  if (b < a) throw new Error('End date must be on or after the start date.');
  if (basis === 'actual365') return (b - a) / 86400000 / 365;
  let result = 0;
  while (a < b) {
    const year = new Date(a).getUTCFullYear(); const next = Date.UTC(year + 1, 0, 1);
    const stop = Math.min(next, b); const days = (next - Date.UTC(year, 0, 1)) / 86400000;
    result += (stop - a) / 86400000 / days; a = stop;
  }
  return result;
}
export function fullMonths(start: string, end: string): number {
  const a = new Date(dateValue(start)), b = new Date(dateValue(end));
  if (b <= a) throw new Error('Deadline must be after the planning date.');
  let months = (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + b.getUTCMonth() - a.getUTCMonth();
  if (dateValue(addMonths(start, months)) > b.getTime()) months--;
  return months;
}
export function annuityFactor(rate: number, months: number): number {
  return Math.abs(rate) < 1e-12 ? months : Math.expm1(months * Math.log1p(rate)) / rate;
}
export function presentValueFactor(rate: number, months: number): number {
  return Math.abs(rate) < 1e-12 ? months : -Math.expm1(-months * Math.log1p(rate)) / rate;
}
export function datedYield(start: string, invested: number, cash: { date: string; amount: number }[]): number | null {
  const origin = dateValue(start);
  const timed = cash.map(c => ({ time: (dateValue(c.date) - origin) / 86400000 / 365, amount: c.amount }));
  if (invested <= 0 || !timed.some(c => c.time > 0 && c.amount > 0) || timed.some(c => c.amount < 0 || c.time < 0 || !Number.isFinite(c.amount))) return null;
  const pv = (logGrowth: number) => timed.reduce((n, c) => n + c.amount * Math.exp(-logGrowth * c.time), 0) - invested;
  let lo = -20, hi = 20;
  if (pv(lo) < 0 || pv(hi) > 0) return null;
  for (let i = 0; i < 120; i++) { const mid = (lo + hi) / 2; if (pv(mid) > 0) lo = mid; else hi = mid; }
  const value = Math.expm1((lo + hi) / 2);
  return Number.isFinite(value) ? value * 100 : null;
}
export function reportCsv(title: string, inputs: unknown, measures: Record<string, string | number>, columns: string[], rows: (string | number)[][], conventions: string[]): string {
  const cell = (v: string | number) => '"' + (typeof v === 'number' ? String(v) : /^[=+@\-\t\r]/.test(v) ? `'${v}` : v).replaceAll('"', '""') + '"';
  const content: (string | number)[][] = [[title, 'planning-v2'], ['Currency', 'INR'], ['Inputs JSON', JSON.stringify(inputs)], [], ['Measure', 'Value'], ...Object.entries(measures), [], columns, ...rows, [], ...conventions.map(s => ['Convention', s])];
  return '\uFEFF' + content.map(row => row.map(cell).join(',')).join('\r\n');
}
