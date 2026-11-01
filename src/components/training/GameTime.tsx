'use client';
import {useEffect,useRef,useState} from 'react';
import {usePathname} from 'next/navigation';
import Link from 'next/link';
import {GAMES} from '@/data/games';
import {localDay,recordTime,reminderDue,timeLabel,weekDays} from '@/lib/game-time';
import {updateGameTime,useGameTime} from '@/lib/game-time-store';
import {useTrainingClock} from '@/lib/training-store';
import {useSiteFeature} from '@/components/SiteFeatures';
import s from './game-time.module.css';

export function GameTimeTracker(){
 const path=usePathname(),game=GAMES.find(g=>g.href===path),enabled=useSiteFeature('games.wellbeing'),progress=useSiteFeature('games.progress');
 const now=useTrainingClock();const {data,error}=useGameTime();const [reason,setReason]=useState<'daily'|'session'|null>(null),[pending,setPending]=useState(false),[saveError,setSaveError]=useState('');
 const paused=useRef(false),timed=useRef(false),dialog=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const status=(e:Event)=>{timed.current=Boolean((e as CustomEvent).detail);};window.addEventListener('logic-timed-round',status);return()=>window.removeEventListener('logic-timed-round',status);},[]);
 useEffect(()=>{
  if(!game||!enabled)return;
  const owner=crypto.randomUUID(),slug=game.href.split('/').pop()!;let disposed=false,busy=false;
  const tick=async()=>{
   if(busy||disposed)return;busy=true;
   try{await updateGameTime(state=>{
    if(disposed)return state;
    if(document.visibilityState!=='visible'||!document.hasFocus()||paused.current)return state.cursor?.owner===owner?{...state,cursor:null}:state;
    const next=recordTime(state,owner,slug,Date.now()),due=reminderDue(next,Date.now());
    if(due){if(timed.current){setPending(true);}else{paused.current=true;setPending(false);setReason(due);next.cursor=null;}}
    return next;
   });setSaveError('');}catch{setSaveError('Screen time cannot be saved on this browser. Break reminders may be unavailable.');}finally{busy=false;}
  };
  const timer=setInterval(tick,1000);void tick();document.addEventListener('visibilitychange',tick);window.addEventListener('blur',tick);
  return()=>{disposed=true;clearInterval(timer);document.removeEventListener('visibilitychange',tick);window.removeEventListener('blur',tick);paused.current=false;timed.current=false;};
 },[game,enabled]);
 const show=Boolean(reason&&game&&enabled);
 useEffect(()=>{
  if(!show)return;
  if(document.fullscreenElement)void document.exitFullscreen().catch(()=>{});
  dialog.current?.showModal();
  for(const frame of document.querySelectorAll('iframe'))frame.contentWindow?.postMessage({type:'puzzle-wellbeing',paused:true},location.origin);
  return()=>{for(const frame of document.querySelectorAll('iframe'))frame.contentWindow?.postMessage({type:'puzzle-wellbeing',paused:false},location.origin);};
 },[show]);
 async function resume(){try{await updateGameTime(state=>({...state,cursor:null,snoozeUntil:Date.now()+5*60_000}));paused.current=false;setReason(null);}catch{setSaveError('Could not save your reminder preference. Please try again.');}}
 function leave(){paused.current=false;setReason(null);setPending(false);}
 if(!game||!enabled)return null;
 const today=now?data.days[localDay(now)]?.total??0:0;
 return <>{(error||saveError)&&<p className={s.error} role="alert">{error||saveError}</p>}<div className={s.dock}>{progress?<Link href="/games/progress#screen-time">◷ {timeLabel(today)} today</Link>:<span>◷ {timeLabel(today)} today</span>}{pending&&<span role="status">Break time — finish this round, then return to work.</span>}</div>{show&&<dialog ref={dialog} className={s.dialog} aria-labelledby="break-title" onCancel={e=>e.preventDefault()} onKeyDown={e=>e.stopPropagation()}><p className={s.eyebrow}>KEEP THE GAME A SMALL PART OF YOUR DAY</p><h2 id="break-title">Good practice. Time to step away.</h2><p>{reason==='daily'?`You’ve reached your ${data.settings.dailyMinutes}-minute daily reminder.`:`You’ve reached your ${data.settings.sessionMinutes}-minute session reminder.`} You’ve spent <strong>{timeLabel(today)}</strong> on games today.</p><p>Rest your eyes, stretch, or return to one task that matters. Five minutes away starts a fresh session; your daily total stays.</p><div className={s.actions}><Link href="/productivity" onClick={leave}>Back to work →</Link><button onClick={resume}>Remind me in 5 minutes</button></div>{progress&&<Link href="/games/progress#screen-time" onClick={leave}>Review time & reminders</Link>}{saveError&&<p role="alert">{saveError}</p>}</dialog>}</>;
}

export function ScreenTime({compact=false}:{compact?:boolean}){
 const enabled=useSiteFeature('games.wellbeing'),progress=useSiteFeature('games.progress'),now=useTrainingClock(),{data,error}=useGameTime();
 const [session,setSession]=useState(''),[daily,setDaily]=useState(''),[message,setMessage]=useState('');
 if(!enabled)return null;
 const days=now?weekDays(now):[],today=now?data.days[localDay(now)]?.total??0:0,total=days.reduce((sum,day)=>sum+(data.days[day]?.total??0),0),max=Math.max(60_000,...days.map(day=>data.days[day]?.total??0));
 async function save(e:React.FormEvent){e.preventDefault();try{const sessionMinutes=Number(session||data.settings.sessionMinutes),dailyMinutes=Number(daily||data.settings.dailyMinutes);if(!Number.isInteger(sessionMinutes)||sessionMinutes<1||sessionMinutes>180||!Number.isInteger(dailyMinutes)||dailyMinutes<1||dailyMinutes>360)throw new Error('Use whole minutes: session 1–180; daily 1–360.');await updateGameTime(state=>({...state,settings:{sessionMinutes,dailyMinutes}}));setMessage('Reminders saved for this browser.');}catch(e){setMessage(e instanceof Error?e.message:'Could not save reminders.');}}
 return <section id={compact?undefined:'screen-time'} className={s.panel} aria-label="Game screen time"><div className={s.heading}><div><p className={s.eyebrow}>PLAY WITH A STOPPING POINT</p><h2>{compact?'A little play. Room for the rest.':'Your time, in perspective.'}</h2></div>{compact&&progress&&<Link href="/games/progress#screen-time">Time & reminders →</Link>}</div><div className={s.metrics}><div><strong>{now?timeLabel(today):'—'}</strong><span>On games today</span></div><div><strong>{now?timeLabel(total):'—'}</strong><span>Last 7 days</span></div><div><strong>{data.settings.sessionMinutes}m / {data.settings.dailyMinutes}m</strong><span>Session / daily reminders</span></div></div><div className={s.budget}><span style={{width:Math.min(100,today/(data.settings.dailyMinutes*60_000)*100)+'%'}}/></div>{error&&<p role="alert">{error}</p>}{!compact&&<><p className={s.fine}>Foreground game-page time, including unfinished play and idle time on that page. Hidden or unfocused tabs and this dashboard don’t count. Tracking starts from this update; previous scores aren’t converted into screen time.</p><div className={s.columns}><div><h3>Last seven days</h3><div className={s.bars}>{days.map(day=>{const ms=data.days[day]?.total??0;return <div key={day}><span>{day.slice(5)}</span><div><i style={{width:ms/max*100+'%'}}/></div><strong>{timeLabel(ms)}</strong></div>;})}</div></div><div><h3>Where the time went · last 7 days</h3>{GAMES.map(game=>({game,ms:days.reduce((sum,day)=>sum+(data.days[day]?.games[game.href.split('/').pop()!]??0),0)})).filter(row=>row.ms>0).sort((a,b)=>b.ms-a.ms).map(({game,ms})=><div className={s.gameRow} key={game.href}><span>{game.title}</span><strong>{timeLabel(ms)}</strong></div>)}{total===0&&<p>No game time recorded yet. Keep your next visit short and intentional.</p>}</div></div><form className={s.form} onSubmit={save}><h3>Choose your stopping points</h3><p>A reminder appears over the game with a route back to Productivity. A timed arithmetic round can finish first. You can choose one more five-minute window whenever it appears.</p><div className={s.fields}><label>Session reminder · minutes<input type="number" min="1" max="180" step="1" required value={session||String(data.settings.sessionMinutes)} onChange={e=>setSession(e.target.value)} /></label><label>Daily reminder · minutes<input type="number" min="1" max="360" step="1" required value={daily||String(data.settings.dailyMinutes)} onChange={e=>setDaily(e.target.value)} /></label><button type="submit">Save reminders</button></div><p role="status">{message}</p></form><p className={s.fine}>Only on this browser. Keeps up to 90 recorded days; no account or public leaderboard. Reminders work while the site is open. A break of at least five minutes resets session time; daily time resets at your local midnight. <Link href="/productivity">Go to Productivity →</Link></p></>}</section>;
}
