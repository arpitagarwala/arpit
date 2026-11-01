import { numberIn } from './planning-core.ts';
export type Market = 'cash' | 'futures' | 'option';
export type Side = 'long' | 'short';
export type PositionInputs = { symbol: string; market: Market; side: Side; capital: number; available: number; riskPercent: number; committedRisk: number; entry: number; stop: number; target: number; lotSize: number; multiplier: number; marginPerLot: number; costsPerLot: number; slippage: number; tick: number };
export const POSITION_DEFAULTS: PositionInputs = { symbol:'', market:'cash', side:'long', capital:200000, available:100000, riskPercent:1, committedRisk:0, entry:1000, stop:970, target:1090, lotSize:1, multiplier:1, marginPerLot:0, costsPerLot:0, slippage:0, tick:.05 };
export function planPosition(p: PositionInputs) {
  if (!['cash','futures','option'].includes(p.market) || !['long','short'].includes(p.side)) throw new Error('Choose a supported market and direction.');
  if (p.market === 'option' && p.side !== 'long') throw new Error('This tool supports bought options only; naked or multi-leg option selling needs a separate risk model.');
  numberIn(p.capital,'Account capital',1,1e12); numberIn(p.available,'Available cash or margin budget',0,1e12); numberIn(p.riskPercent,'Risk allowance',.01,100); numberIn(p.committedRisk,'Already committed risk',0,1e12);
  for (const k of ['entry','stop','target'] as const) numberIn(p[k], k+' price', k==='stop'?0:.000001,1e9);
  numberIn(p.lotSize,'Units per lot',1,1e6,true); numberIn(p.multiplier,'Value multiplier',.000001,1e6); numberIn(p.costsPerLot,'Round-trip costs per lot',0,1e9); numberIn(p.slippage,'Adverse slippage per fill',0,1e6); numberIn(p.tick,'Price tick',0,1e6);
  if(p.market!=='futures'&&p.slippage>Math.min(p.entry,p.target))throw new Error('Slippage is larger than an entry/target level. Use a buffer that does not imply negative execution prices.');
  const direction = p.side === 'long' ? 1 : -1;
  const distance = direction * (p.entry-p.stop), targetDistance = direction * (p.target-p.entry);
  if (distance <= 0 || targetDistance <= 0) throw new Error(p.side === 'long' ? 'For a long trade, stop must be below entry and target above entry.' : 'For a short trade, stop must be above entry and target below entry.');
  if (p.tick > 0 && [p.entry,p.stop,p.target].some(v=>Math.abs(v/p.tick-Math.round(v/p.tick))>1e-6)) throw new Error('Entry, stop and target must match the entered price tick. Use 0 only when you are not checking a tick grid.');
  if (p.market === 'futures') numberIn(p.marginPerLot,'Required margin per lot',.01,1e12);
  const pointValue = p.lotSize*p.multiplier, grossRisk = distance*pointValue, slipCost = 2*p.slippage*pointValue;
  const bufferedDistance=(multiple:number)=>p.side==='long'&&p.market!=='futures'?Math.min(p.entry+p.slippage,distance*multiple+2*p.slippage):distance*multiple+2*p.slippage;
  const riskPerLot = bufferedDistance(1)*pointValue+p.costsPerLot, rewardPerLot = targetDistance*pointValue-slipCost-p.costsPerLot;
  const fundingPerLot = (p.market==='futures'?p.marginPerLot:(p.entry+p.slippage)*pointValue)+p.costsPerLot;
  const totalBudget = p.capital*p.riskPercent/100, riskBudget=Math.max(0,totalBudget-p.committedRisk);
  const riskLots=Math.floor(riskBudget/riskPerLot), fundedLots=Math.floor(p.available/fundingPerLot), lots=Math.min(riskLots,fundedLots,1e6);
  const quantity=lots*p.lotSize, stopLoss=lots*riskPerLot, targetProfit=lots*rewardPerLot;
  const scenario = (multiple:number)=> lots*(bufferedDistance(multiple)*pointValue+p.costsPerLot);
  return { lots,quantity,pointValue,riskPerLot,rewardPerLot,grossRisk,fundingPerLot,totalBudget,riskBudget,riskLots,fundedLots,stopLoss,targetProfit,
    fundsRequired:lots*fundingPerLot,quoteExposure:lots*p.entry*pointValue,unspentRisk:riskBudget-stopLoss,
    riskOfCapital:stopLoss/p.capital*100,rewardRisk:rewardPerLot/riskPerLot,
    binding:riskLots>1e6&&fundedLots>1e6?'Model lot limit':riskLots<fundedLots?'Risk allowance':fundedLots<riskLots?'Funding budget':'Risk and funding budgets',
    nextLotRisk:(lots+1)*riskPerLot,nextLotFunding:(lots+1)*fundingPerLot,
    scenarios:[{label:'Planned stop distance',multiple:1,loss:scenario(1)},{label:'1.5× stop distance',multiple:1.5,loss:scenario(1.5)},{label:'2× stop distance',multiple:2,loss:scenario(2)}] };
}
