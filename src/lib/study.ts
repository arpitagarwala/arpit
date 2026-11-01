import {restoreTask,restoreCategories,categoryTrail,snapshotFields,MAX_TASKS,type Task,type Category,type TaskSnapshot} from './planner-schema.ts';
export type {Task} from './planner-schema.ts';
export type Mode = 'focus' | 'short' | 'long';
export type Session = { id: string; date: string; minutes: number; task: string; tracked?:boolean }&TaskSnapshot;
export type FocusSegment={sessionId:string;start:number;end:number;task:string}&TaskSnapshot;
export type StudyState = {
  focus: number; short: number; long: number; goal: number; xp: number; legacyMinutes: number; legacySessions: number;
  tasks: Task[]; history: Session[]; mode: Mode; remaining: number; deadline: number | null;
  duration: number; activeTask: string; sessionId: string; cycle: number;
  startedAt?:number|null; focusLog?:FocusSegment[];
  categories?:Category[];activeTaskId?:string;sessionTask?:TaskSnapshot;
};
export const initialStudy: StudyState = { focus: 25, short: 5, long: 15, goal: 100, xp: 0, legacyMinutes: 0, legacySessions: 0, tasks: [], history: [], mode: 'focus', remaining: 1500, deadline: null, duration: 25, activeTask: '', sessionId: '', cycle: 0 };
export function bounded(value: unknown, fallback: number, min = 1, max = 180): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, Math.round(value))) : fallback;
}
export function dayKey(time: number): string {
  const d = new Date(time);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
export function remaining(state: StudyState, now: number): number {
  return state.deadline === null ? state.remaining : Math.min(state.remaining,Math.max(0, Math.ceil((state.deadline - now) / 1000)));
}
export function finish(state: StudyState, now: number): StudyState {
  if (state.deadline === null || remaining(state, now) > 0) return state;
  const isFocus = state.mode === 'focus';
  const duplicate = state.history.some(s => s.id === state.sessionId);
  const cycle = state.cycle + (isFocus && !duplicate ? 1 : 0);
  const mode: Mode = isFocus ? (cycle % 4 === 0 ? 'long' : 'short') : 'focus';
  const duration = mode === 'focus' ? state.focus : mode === 'long' ? state.long : state.short;
  const logged=closeSegment(state,state.deadline);
  return { ...logged, cycle, mode, duration, remaining: duration * 60, deadline: null, sessionId: '', startedAt:null,
    xp: state.xp + (isFocus && !duplicate ? state.duration * 4 : 0),
    history: isFocus && !duplicate ? [...state.history, { id: state.sessionId, date: dayKey(state.deadline), minutes: state.duration, task: state.activeTask, ...snapshotFields(state.sessionTask??{}), ...(logged.focusLog?.some(s=>s.sessionId===state.sessionId)?{tracked:true}:{}) }] : state.history,sessionTask:undefined,...(isFocus&&state.tasks.some(t=>t.id===state.activeTaskId&&t.done)?{activeTask:'',activeTaskId:''}:{}) };
}
export function activeTaskSnapshot(state:StudyState):TaskSnapshot{
 if(state.sessionId&&state.sessionTask)return state.sessionTask;
 const matches=state.tasks.filter(t=>t.title===state.activeTask),task=state.tasks.find(t=>t.id===state.activeTaskId)||(matches.length===1?matches[0]:undefined);
 const trail=categoryTrail(state.categories??[],task?.categoryId);
 return{...(task?{taskId:task.id}:{}),categoryPath:trail.map(c=>c.name),categoryIds:trail.map(c=>c.id)};
}
export function closeSegment(state:StudyState,now:number):StudyState{
 if(state.mode!=='focus'||state.startedAt==null||state.deadline===null)return{...state,startedAt:null};
 const end=Math.min(now,state.deadline),start=state.startedAt;
 if(end<=start)return{...state,startedAt:null};
 const log=state.focusLog??[];
 return{...state,startedAt:null,focusLog:log.some(s=>s.sessionId===state.sessionId&&s.start===start)?log:[...log,{sessionId:state.sessionId,start,end,task:state.activeTask,...activeTaskSnapshot(state)}]};
}
export function toggleStudy(state:StudyState,now:number,id:string):StudyState{
 const done=finish(state,now);if(done!==state)return done;
 return state.deadline!==null?{...closeSegment(state,now),remaining:remaining(state,now),deadline:null}:{...state,deadline:now+state.remaining*1000,sessionId:state.sessionId||id,sessionTask:activeTaskSnapshot(state),startedAt:state.mode==='focus'?now:null};
}
export function resetStudy(state:StudyState,mode:Mode,now:number):StudyState{
 const current=finish(state,now),duration=mode==='focus'?current.focus:mode==='short'?current.short:current.long;
 return{...closeSegment(current,now),mode,duration,remaining:duration*60,deadline:null,sessionId:'',startedAt:null,sessionTask:undefined};
}
export function restoreStudy(raw: unknown): StudyState {
  if (!raw || typeof raw !== 'object') return { ...initialStudy };
  const s = raw as Partial<StudyState>;
  const mode = s.mode === 'short' || s.mode === 'long' ? s.mode : 'focus';
  const duration = bounded(s.duration, 25);
  return { ...initialStudy, focus: bounded(s.focus, 25), short: bounded(s.short, 5, 1, 60), long: bounded(s.long, 15, 1, 60), goal: bounded(s.goal, 100, 10, 600),
    xp: bounded(s.xp, 0, 0, 1e9), legacyMinutes: bounded(s.legacyMinutes, 0, 0, 1e9), legacySessions: bounded(s.legacySessions, 0, 0, 1e9),
    cycle: bounded(s.cycle, 0, 0, 1e9), mode, duration, remaining: bounded(s.remaining, duration * 60, 0, duration * 60),
    deadline: typeof s.deadline === 'number' && Number.isFinite(s.deadline) && typeof s.sessionId === 'string' && s.sessionId ? s.deadline : null,
    sessionId: typeof s.sessionId === 'string' ? s.sessionId : '', activeTask: typeof s.activeTask === 'string' ? s.activeTask.slice(0, 160) : '',
    tasks: Array.isArray(s.tasks) ? s.tasks.filter(t => t && typeof t.id === 'string' && typeof t.title === 'string').slice(0,MAX_TASKS).map(restoreTask) : [],
    categories:restoreCategories(s.categories),activeTaskId:typeof s.activeTaskId==='string'?s.activeTaskId:(Array.isArray(s.tasks)&&s.tasks.filter(t=>t&&typeof t.id==='string'&&t.title===s.activeTask).length===1?s.tasks.find(t=>t&&t.title===s.activeTask)?.id:''),sessionTask:s.sessionTask?snapshotFields(s.sessionTask):undefined,
    startedAt:typeof s.startedAt==='number'&&Number.isFinite(s.startedAt)&&s.startedAt>=0&&s.deadline!=null&&s.startedAt<=s.deadline?s.startedAt:null,
    focusLog:Array.isArray(s.focusLog)?s.focusLog.filter(v=>v&&typeof v.sessionId==='string'&&typeof v.task==='string'&&Number.isFinite(v.start)&&Number.isFinite(v.end)&&v.start>=0&&v.end>v.start&&v.end-v.start<=180*60000).map(v=>({...v,task:v.task.slice(0,160),...snapshotFields(v)})):[],
    history: Array.isArray(s.history) ? [...new Map(s.history.filter(h => h && typeof h.id === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(h.date) && Number.isFinite(h.minutes) && h.minutes > 0 && h.minutes <= 180).map(h => [h.id, { ...h, task: typeof h.task === 'string' ? h.task.slice(0, 160) : '',...snapshotFields(h) }])).values()] : [] };
}
