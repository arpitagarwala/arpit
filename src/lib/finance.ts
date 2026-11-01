import { planPosition, POSITION_DEFAULTS } from './position-risk.ts';
import { inputsFromValues, projectInvestment } from './investment.ts';
export type Category = 'Investing' | 'Capital markets' | 'Banking';
export type Values = Record<string, string>;
export type Field = { key: string; label: string; value: string; unit?: string; min?: number; max?: number; step?: number; help?: string; multiline?: boolean; options?: string[] };
export type Tool = { slug: string; title: string; description: string; category: Category; icon: string; fields: Field[]; formula: string; assumptions: string; source?: { label: string; url: string } };
export type Metric = { label: string; value: number; kind?: 'money' | 'percent' | 'number'; };
export type Result = { metrics: Metric[]; columns: string[]; rows: (string | number)[][]; chart?: { label: string; value: number; base?: number }[]; note?: string };
const money = (key: string, label: string, value: number, min = 0): Field => ({ key, label, value: String(value), unit: '₹', min, max: 1e12, step: 0.01 });
const rate = (key: string, label: string, value: number, min = 0, max = 100): Field => ({ key, label, value: String(value), unit: '%', min, max, step: 0.01 });
const years: Field = { key: 'years', label: 'Time horizon', value: '10', unit: 'years', min: 1, max: 50, step: 1 };
const sebi = { label: 'SEBI investor calculators', url: 'https://investor.sebi.gov.in/calculators/index.html' };
export const TOOLS: Tool[] = [
  {slug:'trade-journal',title:'Trade Journal',description:'Build your trading habit: record fills, preserve screenshots, learn from mistakes and review progress in a clear P&L calendar.',category:'Capital markets',icon:'✎',fields:[],formula:'Net P&L = direction-adjusted fill difference × lots × lot size × value multiplier − entered charges.',assumptions:'Device-local trade records and JSON backups. Performance includes fully closed trades only; no broker connection or market feed.'},
  { slug: 'sip', title: 'Investment Lab', description: 'Model one-time and recurring investments, costs, purchasing power, and growth trade-offs.', category: 'Investing', icon: '↗', fields: [money('monthly', 'Monthly investment', 10000), rate('return', 'Expected annual return', 12, -50), years, rate('step', 'Annual contribution increase', 5, 0, 30), rate('inflation', 'Annual inflation', 6)], formula: 'Monthly rate = annual rate / 12. Each month: balance = prior balance × (1 + monthly rate) + contribution. Contributions increase every 12 months.', assumptions: 'End-of-month contributions; nominal annual return compounded monthly. Returns are constant scenarios, not forecasts. Tax and fund expenses excluded. Real value discounts the final balance by annual inflation.', source: sebi },
  { slug: 'compound-growth', title: 'Lumpsum growth', description: 'Project a one-time investment and see the effect of compounding.', category: 'Investing', icon: '◈', fields: [money('principal', 'Initial investment', 500000), rate('return', 'Effective annual return', 10, -50), years], formula: 'Future value = principal × (1 + annual return)^years.', assumptions: 'Annual compounding with no additional cash flows. Excludes tax, fees and inflation.', source: sebi },
  { slug: 'goal-planner', title: 'Goal Planning', description: 'Fund competing goals with dated targets, ring-fenced savings, and a realistic monthly budget.', category: 'Investing', icon: '◎', fields: [money('goal', 'Goal cost today', 2500000, 1), money('principal', 'Already invested', 200000), years, rate('return', 'Expected annual return', 10, -50), rate('inflation', 'Annual goal inflation', 6)], formula: 'Inflated goal = today’s cost × (1 + inflation)^years. Monthly contribution = remaining future shortfall / [((1 + r)^n − 1) / r].', assumptions: 'Existing savings compound monthly; new contributions arrive at month-end. A zero shortfall requires no additional investment. No tax or fees.', source: sebi },
  { slug: 'emi', title: 'Loan Planning', description: 'Compare fee-inclusive costs, rate resets, prepayments, affordability, and refinancing.', category: 'Banking', icon: '⌂', fields: [money('principal', 'Loan principal', 3000000, 1), rate('return', 'Annual interest rate', 8.5), { ...years, value: '20', max: 40 }], formula: 'EMI = P × r × (1 + r)^n / ((1 + r)^n − 1). At zero interest, EMI = P / n.', assumptions: 'Fixed rate, monthly reducing balance and payments at month-end. No prepayments, processing charges, insurance or lender-specific rounding.', source: { label: 'SEBI EMI calculator', url: 'https://investor.sebi.gov.in/calc/emi.html' } },
  { slug: 'fixed-deposit', title: 'Deposit Planning', description: 'Plan deposit income, maturity ladders, tax timing, concentration, and early access.', category: 'Banking', icon: '▤', fields: [money('principal', 'Deposit amount', 100000, 1), rate('return', 'Nominal annual interest', 7), { ...years, value: '5' }, { key: 'frequency', label: 'Compounds per year', value: '4', options: ['1', '2', '4', '12'], help: '1 annual · 2 half-yearly · 4 quarterly · 12 monthly' }], formula: 'Maturity = principal × (1 + annual rate / frequency)^(frequency × years).', assumptions: 'Cumulative deposit for whole years at a fixed rate. Bank day-count rules, TDS, tax and premature withdrawal penalties are excluded.', source: sebi },
  { slug: 'position-size', title: 'Position Size & Risk', description: 'Size whole exchange lots against risk and funding limits, with costs and gap scenarios.', category: 'Capital markets', icon: '⊞', fields: [money('capital', 'Available capital', 200000, 1), rate('risk', 'Capital at risk', 1, 0.01, 100), money('entry', 'Entry price', 1000, 0.01), money('stop', 'Stop-loss price', 970, 0.01), money('target', 'Target price', 1090, 0.01), {key:'lotSize',label:'Units per lot',value:'1',min:1,max:1000000,step:1}], formula: 'Shares = floor(min(capital × risk% / (entry − stop), capital / entry)). Round quantity down to a whole permitted lot. Reward/risk = (target − entry) / (entry − stop).', assumptions: 'Legacy default calculation: long cash equities in whole entered lots. The dedicated planner also supports entered futures margin and bought-option premiums. Stop must be below entry and target above entry. Excludes fees and slippage; gaps can cause losses beyond the modelled risk.' },
];
export const defaults = (tool: Tool): Values => Object.fromEntries(tool.fields.map(f => [f.key, f.value]));
export function validate(tool: Tool, values: Values): string | null {
  if (tool.slug === 'sip' && values.model === 'investment-v2') {
    try { inputsFromValues(values); return null; }
    catch (error) { return error instanceof Error ? error.message : 'Check the investment inputs.'; }
  }
  for (const field of tool.fields) {
    const raw = values[field.key];
    if (!raw?.trim()) return `Enter ${field.label.toLowerCase()}.`;
    if (field.options && !field.options.includes(raw)) return `Choose a valid ${field.label.toLowerCase()}.`;
    if (field.multiline || field.options) continue;
    const n = Number(raw);
    if (!Number.isFinite(n) || (field.min !== undefined && n < field.min) || (field.max !== undefined && n > field.max)) return `${field.label} must be between ${field.min ?? 0} and ${field.max ?? 'the supported limit'}.`;
    if (field.step === 1 && !Number.isInteger(n)) return `${field.label} must be a whole number.`;
  }
  return null;
}
const m = (label: string, value: number, kind: Metric['kind'] = 'money'): Metric => ({ label, value, kind });
export function calculate(slug: string, values: Values): Result {
  const tool = TOOLS.find(t => t.slug === slug);
  if (!tool) throw new Error('Tool not found.');
  const error = validate(tool, values); if (error) throw new Error(error);
  const v = (key: string) => Number(values[key]);
  const P = v('principal'), y = v('years'), r = v('return') / 100;
  const rows: Result['rows'] = [], chart: NonNullable<Result['chart']> = [];
  if (slug === 'sip') {
    if (values.model === 'investment-v2') {
      const result = projectInvestment(inputsFromValues(values));
      return { metrics: [m('Net projected value', result.net), m('Total invested', result.invested), m('Net gain', result.gain), m('Value in today’s money', result.real)], columns: ['Year', 'Invested (INR)', 'Gain before exit (INR)', 'Value before exit (INR)'], rows: result.annual.map(row => [row.month / 12, row.invested, row.closing - row.invested, row.closing]), chart: result.annual.map(row => ({ label: `Year ${row.month / 12}`, value: row.closing, base: row.invested })) };
    }
    let balance = 0, invested = 0;
    for (let month = 1; month <= y * 12; month++) {
      const contribution = v('monthly') * (1 + v('step') / 100) ** Math.floor((month - 1) / 12);
      balance = balance * (1 + r / 12) + contribution; invested += contribution;
      if (month % 12 === 0) { rows.push([month / 12, invested, balance - invested, balance]); chart.push({ label: `Year ${month / 12}`, value: balance, base: invested }); }
    }
    return { metrics: [m('Projected value', balance), m('Total invested', invested), m('Estimated gain', balance - invested), m('Value in today’s money', balance / (1 + v('inflation') / 100) ** y)], columns: ['Year', 'Invested (INR)', 'Gain (INR)', 'Value (INR)'], rows, chart };
  }
  if (['compound-growth', 'fixed-deposit'].includes(slug)) {
    const freq = slug === 'fixed-deposit' ? v('frequency') : 1;
    const growth = (1 + r / freq) ** freq;
    for (let i = 1; i <= y; i++) {
      const value = P * growth ** i;
      rows.push([i, value, P]); chart.push({ label: `Year ${i}`, value, base: P });
    }
    const value = Number(rows.at(-1)![1]);
    return { metrics: [m('Maturity value', value), m('Principal', P), m('Interest / gain', value - P)], columns: ['Year', 'Value (INR)', 'Principal (INR)'], rows, chart };
  }
  if (slug === 'goal-planner') {
    const goal = v('goal') * (1 + v('inflation') / 100) ** y, factor = (1 + r / 12) ** (12 * y);
    const existing = P * factor, gap = Math.max(0, goal - existing), annuity = r === 0 ? 12 * y : (factor - 1) / (r / 12);
    return { metrics: [m('Required monthly SIP', gap / annuity), m('Inflation-adjusted goal', goal), m('Existing savings at goal date', existing)], columns: ['Component', 'Amount (INR)'], rows: [['Future goal', goal], ['Future existing investments', existing], ['Shortfall to fund', gap]], note: gap === 0 ? 'Existing savings meet the goal under these assumptions.' : undefined };
  }
  if (slug === 'emi') {
    const n = y * 12, monthly = r / 12, emi = monthly === 0 ? P / n : P * monthly / (1 - (1 + monthly) ** -n);
    let balance = P, totalInterest = 0;
    for (let month = 1; month <= n; month++) {
      const interest = balance * monthly, principal = month === n ? balance : Math.min(balance, emi - interest);
      balance = Math.max(0, balance - principal); totalInterest += interest;
      rows.push([month, principal + interest, principal, interest, balance]);
      if (month % 12 === 0) chart.push({ label: `Year ${month / 12}`, value: balance });
    }
    return { metrics: [m('Monthly EMI', emi), m('Total interest', totalInterest), m('Total repayment', P + totalInterest)], columns: ['Month', 'Payment (INR)', 'Principal (INR)', 'Interest (INR)', 'Balance (INR)'], rows, chart };
  }
  if (slug === 'position-size') {
    const p={...POSITION_DEFAULTS,capital:v('capital'),available:v('capital'),riskPercent:v('risk'),entry:v('entry'),stop:v('stop'),target:v('target'),lotSize:v('lotSize'),tick:0};
    const q=planPosition(p);
    return {metrics:[m('Position size (units)',q.quantity,'number'),m('Funding required',q.fundsRequired),m('Modeled loss at stop',q.stopLoss),m('Net reward / risk',q.rewardRisk,'number')],columns:['Scenario','Price (INR)','Position P&L (INR)'],rows:[['Stop',p.stop,-q.stopLoss],['Target',p.target,q.targetProfit]],note: 'Whole exchange lots rounded down against both risk and funding.'};
  }
  throw new Error('Calculation unavailable.');
}
export function safeCalculate(slug: string, values: Values): { result?: Result; error?: string } {
  try { const result = calculate(slug, values); if (result.metrics.some(m => !Number.isFinite(m.value)) || result.rows.some(row => row.some(value => typeof value === 'number' && !Number.isFinite(value)))) return { error: 'These inputs exceed the supported numerical range. Reduce the values or time horizon.' }; return { result }; }
  catch (error) { return { error: error instanceof Error ? error.message : 'Check your inputs.' }; }
}
export function formatValue(value: number, kind: Metric['kind'] = 'money'): string {
  const number = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: kind === 'percent' ? 2 : 0 }).format(value);
  return kind === 'money' ? `${value < 0 ? '−' : ''}₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(Math.abs(value))}` : kind === 'percent' ? `${number}%` : number;
}


