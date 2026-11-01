import { dateValue, numberIn, reportCsv } from './planning-core.ts';
import type { Market, Side } from './position-risk.ts';
// Read-only provenance for records saved before broker imports were removed.
type ImportInfo={broker:'groww'|'dhan'|'zerodha';account:string;mode:'fills'|'paired';chargesKnown:boolean;dateOnly:boolean;baseline:string;entryRef?:string;exitRef?:string};
export const JOURNAL_KEY='arpit.trade-journal.v1';
export const HANDOFF_KEY='arpit.trade-plan.v1';
export const MISTAKES=['FOMO entry','Oversized','Moved stop','Revenge trade','Ignored setup','Overtrading','Exited from fear','Late entry'] as const;
export const EMOTIONS=['Calm','Focused','Anxious','FOMO','Frustrated','Overconfident','Tired','Unrecorded'] as const;
export const ADHERENCE=['Followed plan','Partly followed','Broke plan','No plan','Unrecorded'] as const;
export const EXIT_REASONS=['Target reached','Stop triggered','Early: fear','Early: market changed','Time or expiry','Manual / other','Unrecorded'] as const;
export type Trade = { id:string; symbol:string; market:Market; side:Side; status:'planned'|'open'|'closed'; entryAt:string; exitAt:string; entry:number; exit:number|null; lotSize:number; lots:number; multiplier:number; stop:number|null; target:number|null; charges:number; strategy:string; basis:string; emotion:string; afterEmotion:string; adherence:string; exitReason:string; exitWhy:string; problems:string; lesson:string; nextTime:string; mistakes:string[]; quality:number|null; importInfo?:ImportInfo };
export type Journal = { version:1; currency:'INR'; startingBalance:number; trades:Trade[]; traderName?:string };
export type JournalFilter = { from:string; to:string; symbol:string; strategy:string; outcome:string; exitDay?:string };
export const EMPTY_FILTER:JournalFilter={from:'',to:'',symbol:'',strategy:'',outcome:'all'};
export const emptyJournal=():Journal=>({version:1,currency:'INR',startingBalance:0,trades:[]});
export const roundMoney=(n:number)=>Math.round((n+Number.EPSILON)*100)/100;
export function journalTime(value:string):number {
  if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value))throw new Error('Enter a valid date and time.');
  const hours=Number(value.slice(11,13)),minutes=Number(value.slice(14,16));
  if(hours>23||minutes>59)throw new Error('Enter a valid clock time.');
  return dateValue(value.slice(0,10))+(hours*60+minutes-330)*60000;
}
export function indiaNow():string {
  const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date());
  const get=(k:string)=>parts.find(p=>p.type===k)?.value??'';
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}
export function newTrade(id:string,at:string):Trade{return{id,symbol:'',market:'cash',side:'long',status:'closed',entryAt:at,exitAt:at,entry:NaN,exit:null,lotSize:1,lots:1,multiplier:1,stop:null,target:null,charges:0,strategy:'',basis:'',emotion:'Unrecorded',afterEmotion:'Unrecorded',adherence:'Unrecorded',exitReason:'Unrecorded',exitWhy:'',problems:'',lesson:'',nextTime:'',mistakes:[],quality:null};}
function text(v:unknown,label:string,max:number,required=false):string {if(typeof v!=='string'||v.length>max||(required&&!v.trim()))throw new Error(`${label}: ${required?'enter text, ':''}up to ${max} characters.`);return v;}
function oneOf(v:unknown,options:readonly string[],label:string):void{if(typeof v!=='string'||!options.includes(v))throw new Error(`Choose a valid ${label}.`);}
function cleanImportInfo(value:ImportInfo):ImportInfo{oneOf(value.broker,['groww','dhan','zerodha'],'broker');oneOf(value.mode,['fills','paired'],'import format');text(value.account,'Broker account label',64,true);text(value.baseline,'Import baseline',24,true);if(!/^[a-f0-9]{24}$/.test(value.baseline)||typeof value.chargesKnown!=='boolean'||typeof value.dateOnly!=='boolean')throw new Error('Invalid broker import metadata.');for(const key of ['entryRef','exitRef'] as const)if(value[key]!==undefined)text(value[key],key,100);return{broker:value.broker,account:value.account,mode:value.mode,chargesKnown:value.chargesKnown,dateOnly:value.dateOnly,baseline:value.baseline,...(value.entryRef?{entryRef:value.entryRef}:{}),...(value.exitRef?{exitRef:value.exitRef}:{})};}
export function validateTrade(t:Trade):void {
  if(t.importInfo)cleanImportInfo(t.importInfo);
  text(t.id,'Trade identifier',100,true);text(t.symbol,'Instrument',100,true);text(t.strategy,'Strategy',100);
  oneOf(t.market,['cash','futures','option'],'market');oneOf(t.side,['long','short'],'direction');oneOf(t.status,['planned','open','closed'],'status');
  journalTime(t.entryAt);text(t.exitAt,'Exit time',16);if(t.exit!==null)numberIn(t.exit,'Exit price',0,1e9);numberIn(t.entry,'Entry price',.000001,1e9);numberIn(t.lotSize,'Units per lot',1,1e6,true);numberIn(t.lots,'Lots',1,1e6,true);numberIn(t.multiplier,'Value multiplier',.000001,1e6);numberIn(t.charges,'Total trade charges',0,1e9);
  if(t.stop!==null){numberIn(t.stop,'Original stop price',0,1e9);if((t.entry-t.stop)*(t.side==='long'?1:-1)<=0)throw new Error('Original stop must be on the loss side of entry.');}
  if(t.target!==null){numberIn(t.target,'Original target price',.000001,1e9);if((t.target-t.entry)*(t.side==='long'?1:-1)<=0)throw new Error('Original target must be on the profit side of entry.');}
  if(t.status==='closed'){if(t.exit===null)throw new Error('Enter the average exit fill for a closed trade.');numberIn(t.exit,'Exit price',0,1e9);if(journalTime(t.exitAt)<journalTime(t.entryAt))throw new Error('Exit cannot be earlier than entry.');}
  oneOf(t.emotion,EMOTIONS,'entry emotion');oneOf(t.afterEmotion,EMOTIONS,'exit emotion');oneOf(t.adherence,ADHERENCE,'plan adherence');oneOf(t.exitReason,EXIT_REASONS,'exit reason');
  for(const k of ['basis','exitWhy','problems','lesson','nextTime'] as const)text(t[k],k,2000);
  if(!Array.isArray(t.mistakes)||t.mistakes.length>8||new Set(t.mistakes).size!==t.mistakes.length||t.mistakes.some(m=>!MISTAKES.includes(m as typeof MISTAKES[number])))throw new Error('Select recognised mistake tags without duplicates.');
  if(t.quality!==null)numberIn(t.quality,'Execution rating',1,5,true);
  if(t.status==='closed'&&Math.abs((t.exit!-t.entry)*t.lots*t.lotSize*t.multiplier)>1e12)throw new Error('This trade exceeds the supported ₹1 trillion profit/loss range.');
}
export function tradeResult(t:Trade){
  const quantity=t.lots*t.lotSize,initialRisk=t.stop===null?null:Math.abs(t.entry-t.stop)*quantity*t.multiplier;
  if(t.status!=='closed'||t.exit===null)return{quantity,initialRisk,gross:null,net:null,r:null};
  const gross=roundMoney((t.exit-t.entry)*(t.side==='long'?1:-1)*quantity*t.multiplier),net=roundMoney(gross-t.charges);
  return{quantity,initialRisk,gross,net,r:initialRisk!==null&&initialRisk>0?net/initialRisk:null};
}
export function parseJournal(raw:string):Journal {
  if(raw.length>8_000_000)throw new Error('Backup is too large. Maximum supported journal length: 8 million characters.');
  const value:unknown=JSON.parse(raw);if(!value||typeof value!=='object')throw new Error('Not a journal backup.');
  const obj=value as Record<string,unknown>;
  if(obj.version!==1||obj.currency!=='INR'||!Array.isArray(obj.trades)||obj.trades.length>2000)throw new Error('Use a version 1 INR journal backup with at most 2,000 trades.');
  numberIn(obj.startingBalance as number,'Starting balance',0,1e12);
  if(obj.traderName!==undefined)text(obj.traderName,'Trader name',40);
  const seen=new Set<string>();
  const trades=obj.trades.map(item=>{
    if(!item||typeof item!=='object')throw new Error('Invalid trade record.');
    const t=item as Trade;validateTrade(t);if(seen.has(t.id))throw new Error('Backup contains duplicate trade identifiers.');seen.add(t.id);
    // Copy known fields only; imported objects cannot add storage or UI properties.
    return {...Object.fromEntries(Object.keys(newTrade('schema','2026-01-01T09:15')).map(k=>[k,t[k as keyof Trade]])),...(t.importInfo?{importInfo:cleanImportInfo(t.importInfo)}:{})} as Trade;
  });
  return{version:1,currency:'INR',startingBalance:obj.startingBalance as number,trades,...(obj.traderName===undefined?{}:{traderName:(obj.traderName as string).trim()})};
}
export function journalJson(j:Journal):string{const raw=JSON.stringify(j,null,2);parseJournal(raw);return raw;}
export function mergeJournal(current:Journal,incoming:Journal){const ids=new Set(current.trades.map(t=>t.id));const added=incoming.trades.filter(t=>!ids.has(t.id));const result:Journal={...current,startingBalance:current.trades.length?current.startingBalance:incoming.startingBalance,trades:[...current.trades,...added],...(!current.traderName&&incoming.traderName?{traderName:incoming.traderName}:{})};journalJson(result);return{result,added:added.length,skipped:incoming.trades.length-added.length};}
export function filterTrades(trades:Trade[],f:JournalFilter):Trade[]{
  if(f.exitDay)dateValue(f.exitDay);
  if(f.from)dateValue(f.from);if(f.to)dateValue(f.to);if(f.from&&f.to&&f.from>f.to)throw new Error('Filter end date must be on or after its start date.');
  return trades.filter(t=>{const d=t.entryAt.slice(0,10),r=tradeResult(t);return(!f.exitDay||t.status==='closed'&&t.exitAt.slice(0,10)===f.exitDay)&&(!f.from||d>=f.from)&&(!f.to||d<=f.to)&&(!f.symbol||t.symbol.toLowerCase().includes(f.symbol.toLowerCase()))&&(!f.strategy||t.strategy===f.strategy)&&(f.outcome==='all'||f.outcome==='open'&&t.status!=='closed'||f.outcome==='win'&&r.net!==null&&r.net>0||f.outcome==='loss'&&r.net!==null&&r.net<0||f.outcome==='flat'&&r.net===0);});
}
export function weekOf(date:string):string{const ms=dateValue(date),dow=new Date(ms).getUTCDay(),monday=ms-((dow+6)%7)*86400000;return new Date(monday).toISOString().slice(0,10);}
type Closed=Trade&{result:ReturnType<typeof tradeResult>};
export function journalAnalytics(trades:Trade[],startingBalance:number){
  numberIn(startingBalance,'Starting balance',0,1e12);
  const closed:Closed[]=trades.filter(t=>t.status==='closed').map(t=>({...t,result:tradeResult(t)})).sort((a,b)=>journalTime(a.exitAt)-journalTime(b.exitAt)||a.id.localeCompare(b.id));
  const wins=closed.filter(t=>t.result.net!>0),losses=closed.filter(t=>t.result.net!<0),flat=closed.length-wins.length-losses.length;
  const sum=(ts:Closed[])=>roundMoney(ts.reduce((n,t)=>n+t.result.net!,0)),net=sum(closed),winning=sum(wins),losing=-sum(losses);
  const knownR=closed.filter(t=>t.result.r!==null);
  let cumulative=0,peak=0,maxDrawdown=0,currentDrawdown=0,maxDrawdownPercent:number|null=startingBalance>0?0:null,winStreak=0,lossStreak=0,bestWinStreak=0,worstLossStreak=0;
  // Same-time closes are grouped to avoid an arbitrary ID sort inventing a drawdown.
  const grouped=new Map<string,number>();for(const t of closed)grouped.set(t.exitAt,roundMoney((grouped.get(t.exitAt)??0)+t.result.net!));
  const curve=[{at:'Start',net:0,equity:startingBalance,drawdown:0}];
  for(const [at,amount] of grouped){cumulative=roundMoney(cumulative+amount);peak=Math.max(peak,cumulative);currentDrawdown=roundMoney(peak-cumulative);maxDrawdown=Math.max(maxDrawdown,currentDrawdown);if(startingBalance>0&&startingBalance+peak>0)maxDrawdownPercent=Math.max(maxDrawdownPercent??0,currentDrawdown/(startingBalance+peak)*100);curve.push({at,net:cumulative,equity:startingBalance+cumulative,drawdown:currentDrawdown});}
  for(const t of closed){if(t.result.net!>0){winStreak++;lossStreak=0;}else if(t.result.net!<0){lossStreak++;winStreak=0;}else{winStreak=0;lossStreak=0;}bestWinStreak=Math.max(bestWinStreak,winStreak);worstLossStreak=Math.max(worstLossStreak,lossStreak);}
  const group=(key:(t:Closed)=>string)=>{const map=new Map<string,Closed[]>();for(const t of closed){const k=key(t);map.set(k,[...(map.get(k)??[]),t]);}return[...map].map(([label,ts])=>({label,count:ts.length,net:sum(ts),average:sum(ts)/ts.length,winRate:ts.filter(t=>t.result.net!>0).length/ts.length*100,knownR:ts.filter(t=>t.result.r!==null).length,avgR:ts.some(t=>t.result.r!==null)?ts.reduce((n,t)=>n+(t.result.r??0),0)/ts.filter(t=>t.result.r!==null).length:null}));};
  const weekdays=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const mistakes=MISTAKES.map(label=>{const ts=closed.filter(t=>t.mistakes.includes(label));return{label,count:ts.length,net:sum(ts),average:ts.length?sum(ts)/ts.length:null};}).filter(x=>x.count>0).sort((a,b)=>a.net-b.net);
  const strategies=group(t=>t.strategy.trim()||'Unclassified').sort((a,b)=>b.average-a.average);
  return{closed,wins:wins.length,losses:losses.length,flat,count:closed.length,open:trades.filter(t=>t.status==='open').length,planned:trades.filter(t=>t.status==='planned').length,net,gross:roundMoney(closed.reduce((n,t)=>n+t.result.gross!,0)),charges:roundMoney(closed.reduce((n,t)=>n+t.charges,0)),winRate:closed.length?wins.length/closed.length*100:null,
    expectancy:closed.length?net/closed.length:null,averageWin:wins.length?winning/wins.length:null,averageLoss:losses.length?losing/losses.length:null,profitFactor:losing>0?winning/losing:null,avgR:knownR.length?knownR.reduce((n,t)=>n+t.result.r!,0)/knownR.length:null,knownR:knownR.length,
    highestProfit:wins.length?Math.max(...wins.map(t=>t.result.net!)):null,largestLoss:losses.length?Math.min(...losses.map(t=>t.result.net!)):null,maxDrawdown,maxDrawdownPercent,currentDrawdown,curve,bestWinStreak,worstLossStreak,
    strategies,weekdays:group(t=>weekdays[new Date(dateValue(t.entryAt.slice(0,10))).getUTCDay()]),weeks:group(t=>weekOf(t.exitAt.slice(0,10))).sort((a,b)=>b.label.localeCompare(a.label)),days:group(t=>t.exitAt.slice(0,10)).sort((a,b)=>b.label.localeCompare(a.label)),emotions:group(t=>t.emotion),adherence:group(t=>t.adherence),mistakes,
    strongest:strategies.find(s=>s.count>=5&&s.average>0)??null,weakest:[...strategies].reverse().find(s=>s.count>=5&&s.average<0)??null,missingStops:closed.filter(t=>t.stop===null).length,missingReviews:closed.filter(t=>!t.lesson.trim()||!t.basis.trim()).length,
    topWins:[...wins].sort((a,b)=>b.result.net!-a.result.net!).slice(0,5),topLosses:[...losses].sort((a,b)=>a.result.net!-b.result.net!).slice(0,5)};
}
export function journalCsv(j:Journal,trades=j.trades):string{
  const a=journalAnalytics(trades,j.startingBalance);
  return reportCsv('Trade Journal',{version:j.version,currency:j.currency,startingBalance:j.startingBalance,selectedTradeIds:trades.map(t=>t.id)},{'Closed trades':a.count,'Net P&L':a.net,'Win rate (%)':a.winRate??'Not defined','Profit factor':a.profitFactor??'No losing trades / not defined','Average R':a.avgR??'No original stop recorded','Maximum closed-trade drawdown':a.maxDrawdown},
    ['ID','Instrument','Market','Direction','Status','Entry time (Asia/Kolkata)','Exit time (Asia/Kolkata)','Entry fill','Exit fill','Lots','Units per lot','Value multiplier','Quantity','Original stop','Original target','Charges','Gross P&L','Net P&L','Initial price risk','R multiple','Strategy','Entry basis','Entry emotion','Exit emotion','Plan adherence','Exit reason','Why exit / early exit','Problems faced','Lesson','Next-time action','Mistake tags','Execution rating','Broker','Import account label','Entry trade ID','Exit trade ID','Reported fees available','Date-only import'],
    trades.map(t=>{const r=tradeResult(t);return[t.id,t.symbol,t.market,t.side,t.status,t.entryAt,t.status==='closed'?t.exitAt:'',t.entry,t.status==='closed'?(t.exit??''):'',t.lots,t.lotSize,t.multiplier,r.quantity,t.stop??'',t.target??'',t.charges,r.gross??'',r.net??'',r.initialRisk??'',r.r??'',t.strategy,t.basis,t.emotion,t.afterEmotion,t.adherence,t.exitReason,t.exitWhy,t.problems,t.lesson,t.nextTime,t.mistakes.join('; '),t.quality??'',t.importInfo?.broker??'',t.importInfo?.account??'',t.importInfo?.entryRef??'',t.importInfo?.exitRef??'',t.importInfo?String(t.importInfo.chargesKnown):'',t.importInfo?String(t.importInfo.dateOnly):''];}),
    ['Net P&L is direction-adjusted average fill difference × lots × units per lot × value multiplier, less entered total charges. Monetary P&L is rounded to paise. Only fully closed trades enter performance analysis.',
      'Initial R risk uses original stop distance × quantity × multiplier, without charges or slippage. R is undefined when no original stop is recorded. A positive R is not a risk guarantee.',
      'Closed-trade equity and drawdown use exit-time realised net P&L, grouping identical exit timestamps. They exclude open-position mark-to-market, deposits, withdrawals and tax beyond entered charges. Starting balance is a user-entered baseline; filtered curves are synthetic selected-trade paths.',
      'Dates and times are Asia/Kolkata. Weekday patterns use entry day; daily and weekly realised results use exit date and Monday-start weeks. Patterns are descriptive, with sample counts, not predictions or evidence of causal skill.',
      'Mistake tags can overlap; category results must not be summed as if trades were disjoint. JSON backups preserve the complete journal; CSV is an analysis export, not the restore format.']);
}
export function sampleJournal(traderName=''):Journal {
  text(traderName,'Trader name',40);
  const dates:string[]=[];const cursor=new Date(indiaNow().slice(0,10)+'T00:00:00Z');while(dates.length<18){cursor.setUTCDate(cursor.getUTCDate()-1);if(cursor.getUTCDay()!==0&&cursor.getUTCDay()!==6)dates.unshift(cursor.toISOString().slice(0,10));}
  const profits=[300,-120,180,260,-80,0,420,-200,160,280,-90,210,120,-140,360,90,-60,250];
  const trades=profits.map((profit,i)=>{
    const date=dates[i];
    return{...newTrade(`sample-${i}`,`${date}T09:30`),symbol:i%2?'SAMPLE B':'SAMPLE A',entry:100,exit:100+profit/10,exitAt:`${date}T14:00`,lots:10,charges:10,stop:90,target:150,strategy:i%3?'Pullback':'Breakout',basis:'Example only: a planned level with a defined invalidation.',emotion:i%4?'Focused':'FOMO',afterEmotion:'Calm',adherence:i%4?'Followed plan':'Broke plan',exitReason:profit<0?'Stop triggered':'Manual / other',exitWhy:'Sample exit review.',lesson:i%5===0?'':['Wait for the planned setup.','A smaller position helped me follow my stop.','A winning trade still needs a clear entry reason.'][i%3],nextTime:['Review the checklist before entry.','Take a short break after a loss.','Confirm my stop and position size before entry.'][i%3],mistakes:i%4?[]:['FOMO entry'],quality:i%4?4:2} as Trade;
  });return{version:1,currency:'INR',startingBalance:100000,trades,...(traderName.trim()?{traderName:traderName.trim()}:{})};
}
