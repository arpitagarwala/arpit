export type InvestmentInputs = {
  monthly: number; initial: number; years: number; annualReturn: number;
  rateBasis: 'effective' | 'nominal'; timing: 'beginning' | 'end';
  stepMode: 'percent' | 'fixed'; step: number; cap: number;
  inflation: number; fee: number; returnBasis: 'gross' | 'net';
  exitCharge: number; tax: number; exemption: number;
  pauseStart: number; pauseMonths: number; goal: number; goalBasis: 'today' | 'future';
};
export type InvestmentRow = { month: number; opening: number; contribution: number; growth: number; fee: number; closing: number; invested: number; real: number };
export type InvestmentResult = {
  rows: InvestmentRow[]; annual: InvestmentRow[]; value: number; net: number; invested: number; gain: number;
  real: number; feeDrag: number; feesPaid: number; tax: number; exitCharge: number;
  grossAnnual: number; netAnnual: number; realAnnual: number; irr: number | null;
  futureGoal: number; shortfall: number; lastContribution: number;
};
export const INVESTMENT_DEFAULTS: InvestmentInputs = {
  monthly: 10000, initial: 100000, years: 15, annualReturn: 10,
  rateBasis: 'effective', timing: 'end', stepMode: 'percent', step: 5, cap: 0,
  inflation: 5, fee: 0.5, returnBasis: 'gross', exitCharge: 0, tax: 0, exemption: 0,
  pauseStart: 1, pauseMonths: 0, goal: 5000000, goalBasis: 'today',
};
const bounds: Partial<Record<keyof InvestmentInputs, [number, number]>> = {
  monthly: [0, 1e8], initial: [0, 1e10], years: [1, 50], annualReturn: [-50, 50],
  step: [0, 1e7], cap: [0, 1e8], inflation: [0, 30], fee: [0, 10],
  exitCharge: [0, 20], tax: [0, 50], exemption: [0, 1e10], pauseStart: [1, 600],
  pauseMonths: [0, 600], goal: [0, 1e12],
};
export function validateInvestment(p: InvestmentInputs): void {
  for (const [key, range] of Object.entries(bounds)) {
    const value = p[key as keyof InvestmentInputs];
    if (typeof value !== 'number' || !Number.isFinite(value) || value < range[0] || value > range[1]) throw new Error(`${key}: enter a number between ${range[0]} and ${range[1]}.`);
  }
  for (const key of ['years', 'pauseStart', 'pauseMonths'] as const) if (!Number.isInteger(p[key])) throw new Error(`${key} must be a whole number.`);
  if (!['effective', 'nominal'].includes(p.rateBasis) || !['beginning', 'end'].includes(p.timing) || !['percent', 'fixed'].includes(p.stepMode) || !['gross', 'net'].includes(p.returnBasis) || !['today', 'future'].includes(p.goalBasis)) throw new Error('Choose valid calculation conventions.');
  if (p.stepMode === 'percent' && p.step > 30) throw new Error('Percentage step-up must be between 0% and 30%.');
  if (p.pauseMonths && p.pauseStart + p.pauseMonths - 1 > p.years * 12) throw new Error('The contribution pause must fit within your investment horizon.');
}

// Solve periodic money-weighted return. Outflows occur at actual period boundaries,
// not as an assumed lump sum equal to the sum of all contributions.
export function periodicReturn(flows: number[]): number | null {
  if (flows.at(-1)! <= 0 || !flows.slice(0, -1).some(v => v < 0)) return null;
  const terminal = flows.at(-1)!;
  const months = flows.length - 1;
  const ending = (q: number) => flows.slice(0, -1).reduce((sum, flow, i) => sum - flow * q ** (months - i), 0) - terminal;
  let lo = 0, hi = 1;
  while (ending(hi) < 0 && hi < 100) hi *= 2;
  if (ending(hi) < 0) return null;
  for (let i = 0; i < 100; i++) { const mid = (lo + hi) / 2; if (ending(mid) > 0) hi = mid; else lo = mid; }
  return ((lo + hi) / 2) ** 12 - 1;
}

export function projectInvestment(p: InvestmentInputs, sequence: 'constant' | 'early' | 'late' = 'constant', withIRR = true): InvestmentResult {
  validateInvestment(p);
  const monthlyGrowth = p.rateBasis === 'effective' ? (1 + p.annualReturn / 100) ** (1 / 12) : 1 + p.annualReturn / 1200;
  const feeFactor = p.returnBasis === 'gross' ? (1 - p.fee / 100) ** (1 / 12) : 1;
  const grossAnnual = monthlyGrowth ** 12 - 1;
  const netAnnual = (monthlyGrowth * feeFactor) ** 12 - 1;
  let balance = p.initial, noFee = p.initial, invested = p.initial, feesPaid = 0;
  const rows: InvestmentRow[] = [], flows = Array(p.years * 12 + 1).fill(0) as number[];
  flows[0] = -p.initial;
  for (let month = 1; month <= p.years * 12; month++) {
    const year = Math.floor((month - 1) / 12);
    let contribution = p.stepMode === 'percent' ? p.monthly * (1 + p.step / 100) ** year : p.monthly + p.step * year;
    if (p.cap > 0) contribution = Math.min(contribution, p.cap);
    if (p.pauseMonths && month >= p.pauseStart && month < p.pauseStart + p.pauseMonths) contribution = 0;
    let shock = 1;
    if (p.years >= 2 && sequence === 'early') { if (year === 0) shock = .75; if (year === 1) shock = 1 / .75; }
    if (p.years >= 2 && sequence === 'late') { if (year === p.years - 2) shock = 1 / .75; if (year === p.years - 1) shock = .75; }
    const growthFactor = monthlyGrowth * shock ** (1 / 12);
    const opening = balance;
    const workingBalance = balance + (p.timing === 'beginning' ? contribution : 0);
    const growth = workingBalance * (growthFactor - 1);
    const fee = (workingBalance + growth) * (1 - feeFactor);
    balance = workingBalance + growth - fee + (p.timing === 'end' ? contribution : 0);
    noFee = (noFee + (p.timing === 'beginning' ? contribution : 0)) * growthFactor + (p.timing === 'end' ? contribution : 0);
    invested += contribution; feesPaid += fee;
    flows[p.timing === 'beginning' ? month - 1 : month] -= contribution;
    if (!Number.isFinite(balance) || balance > 1e16 || invested > 1e16) throw new Error('Projected amounts exceed the supported range. Reduce the horizon, step-up, or contribution.');
    rows.push({ month, opening, contribution, growth, fee, closing: balance, invested, real: balance / (1 + p.inflation / 100) ** (month / 12) });
  }
  const exitCharge = balance * p.exitCharge / 100;
  const tax = Math.max(0, balance - exitCharge - invested - p.exemption) * p.tax / 100;
  const net = balance - exitCharge - tax;
  flows[flows.length - 1] += net;
  const futureGoal = p.goal * (p.goalBasis === 'today' ? (1 + p.inflation / 100) ** p.years : 1);
  const annual = rows.filter(r => r.month % 12 === 0).map(last => {
    const year = rows.slice(last.month - 12, last.month);
    return { ...last, opening: year[0].opening, contribution: year.reduce((n, r) => n + r.contribution, 0), growth: year.reduce((n, r) => n + r.growth, 0), fee: year.reduce((n, r) => n + r.fee, 0) };
  });
  return { rows, annual, value: balance, net, invested, gain: net - invested,
    real: net / (1 + p.inflation / 100) ** p.years, feeDrag: noFee - balance, feesPaid, exitCharge, tax,
    grossAnnual: grossAnnual * 100, netAnnual: netAnnual * 100, realAnnual: ((1 + netAnnual) / (1 + p.inflation / 100) - 1) * 100,
    irr: withIRR ? periodicReturn(flows) : null, futureGoal, shortfall: Math.max(0, futureGoal - net), lastContribution: rows.at(-1)!.contribution };
}

export function requiredMonthly(p: InvestmentInputs): number | null {
  const target = p.goal * (p.goalBasis === 'today' ? (1 + p.inflation / 100) ** p.years : 1);
  if (target > 1e16) return null;
  const evaluate = (monthly: number) => {
    try { return projectInvestment({ ...p, monthly }, 'constant', false).net; }
    catch (error) { if (error instanceof Error && error.message.startsWith('Projected amounts exceed')) return Infinity; throw error; }
  };
  if (evaluate(0) >= target) return 0;
  let lo = 0, hi = Math.max(1, p.monthly);
  while (evaluate(hi) < target && hi < 1e8) hi = Math.min(1e8, hi * 2);
  if (evaluate(hi) < target) return null;
  for (let i = 0; i < 70; i++) { const mid = (lo + hi) / 2; if (evaluate(mid) < target) lo = mid; else hi = mid; }
  const outcome = evaluate(hi);
  return Number.isFinite(outcome) && outcome >= target * (1 - 1e-10) ? hi : null;
}
export function requiredInitial(p: InvestmentInputs): number | null {
  const target = p.goal * (p.goalBasis === 'today' ? (1 + p.inflation / 100) ** p.years : 1);
  const result = (initial: number) => projectInvestment({ ...p, initial, monthly: 0, step: 0, pauseMonths: 0 }, 'constant', false).net;
  let lo = 0, hi = Math.max(1, p.initial);
  if (target === 0) return 0;
  try {
    while (result(hi) < target && hi < 1e10) hi = Math.min(1e10, hi * 2);
    if (result(hi) < target) return null;
    for (let i = 0; i < 70; i++) { const mid = (lo + hi) / 2; if (result(mid) < target) lo = mid; else hi = mid; }
    return hi;
  } catch { return null; }
}

export function investmentValues(p: InvestmentInputs): Record<string, string> {
  return { ...Object.fromEntries(Object.entries(p).map(([k, v]) => [k, String(v)])), model: 'investment-v2', return: String(p.annualReturn), stepValue: String(p.step), step: p.stepMode === 'percent' ? String(p.step) : '0' };
}
export function inputsFromValues(values: Record<string, string>): InvestmentInputs {
  if (values.model !== 'investment-v2') {
    const legacy = { ...INVESTMENT_DEFAULTS, initial: 0, fee: 0, monthly: Number(values.monthly), annualReturn: Number(values.return), years: Number(values.years), step: Number(values.step), inflation: Number(values.inflation), rateBasis: 'nominal' as const };
    validateInvestment(legacy); return legacy;
  }
  const restored = { ...INVESTMENT_DEFAULTS };
  for (const key of Object.keys(restored) as (keyof InvestmentInputs)[]) {
    const raw = values[key === 'step' ? 'stepValue' : key];
    if (raw === undefined || raw.trim() === '') throw new Error('Investment inputs are incomplete.');
    Object.assign(restored, { [key]: typeof INVESTMENT_DEFAULTS[key] === 'number' ? Number(raw) : raw });
  }
  validateInvestment(restored); return restored;
}

export function investmentCsv(p: InvestmentInputs, result: InvestmentResult, name: string, timestamp: string): string {
  const cell = (v: string | number) => '"' + (typeof v === 'number' ? String(v) : /^[=+@\-\t\r]/.test(v) ? `'${v}` : v).replaceAll('"', '""') + '"';
  const rows: (string | number)[][] = [
    ['Investment Lab', name || 'Current scenario'], ['Model', 'investment-v2'], ['Exported', timestamp], ['Currency', 'INR'], [],
    ['Input', 'Value'], ...Object.entries(p), [], ['Measure', 'Value'],
    ['Portfolio before exit deductions', result.value], ['Net liquidation value', result.net], ['Contributed capital', result.invested],
    ['Net gain', result.gain], ['Net value in today’s money', result.real], ['Fee drag incl. lost growth', result.feeDrag], ['Fees paid', result.feesPaid],
    ['Exit charge', result.exitCharge], ['Illustrative tax', result.tax], ['Money-weighted annual return (%)', result.irr === null ? 'Not defined' : result.irr * 100],
    ['Future goal', result.futureGoal], ['Shortfall', result.shortfall], [],
    ['Month', 'Opening (INR)', 'Contribution (INR)', 'Gross growth (INR)', 'Fee (INR)', 'Closing (INR)', 'Cumulative capital (INR)', 'Closing in today’s money (INR)'],
    ...result.rows.map(r => [r.month, r.opening, r.contribution, r.growth, r.fee, r.closing, r.invested, r.real]), [],
    ['Conventions', 'Effective annual return converted geometrically, or nominal annual divided by 12 as selected. Step-up from month 13. Pauses do not stop investment growth or the annual step-up clock.'],
    ['Costs', 'Gross return mode applies annual fee factor geometrically each month. Net return mode ignores the fee input to avoid double counting. Exit charge applies to full final value. Tax is a user-specified one-time levy on positive gains after exit charge and exemption; no statutory tax rules, holding-period rules, cess, or tax on interim distributions.'],
    ['Limits', 'Constant return scenario, not a forecast. No product recommendations. No probability estimates. Full-precision model; displayed values rounded. Equal monthly periods; annualised IRR, not actual-date XIRR.'],
  ];
  return '\uFEFF' + rows.map(row => row.map(cell).join(',')).join('\r\n');
}

