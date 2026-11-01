import { presentValueFactor, numberIn } from './planning-core.ts';
export type LoanInputs = { principal: number; annualRate: number; months: number; feePercent: number; feeFixed: number; financeFees: boolean;
  extraMonthly: number; prepayMonth: number; prepayAmount: number; prepayCharge: number; prepayStrategy: 'tenure' | 'emi';
  rateStrategy: 'tenure' | 'emi'; resets: { month: number; rate: number }[] };
export const LOAN_DEFAULTS: LoanInputs = { principal: 3000000, annualRate: 8.5, months: 240, feePercent: 1, feeFixed: 0, financeFees: false,
  extraMonthly: 0, prepayMonth: 24, prepayAmount: 0, prepayCharge: 0, prepayStrategy: 'tenure', rateStrategy: 'emi', resets: [] };
export function payment(principal: number, annualRate: number, months: number): number { return principal / presentValueFactor(annualRate / 1200, months); }
export function loanYield(proceeds: number, payments: number[]): number | null {
  if (proceeds <= 0 || !payments.length) return null;
  const pv = (growth: number) => payments.reduce((n, c, i) => n + c / growth ** (i + 1), 0) - proceeds;
  let lo = .0001, hi = 2;
  while (pv(hi) > 0 && hi < 100) hi *= 2;
  if (pv(hi) > 0) return null;
  for (let i = 0; i < 120; i++) { const mid = (lo + hi) / 2; if (pv(mid) > 0) lo = mid; else hi = mid; }
  return (lo + hi) / 2 - 1;
}
export function planLoan(p: LoanInputs) {
  numberIn(p.principal, 'Loan principal', 1, 1e10); numberIn(p.annualRate, 'Annual loan rate', 0, 50);
  numberIn(p.months, 'Contractual months', 1, 480, true); numberIn(p.feePercent, 'Upfront fee', 0, 20); numberIn(p.feeFixed, 'Fixed charges', 0, 1e9);
  numberIn(p.extraMonthly, 'Extra monthly payment', 0, 1e9); numberIn(p.prepayMonth, 'Prepayment month', 1, 480, true);
  numberIn(p.prepayAmount, 'Prepayment amount', 0, 1e10); numberIn(p.prepayCharge, 'Prepayment charge', 0, 20);
  if (!['tenure', 'emi'].includes(p.prepayStrategy) || !['tenure', 'emi'].includes(p.rateStrategy)) throw new Error('Choose valid payment strategies.');
  if (p.resets.length > 12 || new Set(p.resets.map(r => r.month)).size !== p.resets.length) throw new Error('Use at most 12 unique rate-reset months.');
  for (const reset of p.resets) { numberIn(reset.month, 'Rate-reset month', 1, 480, true); numberIn(reset.rate, 'Reset rate', 0, 50); }
  const fee = p.principal * p.feePercent / 100 + p.feeFixed;
  const proceeds = p.principal - (p.financeFees ? 0 : fee);
  if (proceeds <= 0) throw new Error('Upfront charges must be smaller than the loan proceeds.');
  const financed = p.principal + (p.financeFees ? fee : 0);
  let balance = financed, rate = p.annualRate, emi = payment(balance, rate, p.months), interestTotal = 0, prepayFees = 0;
  const initialPayment = emi;
  const rows: { month: number; opening: number; rate: number; payment: number; interest: number; principal: number; extra: number; charge: number; closing: number; cash: number }[] = [];
  for (let month = 1; month <= 1200 && balance > .000001; month++) {
    const reset = p.resets.find(r => r.month === month);
    if (reset) { rate = reset.rate; if (p.rateStrategy === 'emi') emi = payment(balance, rate, Math.max(1, p.months - month + 1)); }
    const opening = balance, interest = balance * rate / 1200;
    const scheduled = Math.min(emi, balance + interest);
    const requested = p.extraMonthly + (month === p.prepayMonth ? p.prepayAmount : 0);
    const extra = Math.min(requested, Math.max(0, balance + interest - scheduled));
    const principal = scheduled - interest + extra;
    if (principal <= 0) throw new Error('The retained payment does not cover interest. Increase the EMI, add a recurring payment, or choose EMI adjustment for rate resets.');
    balance = Math.max(0, balance - principal);
    const charge = extra * p.prepayCharge / 100; prepayFees += charge; interestTotal += interest;
    rows.push({ month, opening, rate, payment: scheduled, interest, principal, extra, charge, closing: balance, cash: scheduled + extra + charge });
    if (extra > 0 && balance > 0 && p.prepayStrategy === 'emi') emi = payment(balance, rate, Math.max(1, p.months - month));
  }
  if (balance > .000001) throw new Error('This payment path does not close the loan within 1,200 months. Increase the payment or change the rate-reset strategy.');
  const totalCash = rows.reduce((n, r) => n + r.cash, 0), monthlyYield = loanYield(proceeds, rows.map(r => r.cash));
  return { rows, financed, proceeds, fee, prepayFees, initialPayment, interest: interestTotal, totalCash, totalCost: totalCash - proceeds,
    payoffMonths: rows.length, peakRecurring: Math.max(...rows.map(r => r.payment + Math.min(p.extraMonthly, r.extra))),
    nominalCost: monthlyYield === null ? null : monthlyYield * 1200, effectiveCost: monthlyYield === null ? null : ((1 + monthlyYield) ** 12 - 1) * 100 };
}
export function refinanceLoan(p: LoanInputs, atMonth: number, newRate: number, newMonths: number, switchingCost: number, discount: number) {
  const old = planLoan(p);
  numberIn(atMonth, 'Refinance month', 1, old.payoffMonths - 1, true); numberIn(newRate, 'New rate', 0, 50);
  numberIn(newMonths, 'New loan months', 1, 480, true); numberIn(switchingCost, 'Switching costs', 0, 1e9); numberIn(discount, 'Discount rate', 0, 50);
  const balance = old.rows[atMonth - 1].closing;
  const next = planLoan({ ...p, principal: balance, annualRate: newRate, months: newMonths, feePercent: 0, feeFixed: 0, financeFees: false,
    resets: [], prepayMonth: Math.max(1, p.prepayMonth - atMonth), prepayAmount: p.prepayMonth > atMonth ? p.prepayAmount : 0 });
  const remaining = old.rows.slice(atMonth), q = (1 + discount / 100) ** (1 / 12);
  let oldPV = 0, newPV = switchingCost, cumulative = -switchingCost, recovery: number | null = switchingCost === 0 ? 0 : null;
  const rows = Array.from({ length: Math.max(remaining.length, next.rows.length) }, (_, i) => {
    const oldCash = remaining[i]?.cash ?? 0, newCash = next.rows[i]?.cash ?? 0;
    const saving = (oldCash - newCash) / q ** (i + 1); oldPV += oldCash / q ** (i + 1); newPV += newCash / q ** (i + 1); cumulative += saving;
    if (recovery === null && cumulative >= 0) recovery = i + 1;
    return { month: i + 1, oldCash, newCash, saving, cumulative };
  });
  return { balance, next, oldPV, newPV, advantage: oldPV - newPV, recovery, rows };
}
