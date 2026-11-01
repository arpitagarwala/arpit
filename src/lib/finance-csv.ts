import type { Tool, Values, Result } from './finance';
export function csvCell(value: string | number): string {
  const text = typeof value === 'number' ? value.toFixed(6) : /^[=+@\-\t\r]/.test(value) ? `'${value}` : value;
  return `"${text.replaceAll('"', '""')}"`;
}
export function financeCsv(tool: Tool, values: Values, result: Result, exportedAt = new Date().toISOString()): string {
  const lines: (string | number)[][] = [['Arpit Finance', tool.title], ['Exported at', exportedAt], ['Model version', '1.0'], ['Currency', 'INR'], [], ['INPUT', 'VALUE'], ...tool.fields.map(f => [f.label, values[f.key]]), [], ['RESULT', 'VALUE', 'UNIT'], ...result.metrics.map(m => [m.label, m.value, m.kind === 'percent' ? '%' : m.kind === 'number' ? 'number' : 'INR']), [], result.columns, ...result.rows, [], ['Formula', tool.formula], ['Assumptions', tool.assumptions]];
  return '\uFEFF' + lines.map(row => row.map(csvCell).join(',')).join('\r\n');
}
