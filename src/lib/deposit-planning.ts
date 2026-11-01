import { addMonths, dateValue, datedYield, numberIn, yearFraction } from './planning-core.ts';
export type DepositInputs = { principal: number; rate: number; months: number; start: string; mode: 'cumulative' | 'monthly' | 'quarterly';
  frequency: number; dayBasis: 'actual365' | 'actualActual'; monthlyConvention: 'nominal' | 'discounted'; tax: number; withholding: number };
export const DEPOSIT_DEFAULTS: Omit<DepositInputs, 'start'> = { principal: 500000, rate: 7, months: 36, mode: 'cumulative', frequency: 4,
  dayBasis: 'actual365', monthlyConvention: 'discounted', tax: 0, withholding: 0 };
export function validateDeposit(p: DepositInputs) {
  numberIn(p.principal, 'Deposit principal', 1, 1e10); numberIn(p.rate, 'Quoted nominal rate', 0, 30);
  numberIn(p.months, 'Deposit months', 1, 600, true); numberIn(p.tax, 'Illustrative tax rate', 0, 50); numberIn(p.withholding, 'Withholding rate', 0, 50);
  dateValue(p.start);
  if (![1, 2, 4, 12].includes(p.frequency) || !['cumulative', 'monthly', 'quarterly'].includes(p.mode) || !['actual365', 'actualActual'].includes(p.dayBasis) || !['nominal', 'discounted'].includes(p.monthlyConvention)) throw new Error('Choose valid deposit conventions.');
}
export function planDeposit(p: DepositInputs) {
  validateDeposit(p);
  const maturity = addMonths(p.start, p.months), period = p.mode === 'cumulative' ? 12 / p.frequency : p.mode === 'monthly' ? 1 : 3;
  let balance = p.principal, grossInterest = 0, totalWithheld = 0, lastDate = p.start;
  const rows: { date: string; opening: number; interest: number; credited: number; payout: number; withheld: number; cash: number; balance: number; event: string }[] = [];
  const cash: { date: string; amount: number }[] = [];
  const grossCash: { date: string; amount: number }[] = [];
  for (let offset = period; offset <= p.months; offset += period) {
    const date = addMonths(p.start, offset), opening = balance;
    const interest = p.mode === 'cumulative' ? balance * p.rate / 100 / p.frequency : p.mode === 'quarterly' ? p.principal * p.rate / 400 : p.principal * (p.monthlyConvention === 'nominal' ? p.rate / 1200 : (1 + p.rate / 400) ** (1 / 3) - 1);
    grossInterest += interest;
    const payout = p.mode === 'cumulative' ? 0 : interest;
    const withheld = payout * p.withholding / 100;
    totalWithheld += withheld;
    if (p.mode === 'cumulative') balance += interest;
    if (payout) { cash.push({ date, amount: payout - withheld }); grossCash.push({ date, amount: payout }); }
    rows.push({ date, opening, interest, credited: p.mode === 'cumulative' ? interest : 0, payout, withheld, cash: payout - withheld, balance, event: p.mode === 'cumulative' ? 'Interest credited' : 'Interest paid' });
    lastDate = date;
  }
  if (lastDate !== maturity) {
    const opening = balance, interest = balance * p.rate / 100 * yearFraction(lastDate, maturity, p.dayBasis);
    grossInterest += interest;
    if (p.mode === 'cumulative') balance += interest;
    const payout = p.mode === 'cumulative' ? 0 : interest, withheld = payout * p.withholding / 100;
    totalWithheld += withheld; if (payout) { cash.push({ date: maturity, amount: payout - withheld }); grossCash.push({ date: maturity, amount: payout }); }
    rows.push({ date: maturity, opening, interest, credited: p.mode === 'cumulative' ? interest : 0, payout, withheld, cash: payout - withheld, balance, event: 'Final stub interest' });
  }
  const finalWithholding = p.mode === 'cumulative' ? grossInterest * p.withholding / 100 : 0;
  totalWithheld += finalWithholding;
  const terminalCash = balance - finalWithholding;
  cash.push({ date: maturity, amount: terminalCash });
  grossCash.push({ date: maturity, amount: balance });
  rows.push({ date: maturity, opening: balance, interest: 0, credited: 0, payout: balance, withheld: finalWithholding, cash: terminalCash, balance: 0, event: 'Deposit redeemed' });
  const tax = grossInterest * p.tax / 100, taxBalance = tax - totalWithheld;
  const finalEconomicCash = cash.map((c, i) => i === cash.length - 1 ? { ...c, amount: c.amount - taxBalance } : c);
  return { maturity, rows, grossInterest, grossValue: p.principal + grossInterest, terminalCash, totalWithheld, tax, taxBalance,
    netEconomicValue: p.principal + grossInterest - tax, cashReceived: p.principal + grossInterest - totalWithheld,
    grossYield: datedYield(p.start, p.principal, grossCash),
    netYield: datedYield(p.start, p.principal, finalEconomicCash), cash };
}
export function earlyDeposit(p: DepositInputs, months: number, applicableRate: number, penaltyPoints: number) {
  validateDeposit(p); numberIn(months, 'Early exit months', 1, p.months, true); numberIn(applicableRate, 'Applicable held-term rate', 0, 30); numberIn(penaltyPoints, 'Rate penalty in percentage points', 0, 20);
  const rate = Math.max(0, Math.min(p.rate, applicableRate) - penaltyPoints);
  const revised = planDeposit({ ...p, months, rate });
  const original = planDeposit(p);
  const alreadyPaid = original.rows.filter(row => row.date < revised.maturity && row.event !== 'Deposit redeemed').reduce((n, row) => n + row.payout, 0);
  const alreadyWithheld = alreadyPaid * p.withholding / 100;
  const adjustment = revised.grossInterest - alreadyPaid;
  const closingWithheld = Math.max(0, adjustment) * p.withholding / 100;
  const closingCash = p.principal + adjustment - closingWithheld;
  if (closingCash < 0) throw new Error('Interest recovery exceeds principal under these assumptions. Check the bank’s actual closure rules.');
  return { ...revised, rate, alreadyPaid, alreadyWithheld, adjustment, closingCash, withholdingHeld: alreadyWithheld + closingWithheld,
    finalTaxBalance: revised.tax - alreadyWithheld - closingWithheld };
}
export type LadderRung = { months: number; rate: number; bank: string };
export function depositLadder(p: DepositInputs, rungs: LadderRung[], otherDeposits: number, insuranceCap: number) {
  if (!rungs.length || rungs.length > 10) throw new Error('Use 1–10 ladder rungs.');
  numberIn(otherDeposits, 'Other deposits per listed bank', 0, 1e10); numberIn(insuranceCap, 'Insurance cap per bank', 0, 1e10);
  const deposits = rungs.map((rung, i) => {
    if (!rung.bank.trim()) throw new Error('Give each rung a bank identifier. Use the same identifier for branches of the same bank.');
    const principal = i === rungs.length - 1 ? p.principal - p.principal / rungs.length * i : p.principal / rungs.length;
    const result = planDeposit({ ...p, principal, rate: rung.rate, months: rung.months, mode: 'cumulative' });
    return { ...rung, principal, result };
  });
  const banks = new Map<string, { name: string; principal: number; retainedMaturities: number }>();
  for (const deposit of deposits) { const key = deposit.bank.trim().toLowerCase(); const current = banks.get(key) ?? { name: deposit.bank.trim(), principal: 0, retainedMaturities: otherDeposits }; current.principal += deposit.principal; current.retainedMaturities += deposit.result.grossValue; banks.set(key, current); }
  return { deposits, banks: [...banks.values()].map(b => ({ ...b, aboveCap: Math.max(0, b.retainedMaturities - insuranceCap) })),
    totalNetProceeds: deposits.reduce((n, d) => n + d.result.netEconomicValue, 0) };
}
