'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import BackButton from '@/components/BackButton/BackButton';
import GrowthChart from '@/components/finance/GrowthChart';
import { formatValue } from '@/lib/finance';
import { INVESTMENT_DEFAULTS, investmentValues, inputsFromValues, projectInvestment, requiredMonthly, requiredInitial, investmentCsv, type InvestmentInputs, type InvestmentResult } from '@/lib/investment';
import styles from './sip.module.css';

const money = (v: number) => formatValue(v);
const percent = (v: number) => `${v.toFixed(2)}%`;
type NumericKey = { [K in keyof InvestmentInputs]: InvestmentInputs[K] extends number ? K : never }[keyof InvestmentInputs];
export default function SipClient() {
  const [mode, setMode] = useState<'one-time' | 'recurring' | 'combined'>('combined');
  const [values, setValues] = useState(() => investmentValues(INVESTMENT_DEFAULTS));
  const [notice, setNotice] = useState('');
  const [tab, setTab] = useState<'overview' | 'stress' | 'schedule' | 'method'>('overview');
  const [realChart, setRealChart] = useState(false);
  const [monthlyTable, setMonthlyTable] = useState(false);
  const [page, setPage] = useState(0);
  const [baseline, setBaseline] = useState<{ name: string; inputs: InvestmentInputs; result: InvestmentResult } | null>(null);
  const analysis = useMemo(() => {
    try {
      const inputs = inputsFromValues(values);
      const result = projectInvestment(inputs);
      return { inputs, result, required: mode === 'one-time' ? requiredInitial(inputs) : requiredMonthly(inputs) };
    } catch (error) { return { error: error instanceof Error ? error.message : 'Check your inputs.' }; }
  }, [values, mode]);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (new URLSearchParams(window.location.search).get('mode') === 'one-time') {
        setMode('one-time');
        setValues(investmentValues({ ...INVESTMENT_DEFAULTS, initial: 500000, monthly: 0, step: 0, pauseMonths: 0 }));
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);
  function chooseMode(next: 'one-time' | 'recurring' | 'combined') {
    setMode(next);
    setValues(old => ({ ...old, monthly: next === 'one-time' ? '0' : Number(old.monthly) > 0 ? old.monthly : '10000',
      initial: next === 'recurring' ? '0' : Number(old.initial) > 0 ? old.initial : '500000',
      ...(next === 'one-time' ? { step: '0', stepValue: '0', pauseMonths: '0' } : {}) }));
    setPage(0); setNotice('');
  }
  const p = analysis.inputs, r = analysis.result;
  const stresses = useMemo(() => {
    if (!p) return [];
    const cases: { label: string; help: string; inputs: InvestmentInputs; sequence?: 'early' | 'late' }[] = [
      { label: 'Lower return', help: 'Annual return assumption −2 percentage points.', inputs: { ...p, annualReturn: Math.max(-50, p.annualReturn - 2) } },
      { label: 'Higher return', help: 'Annual return assumption +2 percentage points.', inputs: { ...p, annualReturn: Math.min(50, p.annualReturn + 2) } },
      { label: 'No annual step-up', help: 'Keep contributions flat; all other conventions unchanged.', inputs: { ...p, step: 0 } },
      { label: 'First year without contributions', help: 'Replace the pause with months 1–12. Initial capital still grows.', inputs: { ...p, pauseStart: 1, pauseMonths: 12 } },
    ];
    if (mode === 'one-time') cases.splice(2, 2);
    if (p.returnBasis === 'gross') cases.push({ label: 'Higher expenses', help: 'Annual expense drag +0.5 percentage points, capped at the model limit.', inputs: { ...p, fee: Math.min(10, p.fee + .5) } });
    cases.push({ label: 'Higher inflation', help: 'Inflation +2 percentage points, capped at the model limit. Compare purchasing power as well as nominal wealth.', inputs: { ...p, inflation: Math.min(30, p.inflation + 2) } });
    if (p.years >= 2 && mode !== 'one-time') cases.push(
      { label: 'Early drawdown', help: 'Multiply year 1’s gross growth factor by 0.75 and year 2’s by 1/0.75.', inputs: p, sequence: 'early' },
      { label: 'Late drawdown', help: 'Multiply the penultimate year’s gross growth factor by 1/0.75 and the final year’s by 0.75.', inputs: p, sequence: 'late' },
    );
    return cases.map(c => { try { return { ...c, result: projectInvestment(c.inputs, c.sequence ?? 'constant', false) }; } catch { return { ...c, result: null }; } });
  }, [p, mode]);
  function change(key: keyof InvestmentInputs, value: string) {
    setValues(old => ({ ...old, [key === 'step' ? 'stepValue' : key]: value,
      ...(key === 'annualReturn' ? { return: value } : {}),
      ...(key === 'step' ? { step: old.stepMode === 'percent' ? value : '0' } : {}),
      ...(key === 'stepMode' ? { step: value === 'percent' ? old.stepValue : '0' } : {}) }));
    setPage(0); setNotice('');
  }
  function field(key: NumericKey, label: string, help: string, min: number, max: number, unit: string, integer = false) {
    return <label className={styles.field} key={key} htmlFor={`investment-${key}`}><span>{label}</span><div className={styles.inputWrap}><input aria-label={label} id={`investment-${key}`} type="number" inputMode={integer ? 'numeric' : 'decimal'} value={values[key === 'step' ? 'stepValue' : key]} min={min} max={max} step={integer ? 1 : 'any'} aria-describedby={`help-${key}`} onChange={e => change(key, e.target.value)} /><span>{unit}</span></div><small id={`help-${key}`}>{help}</small></label>;
  }
  function select(key: keyof InvestmentInputs, label: string, options: [string, string][]) {
    return <label className={styles.field}><span>{label}</span><select aria-label={label} value={values[key]} onChange={e => change(key, e.target.value)}>{options.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label>;
  }
  function download() {
    if (!p || !r) return;
    const url = URL.createObjectURL(new Blob([investmentCsv(p, r, 'Current plan', new Date().toISOString())], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'investment-plan.csv'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice('Downloaded the complete monthly schedule, inputs, results, and model conventions.');
  }
  const schedule = r ? monthlyTable ? r.rows : r.annual : [];
  return <main className={styles.page}><BackButton /><div className={styles.shell}>
    <header className={styles.header}><div><p className={styles.eyebrow}>INVEST WITH A CLEARER PICTURE</p><h1>Investment Lab<span>.</span></h1><p>One-time capital, recurring investments, and the decisions behind your future wealth.</p></div></header>
    <div className={styles.mobileOutcome}>{r ? <><span>Net projected value</span><strong>{money(r.net)}</strong><a href="#investment-results">View your analysis ↓</a></> : <span>Complete your inputs to view the analysis.</span>}</div><nav className={styles.modeBar} aria-label="Investment starting mode">{([['one-time','One-time investment'],['recurring','Recurring investment'],['combined','Initial + recurring']] as const).map(([value,label]) => <button key={value} aria-pressed={mode===value} onClick={()=>chooseMode(value)}>{label}</button>)}</nav><div className={styles.layout}><aside data-analytics-section="investment/assumptions" className={styles.inputs} aria-label="Investment assumptions"><div className={styles.sectionHeading}><h2>Build your plan</h2><button onClick={() => { setValues(investmentValues(INVESTMENT_DEFAULTS)); setMode('combined'); setBaseline(null); setPage(0); setNotice('Example assumptions restored.'); }}>Reset</button></div><p className={styles.help}>Example inputs to explore. Start simple; open the details when you need them.</p>
      {mode !== 'one-time' && field('monthly', 'Monthly investment', 'Your starting recurring contribution, before annual increases.', 0, 1e8, '₹')}
      {mode !== 'recurring' && field('initial', mode === 'one-time' ? 'Initial investment' : 'Already invested', mode === 'one-time' ? 'Capital placed at the beginning, without recurring contributions.' : 'Capital invested at the start, in addition to the monthly plan.', 0, 1e10, '₹')}
      {field('years', 'Investment horizon', 'Whole years. All modeled investments are liquidated at the end.', 1, 50, 'years', true)}
      {field('annualReturn', 'Annual return assumption', 'A scenario you choose, not a forecast or guaranteed return.', -50, 50, '%')}
      <details hidden={mode === 'one-time'} className={styles.details} open><summary>Contribution strategy</summary>
        {select('stepMode', 'Annual step-up type', [['percent', 'Percentage increase'], ['fixed', 'Fixed rupee increase']])}
        {field('step', 'Annual step-up', values.stepMode === 'percent' ? 'Increase from month 13, then every 12 months.' : 'Add this amount to the monthly contribution every year, starting month 13.', 0, values.stepMode === 'percent' ? 30 : 1e7, values.stepMode === 'percent' ? '%' : '₹')}
        {field('cap', 'Monthly contribution ceiling', 'Use 0 for no ceiling. This limits affordability as contributions grow.', 0, 1e8, '₹')}
        {select('timing', 'Contribution timing', [['end', 'End of each month'], ['beginning', 'Beginning of each month']])}
      </details>
      <details className={styles.details}><summary>Return, fees & inflation</summary>
        {select('rateBasis', 'Annual rate convention', [['effective', 'Effective annual return'], ['nominal', 'Nominal annual, monthly compounding']])}
        <p className={styles.help}>Effective: monthly factor = (1 + annual return)^(1/12). Nominal: monthly rate = annual rate / 12.</p>
        {select('returnBasis', 'Is your return before or after fund fees?', [['gross', 'Before fees — apply expense drag'], ['net', 'After fees — do not deduct again']])}
        {values.returnBasis === 'gross' && field('fee', 'Annual expense drag', 'Annual fee factor spread geometrically across months. Approximation of expenses, not daily NAV accounting.', 0, 10, '%')}
        {field('inflation', 'Annual inflation', 'Used for purchasing power and a goal entered in today’s money.', 0, 30, '%')}
      </details>
      <details hidden={mode === 'one-time'} className={styles.details}><summary>Contribution pause</summary>{field('pauseStart', 'Pause starts in month', 'Months count from 1. Investments continue to grow during a pause.', 1, 600, 'month', true)}{field('pauseMonths', 'Number of skipped months', 'Use 0 for no pause. The annual step-up calendar keeps moving.', 0, 600, 'months', true)}</details>
      <details className={styles.details}><summary>Illustrative exit deductions</summary><p className={styles.help}>Optional assumptions, not a tax-rule calculator. Default deductions are zero. Actual treatment depends on product, purchase dates, and applicable rules.</p>{field('exitCharge', 'Exit charge on final value', 'A one-time percentage of the full final portfolio value.', 0, 20, '%')}{field('tax', 'Tax rate on positive gain', 'Applied once at liquidation, after exit charge and the exemption below.', 0, 50, '%')}{field('exemption', 'Gain excluded from illustrative tax', 'A user-entered exemption. No automatic holding-period or legal rules.', 0, 1e10, '₹')}</details>
      <details className={styles.details} open><summary>Fund a future goal</summary>{field('goal', 'Target amount', 'Use 0 to turn off goal planning.', 0, 1e12, '₹')}{select('goalBasis', 'Goal amount is expressed in', [['today', 'Today’s purchasing power'], ['future', 'Money at the goal date']])}</details>
    </aside><div className={styles.results} data-analytics-section={'investment/'+tab} id="investment-results"><div className={styles.toolbar}><span>YOUR ASSUMPTIONS, MADE VISIBLE</span><button disabled={!r} className={styles.secondary} onClick={download}>↓ Export analysis</button></div><p role="status" className={styles.notice}>{notice}</p>
      {analysis.error && <div role="alert" className={styles.error}><h2>Check your assumptions</h2><p>{analysis.error}</p></div>}
      {r && p && <>
        <section className={styles.metrics} aria-label="Investment results"><article className={styles.mainMetric}><p>Net projected value</p><strong>{money(r.net)}</strong><small>After your illustrative exit deductions</small></article><article><p>Contributed capital</p><strong>{money(r.invested)}</strong><small>Initial capital + recurring contributions</small></article><article><p>Net investment gain</p><strong>{money(r.gain)}</strong><small>Net value less contributed capital</small></article><article><p>In today’s purchasing power</p><strong>{money(r.real)}</strong><small>Discounted by {p.inflation}% inflation</small></article></section>
        <nav className={styles.tabs} aria-label="Analysis views">{(['overview','stress','schedule','method'] as const).map(t => <button key={t} aria-pressed={tab === t} onClick={() => setTab(t)}>{({ overview:'Overview',stress:'What if?',schedule:'Cash flows',method:'How it works' })[t]}</button>)}</nav>
        {tab === 'overview' && <>
          <section className={styles.card}><div className={styles.sectionHeading}><h2>Your wealth over time</h2><button aria-pressed={realChart} onClick={() => setRealChart(!realChart)}>{realChart ? 'Show nominal value' : 'Show purchasing power'}</button></div><GrowthChart data={[{ label:'Start',value:p.initial,base:p.initial }, ...r.annual.map(row => ({ label:`Year ${row.month/12}`,value:realChart ? row.real : row.closing,base:realChart ? row.invested / (1+p.inflation/100)**(row.month/12) : row.invested }))]} primary={realChart ? 'Portfolio in today’s money' : 'Portfolio before exit deductions'} secondary={realChart ? 'Cumulative capital, discounted at each year-end' : 'Cumulative contributions'} /><p className={styles.help}>The curve shows a constant-return scenario before terminal exit deductions. It is not a forecast of market fluctuations.</p></section>
          {p.goal > 0 && <section className={`${styles.card} ${styles.goal}`}><p className={styles.eyebrow}>TURN A TARGET INTO A PLAN</p><h2>{r.shortfall > 0 ? 'Your goal needs more funding' : 'Your plan meets the modeled goal'}</h2><div className={styles.goalGrid}><div><span>Target at goal date</span><strong>{money(r.futureGoal)}</strong></div><div><span>Projected funding gap</span><strong>{money(r.shortfall)}</strong></div><div><span>{mode === 'one-time' ? 'Required initial capital' : 'Required starting monthly amount'}</span><strong>{analysis.required === null ? 'No solution within the model limits' : money(analysis.required!)}</strong></div></div><p className={styles.help}>{mode === 'one-time' ? 'Solved for initial capital using your return, expenses, inflation, and exit deductions.' : 'Solved using the same step-up, cap, pause, timing, fees, and exit assumptions.'} {mode === 'one-time' ? 'The goal is funded by initial capital alone.' : 'This starting amount may increase each year.'}</p>{analysis.required !== null && analysis.required !== undefined && <button className={styles.primary} onClick={() => change(mode === 'one-time' ? 'initial' : 'monthly', String(Math.ceil(analysis.required!)))}>Use required {mode === 'one-time' ? 'capital' : 'starting amount'}</button>}</section>}
          <section className={styles.card}><h2>What the headline leaves out</h2><div className={styles.detailGrid}><div><span>Money-weighted annual return</span><strong>{r.irr === null ? 'Not defined' : percent(r.irr * 100)}</strong><p>Accounts for when each contribution enters and all terminal deductions. Equal-month IRR; use actual-date XIRR for realized cash flows.</p></div><div><span>Annual net growth assumption</span><strong>{percent(r.netAnnual)}</strong><p>Equivalent annual growth before additional fees: {percent(r.grossAnnual)}. Net of recurring fees, before exit deductions. Real annual growth: {percent(r.realAnnual)}.</p></div><div><span>Wealth lost to recurring fees</span><strong>{money(r.feeDrag)}</strong><p>Includes {money(r.feesPaid)} of modeled fees plus their lost compounding. {p.returnBasis === 'net' ? 'Zero additional fees because return is entered after fees.' : 'Compared with the same plan without recurring fees.'}</p></div><div><span>{mode === 'one-time' ? 'Initial capital placed' : 'Final monthly contribution'}</span><strong>{money(mode === 'one-time' ? p.initial : r.lastContribution)}</strong><p>{mode === 'one-time' ? 'Placed at the start, with no further payments. Growth estimates exclude changing market paths.' : 'Check whether the future step-up is affordable. A pause in the final month can make this zero.'}</p></div></div></section>
          <section className={styles.card}><h2>The time needed to double</h2><div className={styles.goalGrid}><div><span>After recurring fees, before exit deductions</span><strong>{r.netAnnual > 0 ? `${(Math.log(2) / Math.log1p(r.netAnnual / 100)).toFixed(1)} years` : 'No doubling under this assumption'}</strong></div><div><span>After expenses and inflation</span><strong>{r.realAnnual > 0 ? `${(Math.log(2) / Math.log1p(r.realAnnual / 100)).toFixed(1)} years` : 'Purchasing power does not double'}</strong></div></div><p className={styles.help}>Constant growth estimates for existing capital, without new contributions or terminal taxes and charges. These are not waiting-time forecasts. For competing deadlines, use <Link href="/projects/finance/goal-planner">Goal Planning ↗</Link>.</p></section><section className={styles.card}><div className={styles.sectionHeading}><h2>Compare your decisions</h2><button onClick={() => setBaseline({ name:'Pinned plan',inputs:{...p},result:r })}>Pin current plan</button></div><p className={styles.help}>Pin a baseline, then adjust assumptions. Comparisons persist while this page stays open.</p>{baseline && <div className={styles.tableWrap}><table><thead><tr><th>Measure</th><th>{baseline.name}</th><th>Current</th><th>Difference</th></tr></thead><tbody>{[['Net value',baseline.result.net,r.net],['Capital invested',baseline.result.invested,r.invested],['Purchasing power',baseline.result.real,r.real],['Fee drag',baseline.result.feeDrag,r.feeDrag]].map(([label,a,b]) => <tr key={String(label)}><th>{label}</th><td>{money(Number(a))}</td><td>{money(Number(b))}</td><td>{money(Number(b)-Number(a))}</td></tr>)}</tbody></table><p className={styles.help}>Baseline horizon {baseline.inputs.years} years; current {p.years} years. Purchasing power is discounted to each plan’s start date.</p></div>}</section>
        </>}
        {tab === 'stress' && <section className={styles.card}><p className={styles.eyebrow}>LOOK BEYOND ONE NUMBER</p><h2>Stress the assumptions</h2><p className={styles.help}>These are deliberately chosen scenarios, not probabilities, confidence intervals, or predictions. Each changes only the stated assumption.</p><div className={styles.stressGrid}>{stresses.map(s => <article key={s.label}><h3>{s.label}</h3><p>{s.help}</p><strong>{s.result ? money(s.result.net) : 'Outside supported range'}</strong>{s.result && <span>{money(s.result.net-r.net)} vs current plan</span>}{s.result && <p>Purchasing power: {money(s.result.real)}</p>}</article>)}</div><h3 className={styles.subheading}>Why the order of returns matters</h3><p className={styles.help}>The early and late examples retain the same cumulative gross growth factor for an initial lump sum. Contributions arrive at different points in the path, so the ending wealth can differ. The 0.75 multiplier is a relative stress to the base annual growth factor, not necessarily a −25% annual return. Recovery factors are illustrative. This is sequence risk, not a promise that regular investing prevents losses.</p></section>}
        {tab === 'schedule' && <section className={styles.card}><div className={styles.sectionHeading}><h2>Audit the cash flows</h2><button onClick={() => { setMonthlyTable(!monthlyTable);setPage(0); }}>{monthlyTable ? 'Show annual snapshots' : 'Show monthly ledger'}</button></div><p className={styles.help}>{monthlyTable ? 'Each row reconciles opening balance + contribution + gross growth − fees = closing balance.' : 'Annual totals for contributions, growth, and fees; closing values are year-end snapshots. Use the monthly ledger to audit every period.'} Exit deductions appear separately below.</p><div className={styles.tableWrap} tabIndex={0} role="region" aria-label="Investment cash-flow table"><table><thead><tr><th>{monthlyTable ? 'Month' : 'Year'}</th><th>Opening</th><th>Contribution</th><th>Growth</th><th>Fee</th><th>Invested to date</th><th>Closing value</th></tr></thead><tbody>{schedule.slice(page*12,page*12+12).map(row => <tr key={row.month}><td>{monthlyTable ? row.month : row.month/12}</td><td>{money(row.opening)}</td><td>{money(row.contribution)}</td><td>{money(row.growth)}</td><td>{money(row.fee)}</td><td>{money(row.invested)}</td><td>{money(row.closing)}</td></tr>)}</tbody></table></div><div className={styles.pagination}><button disabled={page===0} onClick={() => setPage(page-1)}>← Previous</button><span>{page+1} / {Math.ceil(schedule.length/12)}</span><button disabled={(page+1)*12>=schedule.length} onClick={() => setPage(page+1)}>Next →</button></div><div className={styles.waterfall}><p>Portfolio before exit <strong>{money(r.value)}</strong></p><p>Exit charge <strong>− {money(r.exitCharge)}</strong></p><p>Illustrative tax <strong>− {money(r.tax)}</strong></p><p>Net liquidation value <strong>{money(r.net)}</strong></p></div></section>}
        {tab === 'method' && <section className={styles.card}><p className={styles.eyebrow}>UNDERSTAND BEFORE YOU DECIDE</p><h2>Model conventions & practical use</h2><div className={styles.method}>
          <article><h3>1. Choose a realistic scenario</h3><p>Annual return is a user assumption. Effective annual return uses geometric conversion; nominal annual uses division by 12. At 12% nominal, the effective annual rate is about 12.68%, so these conventions are not interchangeable.</p><code>monthly factor = (1 + effective annual return)^(1/12)</code></article>
          <article><h3>2. Separate contributions from investment performance</h3><p>Step-ups start in month 13. Beginning-of-month contributions earn one extra month relative to month-end contributions. A pause stops new contributions but does not stop compounding or annual increases.</p><code>end-month balance = opening × growth factor × fee factor + contribution</code></article>
          <article><h3>3. Avoid double-counting expenses</h3><p>Use gross return when separately modeling expenses. If your return input is already after fund expenses, select after-fees mode. Monthly fee factor = (1 − annual fee)^(1/12); actual daily deductions can differ. Fee drag includes lost growth on deducted fees.</p></article>
          <article><h3>4. Read purchasing power alongside rupee value</h3><p>Future wealth divided by (1 + inflation)^years gives its purchasing power today. A goal stated in today’s money is inflated forward once. If you already entered the future cost, choose money at the goal date.</p><code>real annual growth = (1 + net annual growth) / (1 + inflation) − 1</code></article>
          <article><h3>5. Use the right return measure</h3><p>CAGR from total contributions to ending value treats every contribution as invested at the start and misstates a recurring investment’s performance. This tool solves a money-weighted monthly IRR and annualises it as (1 + monthly IRR)^12 − 1. Periods are equal months. Actual-date realised returns require a separate dated cash-flow calculation; this illustration uses equal monthly periods.</p></article>
          <article><h3>6. Treat tax as a separate assumption</h3><p>Illustrative tax = max(0, portfolio − exit charge − contributions − exemption) × user tax rate. It is applied once at the horizon. No interim distributions, loss relief, holding-period buckets, statutory rates, cess, or product-specific exit-load rules are modeled. Zero is the default, not a statement that tax is zero.</p></article>
          <article><h3>7. Test the plan, then check affordability</h3><p>Use lower returns and higher costs to challenge the goal, inspect later contributions, and compare a flat plan with a step-up. SIPs are a contribution method; rupee-cost averaging does not guarantee profit or prevent losses. The model reinvests all growth and excludes withdrawals.</p></article>
        </div><div className={styles.references}><a href="https://www.amfiindia.com/investor/become-mf-distributor?zoneName=sip" target="_blank" rel="noopener noreferrer">AMFI: SIP & rupee-cost averaging ↗</a><a href="https://www.investor.gov/introduction-investing/getting-started/understanding-fees" target="_blank" rel="noopener noreferrer">Investor.gov: the impact of fees ↗</a></div><p className={styles.help}>Model investment-v2 · Full precision internally; displays rounded · No live market data or recommendations · Calculated on this device</p></section>}
      </>}
    </div></div>
  </div></main>;
}











