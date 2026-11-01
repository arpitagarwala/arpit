import { addMonths, annuityFactor, fullMonths, numberIn, yearFraction } from './planning-core.ts';
export type Goal = { id: string; name: string; cost: number; date: string; inflation: number; annualReturn: number; allocated: number; priority: number };
export type GoalPlan = { start: string; savings: number; monthlyBudget: number; allocation: 'priority' | 'proportional'; goals: Goal[] };
export function goalMath(start: string, goal: Goal) {
  const months = fullMonths(start, goal.date);
  numberIn(months, 'Goal horizon in months', 0, 600, true);
  numberIn(goal.cost, 'Goal cost today', 1); numberIn(goal.inflation, 'Goal inflation', 0, 30);
  numberIn(goal.annualReturn, 'Return after expenses', -50, 50); numberIn(goal.allocated, 'Allocated savings');
  numberIn(goal.priority, 'Priority', 1, 20, true);
  const stub = yearFraction(addMonths(start, months), goal.date);
  const years = months / 12 + stub, monthlyRate = Math.expm1(Math.log1p(goal.annualReturn / 100) / 12);
  const finalStub = (1 + goal.annualReturn / 100) ** stub;
  const target = goal.cost * (1 + goal.inflation / 100) ** years;
  const existing = goal.allocated * (1 + monthlyRate) ** months * finalStub;
  const factor = annuityFactor(monthlyRate, months) * finalStub;
  const shortfall = Math.max(0, target - existing);
  const required = shortfall === 0 ? 0 : factor > 0 ? shortfall / factor : null;
  if (![target, existing, factor].every(Number.isFinite) || target > 1e16 || existing > 1e16) throw new Error('Goal projections exceed the supported range. Reduce the amount or horizon.');
  return { months, years, target, existing, factor, required };
}
export function planGoals(p: GoalPlan) {
  numberIn(p.savings, 'Available savings'); numberIn(p.monthlyBudget, 'Monthly budget', 0, 1e9);
  if (!p.goals.length || p.goals.length > 12) throw new Error('Add 1–12 goals.');
  if (!['priority', 'proportional'].includes(p.allocation)) throw new Error('Choose a budget allocation strategy.');
  if (new Set(p.goals.map(g => g.id)).size !== p.goals.length) throw new Error('Goal identifiers must be unique.');
  const allocated = p.goals.reduce((n, g) => n + g.allocated, 0);
  if (allocated > p.savings + .01) throw new Error('Allocated goal savings exceed your available pool. The same savings cannot fund two goals.');
  const base = p.goals.map(g => { if (!g.name.trim()) throw new Error('Give each goal a name.'); return { ...g, ...goalMath(p.start, g) }; });
  const required = base.reduce((n, g) => n + (g.required ?? 0), 0);
  const allocations = new Map<string, number>(); let available = p.monthlyBudget;
  for (const goal of [...base].sort((a, b) => a.priority - b.priority || a.date.localeCompare(b.date))) {
    const monthly = p.allocation === 'priority' ? Math.min(available, goal.required ?? 0) : required ? Math.min(1, p.monthlyBudget / required) * (goal.required ?? 0) : 0;
    allocations.set(goal.id, monthly); available = Math.max(0, available - monthly);
  }
  const goals = base.map(g => { const monthly = allocations.get(g.id)!; const projected = g.existing + monthly * g.factor; return { ...g, monthly, projected, gap: Math.max(0, g.target - projected), funding: Math.min(100, projected / g.target * 100) }; });
  return { goals, required, monthlyGap: Math.max(0, required - p.monthlyBudget), availableSavings: Math.max(0, p.savings - allocated),
    budgetUsed: goals.reduce((n, g) => n + g.monthly, 0), unfundableBeforeFirstPayment: goals.filter(g => g.required === null).length };
}
