import {dayKey,activeTaskSnapshot,type StudyState,type FocusSegment} from './study.ts';
import {type TaskSnapshot} from './planner-schema.ts';
export function focusSegments(study:StudyState,now:number):FocusSegment[]{
 const segments=[...(study.focusLog??[])];
 if(study.mode==='focus'&&study.deadline!==null&&study.startedAt!=null&&Math.min(now,study.deadline)>study.startedAt)segments.push({sessionId:study.sessionId,start:study.startedAt,end:Math.min(now,study.deadline),task:study.activeTask,...activeTaskSnapshot(study)});
 return [...new Map(segments.map(s=>[s.sessionId+':'+s.start,s])).values()];
}
export function studyAnalysis(study:StudyState,now:number,days=7){
 const dates=Array.from({length:days},(_,i)=>{const d=new Date(now);d.setDate(d.getDate()-days+1+i);return dayKey(d.getTime());});
 const daily:Record<string,number>=Object.fromEntries(dates.map(d=>[d,0])),tasks:Record<string,number>=Object.create(null);
 const sessions=new Set<string>(),taskDetails:Record<string,{title:string;path:string[];minutes:number}>=Object.create(null),categoryEntries:{minutes:number;path:string[];ids:string[]}[]=[];
 function attribution(task:string,minutes:number,snapshot:TaskSnapshot){const path=snapshot.categoryPath??[],key=snapshot.taskId??'legacy:'+task;const old=taskDetails[key];taskDetails[key]={title:task||'Untitled focus',path,minutes:(old?.minutes??0)+minutes};categoryEntries.push({minutes,path,ids:snapshot.categoryIds??[]});}
 for(const seg of focusSegments(study,now)){
  let start=seg.start;
  while(start<seg.end){const date=dayKey(start),boundary=new Date(start);boundary.setHours(24,0,0,0);const end=Math.min(seg.end,boundary.getTime());if(date in daily){const min=(end-start)/60000;daily[date]+=min;tasks[seg.task||'Untitled focus']=(tasks[seg.task||'Untitled focus']??0)+min;attribution(seg.task,min,seg);sessions.add(seg.sessionId);}start=end;}
 }
 // Earlier versions stored only completed minutes on their completion date.
 for(const session of study.history)if(!session.tracked&&session.date in daily){daily[session.date]+=session.minutes;tasks[session.task||'Untitled focus']=(tasks[session.task||'Untitled focus']??0)+session.minutes;attribution(session.task,session.minutes,session);sessions.add(session.id);}
 const total=Object.values(daily).reduce((a,b)=>a+b,0),today=daily[dayKey(now)]??0,completed=study.history.filter(s=>s.date in daily).length;
 return{dates,daily,tasks,taskDetails,categoryEntries,total,today,completed,sessions:sessions.size,activeDays:Object.values(daily).filter(m=>m>0).length,goalDays:Object.values(daily).filter(m=>m>=study.goal).length};
}
export function categoryAnalysis(entries:{minutes:number;path:string[];ids:string[]}[],depth:number){const groups=new Map<string,{key:string;label:string;minutes:number}>();for(const e of entries){const names=e.path.slice(0,Math.max(1,depth)),key=e.ids.length?JSON.stringify(e.ids.slice(0,depth)):names.length?JSON.stringify(names):'uncategorized',label=names.length?names.join(' / '):'Uncategorised / earlier records',old=groups.get(key);groups.set(key,{key,label,minutes:(old?.minutes??0)+e.minutes});}return [...groups.values()].sort((a,b)=>b.minutes-a.minutes);}
export function focusTime(minutes:number){const m=Math.floor(minutes);return minutes>0&&m===0?'<1m':m>=60?`${Math.floor(m/60)}h ${m%60}m`:`${m}m`;}
