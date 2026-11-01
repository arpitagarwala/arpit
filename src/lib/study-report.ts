import {dayKey,type StudyState} from './study.ts';
import {focusSegments,focusTime} from './study-analytics.ts';
import {validDay,categoryBranch,type TaskSnapshot} from './planner-schema.ts';
export type ReportKind='day'|'week'|'month';
export type ReportRange={kind:ReportKind;anchor:string;start:number;end:number;dates:string[]};
export type ReportEntry={sessionId:string;task:string;taskId?:string;path:string[];ids:string[];date:string;minutes:number;start?:number;originStart?:number;legacy:boolean};
export function reportRange(kind:ReportKind,anchor:string):ReportRange{
 if(!validDay(anchor))throw new Error('Choose a valid report date.');
 const start=new Date(anchor+'T00:00:00');
 if(kind==='week')start.setDate(start.getDate()-(start.getDay()+6)%7);
 if(kind==='month')start.setDate(1);
 const end=new Date(start);if(kind==='month')end.setMonth(end.getMonth()+1);else end.setDate(end.getDate()+(kind==='week'?7:1));
 const dates:string[]=[];for(const cursor=new Date(start);cursor<end;cursor.setDate(cursor.getDate()+1))dates.push(dayKey(cursor.getTime()));
 return{kind,anchor,start:start.getTime(),end:end.getTime(),dates};
}
export function shiftReport(kind:ReportKind,anchor:string,direction:number){const d=new Date(anchor+'T12:00:00');if(kind==='month'){d.setDate(1);d.setMonth(d.getMonth()+direction);}else d.setDate(d.getDate()+direction*(kind==='week'?7:1));return dayKey(d.getTime());}
export function reportLabel(range:ReportRange){const a=new Date(range.start),b=new Date(range.end);b.setDate(b.getDate()-1);return range.kind==='day'?a.toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long',year:'numeric'}):range.kind==='month'?a.toLocaleDateString(undefined,{month:'long',year:'numeric'}):`${a.toLocaleDateString(undefined,{month:'short',day:'numeric'})} – ${b.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})}`;}
function categoryMatch(snapshot:TaskSnapshot,category:string){return !category||category==='uncategorized'?!category||!(snapshot.categoryPath?.length):snapshot.categoryIds?.includes(category)===true;}
export function reportWindow(study:StudyState,range:ReportRange,now:number,category='',cutoff=Math.min(now,range.end)){
 const end=Math.min(range.end,cutoff,now),daily:Record<string,number>=Object.fromEntries(range.dates.map(d=>[d,0])),hourly=Array<number>(24).fill(0),entries:ReportEntry[]=[];
 let unknownHour=0,partialLegacy=false;
 function add(entry:ReportEntry){entries.push(entry);daily[entry.date]=(daily[entry.date]??0)+entry.minutes;}
 for(const seg of focusSegments(study,now)){
  if(!categoryMatch(seg,category))continue;
  let cursor=Math.max(seg.start,range.start);const limit=Math.min(seg.end,end);
  while(cursor<limit){const date=new Date(cursor),next=new Date(cursor);next.setHours(date.getHours()+1,0,0,0);const until=Math.min(limit,next.getTime()>cursor?next.getTime():cursor+3600000),minutes=(until-cursor)/60000;hourly[date.getHours()]+=minutes;add({sessionId:seg.sessionId,task:seg.task||'Untitled focus',taskId:seg.taskId,path:seg.categoryPath??[],ids:seg.categoryIds??[],date:dayKey(cursor),minutes,start:cursor,originStart:seg.start,legacy:false});cursor=until;}
 }
 for(const h of study.history)if(!h.tracked&&h.date in daily&&h.date<=dayKey(Math.max(0,end-1))&&end>range.start&&categoryMatch(h,category)){
  unknownHour+=h.minutes;if(end<range.end&&h.date===dayKey(end))partialLegacy=true;
  add({sessionId:h.id,task:h.task||'Untitled focus',taskId:h.taskId,path:h.categoryPath??[],ids:h.categoryIds??[],date:h.date,minutes:h.minutes,legacy:true});
 }
 const total=Object.values(daily).reduce((n,m)=>n+m,0),today=dayKey(now),elapsedDates=range.dates.filter(date=>date<=today&&new Date(date+'T00:00:00').getTime()<end),observed=new Map<string,{id:string;task:string;taskId?:string;path:string[];minutes:number;start?:number;date:string;status:string}>(),completedIds=new Set(study.history.map(h=>h.id));
 for(const e of entries){const old=observed.get(e.sessionId),start=e.start===undefined?old?.start:Math.min(old?.start??Infinity,e.start);observed.set(e.sessionId,{id:e.sessionId,task:e.task,taskId:e.taskId,path:e.path,minutes:(old?.minutes??0)+e.minutes,start,date:old?.date??e.date,status:completedIds.has(e.sessionId)?'Completed':study.sessionId===e.sessionId?study.deadline===null?'Paused':'In progress':'Ended early'});}
 const completed=study.history.filter(h=>range.dates.includes(h.date)&&h.date<=dayKey(Math.max(0,end-1))&&end>range.start&&categoryMatch(h,category)).length;
 const branch=category&&category!=='uncategorized'?categoryBranch(study.categories??[],category):null,scope=study.tasks.filter(t=>!category||category==='uncategorized'?!category||!t.categoryId:branch?.has(t.categoryId??'')),planned=scope.filter(t=>!t.archived&&range.dates.includes(t.plannedDate??'')),planByDay:Record<string,number>=Object.fromEntries(range.dates.map(d=>[d,0]));
 for(const task of planned)planByDay[task.plannedDate!]+=task.estimate??0;
 const taskCompletions=scope.filter(t=>t.done&&t.completedAt&&t.completedAt>=range.start&&t.completedAt<end).length;
 const weekdays=Array.from({length:7},(_,i)=>({index:i,minutes:0,days:0}));for(const date of elapsedDates){const index=(new Date(date+'T12:00:00').getDay()+6)%7;weekdays[index].days++;weekdays[index].minutes+=daily[date]??0;}
 return{range,entries,daily,hourly,total,unknownHour,partialLegacy,elapsedDates,completed,observed:[...observed.values()].sort((a,b)=>(b.start??new Date(b.date+'T00:00:00').getTime())-(a.start??new Date(a.date+'T00:00:00').getTime())),activeDays:elapsedDates.filter(d=>daily[d]>0).length,goalDays:elapsedDates.filter(d=>daily[d]>=study.goal).length,planned,planByDay,estimated:planned.reduce((n,t)=>n+(t.estimate??0),0),openEstimate:planned.filter(t=>!t.done).reduce((n,t)=>n+(t.estimate??0),0),unestimated:planned.filter(t=>!t.done&&!t.estimate).length,taskCompletions,weekdays,upcoming:now<range.start};
}
export function buildStudyReport(study:StudyState,kind:ReportKind,anchor:string,now:number,category=''){
 const range=reportRange(kind,anchor),current=reportWindow(study,range,now,category),previousRange=reportRange(kind,shiftReport(kind,anchor,-1)),partial=now>=range.start&&now<range.end;
 let previousCutoff=previousRange.end;
 if(partial){const index=range.dates.indexOf(dayKey(now));if(index<previousRange.dates.length){const date=new Date(previousRange.dates[index]+'T00:00:00'),time=new Date(now);date.setHours(time.getHours(),time.getMinutes(),time.getSeconds(),time.getMilliseconds());previousCutoff=date.getTime();}}
 const previous=reportWindow(study,previousRange,now,category,previousCutoff),change=!current.upcoming&&!previous.partialLegacy&&previous.total>0?(current.total-previous.total)/previous.total*100:null;
 const insights:{title:string;body:string}[]=[];
 if(current.unestimated)insights.push({title:'Give your plan a rough size',body:`${current.unestimated} unfinished scheduled ${current.unestimated===1?'task has':'tasks have'} no estimate. Add a rough duration before filling more of the week.`});
 const loaded=current.range.dates.map(date=>({date,minutes:current.planned.filter(t=>t.plannedDate===date&&!t.done).reduce((n,t)=>n+(t.estimate??0),0)})).filter(d=>d.minutes>study.goal);
 if(loaded.length){const day=loaded.sort((a,b)=>b.minutes-a.minutes)[0];insights.push({title:'Leave room in the plan',body:`Unfinished tasks on ${day.date} carry ${focusTime(day.minutes)} of estimates against your ${focusTime(study.goal)} daily goal. Move a task or review its estimate.`});}
 const categories=new Map<string,{label:string;minutes:number}>();for(const e of current.entries){if(!e.path.length)continue;const key=e.ids[0]??e.path[0],old=categories.get(key);categories.set(key,{label:e.path[0],minutes:(old?.minutes??0)+e.minutes});}
 const top=[...categories.values()].sort((a,b)=>b.minutes-a.minutes)[0];
 if(current.total>=60&&top&&categories.size>=2&&top.minutes/current.total>=.7)insights.push({title:'Check the balance across subjects',body:`${top.label} received ${Math.round(top.minutes/current.total*100)}% of recorded focus time. If another subject needs attention, reserve its next slot in the planner.`});
 if(current.observed.length>=3&&current.total-current.unknownHour>=30){const hour=current.hourly.indexOf(Math.max(...current.hourly));insights.push({title:'A useful time window to revisit',body:`The most timestamped focus time fell in the ${String(hour).padStart(2,'0')}:00–${String(hour+1).padStart(2,'0')}:00 hour. Try protecting that slot; this describes your timer use, not your learning performance.`});}
 if(current.total>0&&current.elapsedDates.length>1&&(current.activeDays>=3||current.total>=60))insights.push({title:'Build a repeatable rhythm',body:`You logged focus on ${current.activeDays} of ${current.elapsedDates.length} elapsed days. ${current.goalDays} met your current daily goal. A smaller regular block may be easier to plan than one very full day.`});
 if(kind!=='day'&&current.total>0&&current.activeDays<3&&current.total<60)insights.push({title:'A baseline to build on',body:`This report currently contains ${current.activeDays} active ${current.activeDays===1?'day':'days'}. Log more days before drawing conclusions about your weekly rhythm.`});
 if(!current.total)insights.push({title:current.upcoming?'A report ready for your next study period':'Start with one intentional session',body:current.upcoming?'This period has not started. Use the workload chart to spread your planned tasks.':'Select a categorised task and run the focus timer. Your first session will populate this report; no sample activity is added.'});
 if(!insights.length)insights.push({title:'Make the next step specific',body:'Compare your estimates with the time you logged, then choose one small task for your next focus session.'});
 return{...current,previous,partial,change,insights:insights.slice(0,4)};
}
export type StudyReport=ReturnType<typeof buildStudyReport>;
export function reportCsv(report:StudyReport){
 const depth=Math.max(0,...report.entries.map(e=>e.path.length)),rows:(string|number)[][]=[['Date','Task','Task ID',...Array.from({length:depth},(_,i)=>`Category level ${i+1}`),'Focus minutes']],grouped=new Map<string,{entry:ReportEntry;minutes:number}>();
 for(const e of report.entries){const key=JSON.stringify([e.date,e.taskId??e.task,e.path]),old=grouped.get(key);grouped.set(key,{entry:e,minutes:(old?.minutes??0)+e.minutes});}
 for(const {entry:e,minutes}of grouped.values())rows.push([e.date,e.task,e.taskId??'',...Array.from({length:depth},(_,i)=>e.path[i]??''),Number(minutes.toFixed(3))]);
 const cell=(value:string|number)=>{let text=String(value);if(typeof value==='string'&&/^[\s]*[=+@-]/.test(text))text="'"+text;return'"'+text.replace(/"/g,'""')+'"';};
 return'\uFEFF'+rows.map(row=>row.map(cell).join(',')).join('\r\n');
}
