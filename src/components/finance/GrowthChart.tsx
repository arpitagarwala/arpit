import styles from './finance.module.css';
export default function GrowthChart({ data, primary = 'Projected value', secondary = 'Contributed capital' }: { data: { label: string; value: number; base?: number }[]; primary?: string; secondary?: string }) {
  if (!data.length) return null;
  const values = data.flatMap(p => [p.value, p.base ?? 0]), min = Math.min(0, ...values), max = Math.max(1, ...values), range = max - min;
  const x = (i: number) => 34 + i / Math.max(1, data.length - 1) * 526, y = (v: number) => 190 - (v - min) / range * 164;
  const line = (base = false) => data.map((p, i) => `${i ? 'L' : 'M'}${x(i)},${y(base ? p.base ?? 0 : p.value)}`).join(' ');
  const tick = (value: number) => new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
  return <div className={styles.chart}><div className={styles.legend}><span><i />{primary}</span>{data.some(p => p.base !== undefined) && <span><i className={styles.legendSecondary} />{secondary}</span>}</div><svg viewBox="0 0 590 226" role="img" aria-label={`${primary}: ${data[0].label} ${tick(data[0].value)} rupees to ${data.at(-1)!.label} ${tick(data.at(-1)!.value)} rupees. Full values in the table below.`}>
    {[0, 0.5, 1].map(t => <g key={t}><line x1="34" x2="560" y1={y(min + range * t)} y2={y(min + range * t)} stroke="currentColor" opacity=".1" /><text x="34" y={y(min + range * t) - 7} fill="currentColor" opacity=".6" fontSize="10">₹{tick(min + range * t)}</text></g>)}
    <path d={`${line()} L${x(data.length - 1)},${y(0)} L34,${y(0)} Z`} fill="#dbbc94" opacity=".08" />{data.some(p => p.base !== undefined) && <path d={line(true)} fill="none" stroke="#c08b47" strokeWidth="2" strokeDasharray="5 4" />}<path d={line()} fill="none" stroke="#dbbc94" strokeWidth="3" strokeLinecap="round" /><circle cx={x(data.length - 1)} cy={y(data.at(-1)!.value)} r="4" fill="#dbbc94" />
    <text x="34" y="218" fill="currentColor" opacity=".6" fontSize="10">{data[0].label}</text><text x="560" y="218" textAnchor="end" fill="currentColor" opacity=".6" fontSize="10">{data.at(-1)!.label}</text>
  </svg></div>;
}

