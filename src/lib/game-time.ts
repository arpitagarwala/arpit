// Screen time is independent of puzzle scores: unfinished games count too.
export const TIME_KEY='logic-screen-time-v1';
export const TIME_EVENT='logic-screen-time-change';
export const BREAK_MS=5*60_000;
export type TimeDay={total:number;games:Record<string,number>};
export type GameTime={version:1;days:Record<string,TimeDay>;sessionMs:number;lastActive:number;snoozeUntil:number;settings:{sessionMinutes:number;dailyMinutes:number};cursor:{owner:string;at:number}|null};
export function freshTime():GameTime{return{version:1,days:{},sessionMs:0,lastActive:0,snoozeUntil:0,settings:{sessionMinutes:20,dailyMinutes:60},cursor:null};}
export function localDay(at:number){const d=new Date(at);return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
export function readTime(raw:string|null):GameTime{
 if(!raw)return freshTime();
 const v=JSON.parse(raw) as GameTime;
 const num=(n:unknown,max=Number.MAX_SAFE_INTEGER)=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=max;
 if(v?.version!==1||!num(v.sessionMs)||!num(v.lastActive)||!num(v.snoozeUntil)||!v.settings||!num(v.settings.sessionMinutes,180)||v.settings.sessionMinutes<1||!num(v.settings.dailyMinutes,360)||v.settings.dailyMinutes<1||!v.days||Array.isArray(v.days)||typeof v.days!=='object'||Object.keys(v.days).length>100)throw new Error('Screen-time history could not be read. Existing data has been kept.');
 for(const [day,entry]of Object.entries(v.days)){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||!entry||!num(entry.total,90_000_000)||!entry.games||typeof entry.games!=='object'||Array.isArray(entry.games)||Object.keys(entry.games).length>100)throw new Error('Invalid screen-time history. Existing data has been kept.');
  let sum=0;for(const [slug,ms]of Object.entries(entry.games)){if(!/^[a-z0-9-]{1,50}$/.test(slug)||!num(ms,90_000_000))throw new Error('Invalid game time.');sum+=ms;}if(Math.abs(sum-entry.total)>1)throw new Error('Invalid screen-time totals.');
 }
 if(v.cursor&&(!num(v.cursor.at)||typeof v.cursor.owner!=='string'||v.cursor.owner.length>80))throw new Error('Invalid screen-time cursor.');
 return v;
}
export function recordTime(state:GameTime,owner:string,slug:string,now:number):GameTime{
 const next:GameTime={...state,days:{...state.days},cursor:{owner,at:now}};
 if(now-state.lastActive>=BREAK_MS){next.sessionMs=0;}
 // A suspended timer or a different tab establishes a fresh baseline. Never
 // charge an unseen gap, and never add two tabs' intervals to the same second.
 const elapsed=state.cursor?.owner===owner?now-state.cursor.at:0;
 if(elapsed>0&&elapsed<=5000){
  let start=now-elapsed;
  while(start<now){const d=new Date(start);d.setHours(24,0,0,0);const end=Math.min(now,d.getTime()),day=localDay(start),ms=end-start,old=next.days[day]??{total:0,games:{}};
   next.days[day]={total:old.total+ms,games:{...old.games,[slug]:(old.games[slug]??0)+ms}};start=end;
  }
  next.sessionMs+=elapsed;
 }
 next.lastActive=now;
 const keys=Object.keys(next.days).sort();for(const day of keys.slice(0,Math.max(0,keys.length-90)))delete next.days[day];
 return next;
}
export function reminderDue(state:GameTime,now:number):'daily'|'session'|null{
 if(now<state.snoozeUntil)return null;
 if((state.days[localDay(now)]?.total??0)>=state.settings.dailyMinutes*60_000)return'daily';
 return state.sessionMs>=state.settings.sessionMinutes*60_000?'session':null;
}
export function weekDays(now:number){return Array.from({length:7},(_,i)=>{const d=new Date(now);d.setDate(d.getDate()-6+i);return localDay(d.getTime());});}
export function timeLabel(ms:number){const seconds=Math.floor(ms/1000);return seconds<60?`${seconds}s`:`${Math.floor(seconds/60)}m${seconds%60?` ${seconds%60}s`:''}`;}
