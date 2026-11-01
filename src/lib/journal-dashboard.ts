import { journalAnalytics, roundMoney, tradeResult, type Trade } from './trade-journal.ts';
import { dateValue } from './planning-core.ts';
export const tradeDay=(trade:Trade)=> (trade.status==='closed'?trade.exitAt:trade.entryAt).slice(0,10);
export function tradesForDay(trades:Trade[],day:string){dateValue(day);return trades.filter(t=>tradeDay(t)===day).sort((a,b)=>a.entryAt.localeCompare(b.entryAt)||a.id.localeCompare(b.id));}
export function dashboardDays(trades:Trade[]){
  const groups=new Map<string,Trade[]>();for(const t of trades){const day=tradeDay(t);groups.set(day,[...(groups.get(day)??[]),t]);}
  return [...groups].sort(([a],[b])=>a.localeCompare(b)).map(([date,records])=>{const closed=records.filter(t=>t.status==='closed');return{date,records,count:records.length,closed:closed.length,pending:records.length-closed.length,net:roundMoney(closed.reduce((sum,t)=>sum+tradeResult(t).net!,0))};});
}
export function dashboardSummary(trades:Trade[],balance=0){
  const analytics=journalAnalytics(trades,balance),days=dashboardDays(trades),realised=days.filter(d=>d.closed>0);
  const profitDays=realised.filter(d=>d.net>0).length,lossDays=realised.filter(d=>d.net<0).length,flatDays=realised.length-profitDays-lossDays;
  let bestProfitStreak=0,bestLossStreak=0,streak=0,sign=0;
  for(const day of realised){const next=Math.sign(day.net);streak=next&&next===sign?streak+1:next?1:0;sign=next;if(sign>0)bestProfitStreak=Math.max(bestProfitStreak,streak);if(sign<0)bestLossStreak=Math.max(bestLossStreak,streak);}
  const bestDay=[...realised].filter(d=>d.net>0).sort((a,b)=>b.net-a.net||a.date.localeCompare(b.date))[0]??null;
  const worstDay=[...realised].filter(d=>d.net<0).sort((a,b)=>a.net-b.net||a.date.localeCompare(b.date))[0]??null;
  return{...analytics,days,tradingDays:realised.length,profitDays,lossDays,flatDays,bestProfitStreak,bestLossStreak,currentStreak:streak,currentStreakSign:sign,bestDay,worstDay,averagePerDay:realised.length?analytics.net/realised.length:null};
}
export function dashboardMonth(trades:Trade[],month:string){
  dateValue(`${month}-01`);const [year,m]=month.split('-').map(Number),length=new Date(Date.UTC(year,m,0)).getUTCDate(),offset=(new Date(`${month}-01T00:00:00Z`).getUTCDay()+6)%7;
  const days=new Map(dashboardDays(trades).map(d=>[d.date,d]));const cells=Array.from({length},(_,i)=>{const date=`${month}-${String(i+1).padStart(2,'0')}`;return{...(days.get(date)??{records:[],count:0,closed:0,pending:0,net:0}),date,day:i+1};});
  const padded:(typeof cells[number]|null)[]=[...Array.from({length:offset},()=>null),...cells];while(padded.length%7)padded.push(null);
  const weeks=Array.from({length:padded.length/7},(_,i)=>{const week=padded.slice(i*7,i*7+7);return{cells:week,net:roundMoney(week.reduce((sum,c)=>sum+(c?.net??0),0)),count:week.reduce((sum,c)=>sum+(c?.count??0),0)};});
  return{cells,offset,weeks,summary:dashboardSummary(trades.filter(t=>tradeDay(t).startsWith(month+'-')))};
}
