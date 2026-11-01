import { journalAnalytics, tradeResult, weekOf, type Trade } from './trade-journal.ts';
import { dateValue } from './planning-core.ts';
export function monthCalendar(trades:Trade[],month:string){
  if(!/^\d{4}-\d{2}$/.test(month))throw new Error('Choose a valid month.');dateValue(`${month}-01`);
  const [year,m]=month.split('-').map(Number),days=new Date(Date.UTC(year,m,0)).getUTCDate(),offset=(new Date(`${month}-01T00:00:00Z`).getUTCDay()+6)%7;
  const closed=trades.filter(t=>t.status==='closed'&&t.exitAt.startsWith(month+'-'));
  const cells=Array.from({length:days},(_,i)=>{const date=`${month}-${String(i+1).padStart(2,'0')}`,records=closed.filter(t=>t.exitAt.startsWith(date+'T')),net=Math.round(records.reduce((sum,t)=>sum+tradeResult(t).net!,0)*100)/100;return{date,day:i+1,count:records.length,net,records};});
  return{offset,cells,summary:journalAnalytics(closed,0)};
}
export function weeklyReview(trades:Trade[],week:string){
  dateValue(week);if(weekOf(week)!==week)throw new Error('Select the Monday of the review week.');
  const closed=trades.filter(t=>t.status==='closed'&&weekOf(t.exitAt.slice(0,10))===week),a=journalAnalytics(closed,0),known=closed.filter(t=>t.adherence!=='Unrecorded');
  const queue=[...closed].filter(t=>!t.lesson.trim()).sort((x,y)=>x.exitAt.localeCompare(y.exitAt));
  const focus=[...closed].sort((x,y)=>y.exitAt.localeCompare(x.exitAt)).find(t=>t.nextTime.trim());
  return{...a,queue,reviewed:closed.length-queue.length,disciplineCount:known.length,discipline:known.length?known.filter(t=>t.adherence==='Followed plan').length/known.length*100:null,focus:focus?.nextTime??'',focusTrade:focus??null};
}
