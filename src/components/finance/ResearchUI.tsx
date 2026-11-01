'use client';
import styles from './planning.module.css';
export function analyzeInputs<T>(compute: () => T): { result?: T; error?: string } {
  try { return { result: compute() }; } catch (e) { return { error: e instanceof Error ? e.message : 'Check the model inputs.' }; }
}
export function DateField({ label, value, onChange, help }: { label: string; value: string; onChange: (v: string) => void; help: string }) {
  return <label className={styles.field}><span>{label}</span><input type="date" aria-label={label} value={value} onChange={e => onChange(e.target.value)} /><small>{help}</small></label>;
}
export function AnalysisTabs({ label, tabs, value, onChange }: { label: string; tabs: [string, string][]; value: string; onChange: (v: string) => void }) {
  return <nav className={styles.tabs} aria-label={label}>{tabs.map(([key, text]) => <button key={key} aria-pressed={value === key} onClick={() => onChange(key)}>{text}</button>)}</nav>;
}
export function AnalysisChart({ label, rows, series, index = false }: { label: string; rows: { label: string; values: number[] }[]; series: string[]; index?: boolean }) {
  if (!rows.length) return null;
  const colors = ['#e5c293', '#c17f59', '#bcc4c9'];
  const min = Math.min(0, ...rows.flatMap(r => r.values)), max = Math.max(1, ...rows.flatMap(r => r.values)), span = max - min;
  const x = (i: number) => 75 + i / Math.max(1, rows.length - 1) * 530, y = (v: number) => 208 - (v - min) / span * 175;
  const format = (v: number) => new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(v);
  return <><div className={styles.plotLegend}>{series.map((s, i) => <span key={s}><i style={{ background: colors[i % 3] }} />{s}</span>)}</div><div className={styles.tableWrap} tabIndex={0} role="region" aria-label={`${label} chart; scroll horizontally on narrow screens`}><svg className={styles.plot} viewBox="0 0 660 260" role="img" aria-label={`${label}. ${index ? 'Indexed values' : 'Rupee values'}; full numerical data in the report and tables.`}>
    {[0, .5, 1].map(t => <g key={t}><line x1="75" x2="605" y1={y(min + t * span)} y2={y(min + t * span)} stroke="#63584b" /><text x="65" y={y(min + t * span) + 5} textAnchor="end" fill="currentColor" fontSize="15">{index ? '' : '₹'}{format(min + t * span)}</text></g>)}
    {series.map((s, j) => <path key={s} d={rows.map((r, i) => `${i ? 'L' : 'M'} ${x(i)} ${y(r.values[j])}`).join(' ')} fill="none" stroke={colors[j % 3]} strokeWidth="3" />)}
    <text x="75" y="245" fill="currentColor" fontSize="15">{rows[0].label}</text><text x="605" y="245" textAnchor="end" fill="currentColor" fontSize="15">{rows.at(-1)!.label}</text>
  </svg></div><p className={styles.help}>On a small screen, scroll the chart or use the numerical table and CSV report.</p></>;
}
