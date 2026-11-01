'use client';
import type { ReactNode } from 'react';
import Link from 'next/link';
import BackButton from '@/components/BackButton/BackButton';
import styles from './planning.module.css';
export const money = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
export const percent = (value: number | null) => value === null ? 'Not defined' : `${(Math.abs(value) < .005 ? 0 : value).toFixed(2)}%`;
export function PlanningFrame({ tone, label, title, intro, children, footer }: { tone: 'goals' | 'loans' | 'deposits' | 'risk' | 'journal'; label: string; title: string; intro: string; children: ReactNode; footer?: string }) {
  return <main className={`${styles.page} ${styles[tone]}`}><BackButton /><div className={styles.shell}>
    <header className={styles.header}><div><Link className={styles.back} href="/projects">Projects / Finance</Link><p className={styles.eyebrow}>{label}</p><h1>{title}<span>.</span></h1><p className={styles.intro}>{intro}</p></div><div className={styles.seal} aria-hidden="true">{{goals:'◎',loans:'↘',deposits:'▥',risk:'⊞',journal:'✎'}[tone]}</div></header>
    {children}<footer className={styles.footer}>{footer??'Calculated on this device · Inputs last for this page visit · Export the analysis to keep a copy'}</footer>
  </div></main>;
}
export function NumberField({ label, help, value, onChange, min = 0, max = 1e12, unit = '₹', integer = false }: { label: string; help: string; value: number; onChange: (v: number) => void; min?: number; max?: number; unit?: string; integer?: boolean }) {
  return <label className={styles.field}><span>{label}</span><div className={styles.number}><input type="number" data-stepper={integer && max - min <= 20 ? 'true' : undefined} aria-label={label} value={Number.isFinite(value) ? value : ''} min={min} max={max} step={integer ? 1 : 'any'} inputMode={integer ? 'numeric' : 'decimal'} onChange={e => onChange(e.target.value.trim() === '' ? NaN : Number(e.target.value))} /><span>{unit}</span></div><small>{help}</small></label>;
}
export function SelectField({ label, value, options, onChange }: { label: string; value: string; options: [string, string][]; onChange: (v: string) => void }) {
  return <label className={styles.field}><span>{label}</span><select aria-label={label} value={value} onChange={e => onChange(e.target.value)}>{options.map(([v, text]) => <option key={v} value={v}>{text}</option>)}</select></label>;
}
export function Metric({ label, value, help, main = false }: { label: string; value: string; help: string; main?: boolean }) {
  return <article className={`${styles.metric} ${main ? styles.mainMetric : ''}`}><span>{label}</span><strong>{value}</strong><p>{help}</p></article>;
}
export function ErrorNotice({ error }: { error?: string }) { return error ? <div role="alert" className={styles.error}><strong>Check your inputs</strong><p>{error}</p></div> : null; }
export function DataTable({ label, columns, rows }: { label: string; columns: string[]; rows: (string | number)[][] }) {
  return <div data-analytics-section="analysis/table" className={styles.tableWrap} tabIndex={0} role="region" aria-label={label}><table><thead><tr>{columns.map(c => <th key={c}>{c}</th>)}</tr></thead><tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody></table></div>;
}
export function downloadReport(content: string, name: string) { window.dispatchEvent(new CustomEvent('website-action',{detail:'export'})); const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' })); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
export function browserDate() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
