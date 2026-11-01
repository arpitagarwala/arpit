import {dayKey,resetStudy,type StudyState,type Task} from './study.ts';
import {categoryTrail,categoryBranch,restoreCategories,restoreTask,MAX_TASKS,MAX_CATEGORIES,type Category,validDay} from './planner-schema.ts';
import {focusSegments} from './study-analytics.ts';
export type PlannerView='today'|'week'|'inbox'|'all'|'done'|'archived';
export function weekDates(now:number,offset=0){const d=new Date(now);d.setDate(d.getDate()+offset*7-(d.getDay()+6)%7);return Array.from({length:7},(_,i)=>{const date=new Date(d);date.setDate(d.getDate()+i);return dayKey(date.getTime());});}
export function taskLocked(study:StudyState,id:string){return Boolean((study.sessionId||study.deadline!==null)&&(study.sessionTask?.taskId===id||study.activeTaskId===id||!study.activeTaskId&&study.tasks.filter(t=>t.title===study.activeTask).length===1&&study.tasks.find(t=>t.title===study.activeTask)?.id===id));}
export function selectStudyTask(study:StudyState,id:string):StudyState{
 const task=study.tasks.find(t=>t.id===id);if(id&&(!task||task.archived||task.done))throw new Error('Choose an unfinished, unarchived task.');
 if(study.sessionId||study.deadline!==null){if(taskLocked(study,id))return study;throw new Error('End the current session before switching to another task.');}
 return{...study,activeTaskId:task?.id??'',activeTask:task?.title??''};
}
export function prepareTaskFocus(study:StudyState,id:string,now:number):StudyState{const selected=selectStudyTask(study,id);return study.sessionId||study.deadline!==null?selected:resetStudy(selected,'focus',now);}
export function saveTask(study:StudyState,input:Task):StudyState{
 const title=input.title.trim();if(!title||title.length>160)throw new Error('Give the task a title of up to 160 characters.');
 if(input.categoryId&&!(study.categories??[]).some(c=>c.id===input.categoryId))throw new Error('Choose an existing category.');
 for(const date of [input.plannedDate,input.dueDate])if(date&&!validDay(date))throw new Error('Choose a valid calendar date.');
 const old=study.tasks.find(t=>t.id===input.id);if(!old&&study.tasks.length>=MAX_TASKS)throw new Error(`This browser planner holds up to ${MAX_TASKS} tasks.`);
 if(old&&taskLocked(study,input.id)&&(old.title!==title||(old.categoryId??'')!==(input.categoryId??'')))throw new Error('End the current focus session before changing its task title or category.');
 const next=restoreTask({...input,title});return{...study,tasks:old?study.tasks.map(t=>t.id===input.id?next:t):[...study.tasks,next],...((!study.sessionId&&study.deadline===null)&&(study.activeTaskId===input.id||!study.activeTaskId&&study.activeTask===old?.title)?{activeTask:title,activeTaskId:input.id}:{})};
}
export function saveCategory(study:StudyState,input:Category):StudyState{
 const name=input.name.trim(),categories=study.categories??[];if(!name||name.length>80)throw new Error('Use a category name of 1–80 characters.');
 if(categories.some(c=>c.id!==input.id&&c.parentId===input.parentId&&c.name.toLocaleLowerCase()===name.toLocaleLowerCase()))throw new Error('A category with that name already exists under this parent.');
 const exists=categories.some(c=>c.id===input.id);if(!exists&&categories.length>=MAX_CATEGORIES)throw new Error(`This planner holds up to ${MAX_CATEGORIES} categories.`);
 const next=exists?categories.map(c=>c.id===input.id?{...input,name}:c):[...categories,{...input,name}];return{...study,categories:restoreCategories(next)};
}
export function archiveTasks(study:StudyState,ids:string[],archive:boolean):StudyState{
 if(archive&&ids.some(id=>taskLocked(study,id)))throw new Error('End the active focus session before archiving its task.');
 const selected=new Set(ids),clearing=archive&&!!study.activeTaskId&&selected.has(study.activeTaskId);
 return{...study,tasks:study.tasks.map(t=>selected.has(t.id)?{...t,archived:archive}:t),...(clearing?{activeTask:'',activeTaskId:''}:{})};
}
export function scheduleTasks(study:StudyState,ids:string[],date:string):StudyState{if(date&&!validDay(date))throw new Error('Choose a valid planned date.');return{...study,tasks:study.tasks.map(t=>ids.includes(t.id)?{...t,plannedDate:date}:t)};}
export function completeTask(study:StudyState,id:string,now:number):StudyState{const task=study.tasks.find(t=>t.id===id),clear=task&&!task.done&&study.activeTaskId===id&&!study.sessionId&&study.deadline===null;return{...study,tasks:study.tasks.map(t=>t.id===id?{...t,done:!t.done,completedAt:t.done?0:now}:t),...(clear?{activeTask:'',activeTaskId:''}:{})};}
export function moveTask(study:StudyState,id:string,target:string):StudyState{const tasks=[...study.tasks],a=tasks.findIndex(t=>t.id===id),b=tasks.findIndex(t=>t.id===target);if(a<0||b<0)return study;[tasks[a],tasks[b]]=[tasks[b],tasks[a]];return{...study,tasks:tasks.map((t,i)=>({...t,order:i}))};}
export function removeCategory(study:StudyState,id:string):StudyState{if((study.categories??[]).some(c=>c.parentId===id)||study.tasks.some(t=>t.categoryId===id))throw new Error('Move this category’s tasks and children first. Archived tasks also keep their category.');return{...study,categories:(study.categories??[]).filter(c=>c.id!==id)};}
export function plannerTasks(study:StudyState,{view,category,query,today,week,day='',sort='manual'}:{view:PlannerView;category:string;query:string;today:string;week:string[];day?:string;sort?:string}){
 const cats=study.categories??[],branch=category&&category!=='uncategorized'?categoryBranch(cats,category):null,term=query.toLocaleLowerCase().trim();
 return study.tasks.filter(t=>{
  if(view==='archived'?!t.archived:!!t.archived)return false;
  if(view==='done'?!t.done:view!=='all'&&view!=='archived'&&t.done)return false;
  if(category==='uncategorized'&&t.categoryId)return false;if(branch&&!branch.has(t.categoryId??''))return false;
  if(view==='today'&&t.plannedDate!==today&&!(t.dueDate&&t.dueDate<=today))return false;
  if(view==='inbox'&&t.plannedDate)return false;
  if(view==='week'&&!(week.includes(t.plannedDate??'')||week.includes(t.dueDate??'')||week.includes(today)&&t.dueDate&&t.dueDate<today))return false;
  if(view==='week'&&day&&t.plannedDate!==day&&t.dueDate!==day)return false;
  return !term||[t.title,t.notes,...categoryTrail(cats,t.categoryId).map(c=>c.name),...(t.checklist??[]).map(c=>c.text)].join(' ').toLocaleLowerCase().includes(term);
 }).sort((a,b)=>sort==='priority'?({high:0,normal:1,low:2}[a.priority??'normal']-{high:0,normal:1,low:2}[b.priority??'normal']||(a.order??0)-(b.order??0)):sort==='due'?(a.dueDate||'9999').localeCompare(b.dueDate||'9999'):(a.order??0)-(b.order??0));
}
export function taskFocusMinutes(study:StudyState,id:string,now:number){const task=study.tasks.find(t=>t.id===id);if(!task)return 0;const unique=study.tasks.filter(t=>t.title===task.title).length===1;const match=(s:{task:string;taskId?:string})=>s.taskId?s.taskId===id:unique&&s.task===task.title;return focusSegments(study,now).filter(match).reduce((n,s)=>n+(s.end-s.start)/60000,0)+study.history.filter(s=>!s.tracked&&match(s)).reduce((n,s)=>n+s.minutes,0);}
