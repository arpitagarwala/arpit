'use client';
import {ACCOUNT_DATA_RESTORED,toolStorage} from '@/lib/account-storage';
import {createContext,useContext,useEffect,useRef,useState} from 'react';
import Link from '@/components/productivity/SuiteNavigation';
import {usePathname} from 'next/navigation';
import {finish,remaining,toggleStudy} from '@/lib/study';
import {initializeStudy,updateStudy,useStudyRoom} from '@/lib/study-store';
import {defaultQuiet,restoreQuiet,type QuietSettings} from '@/lib/quiet-space';
import {QuietAudio} from '@/lib/quiet-audio';
import {useSiteFeature} from '@/components/SiteFeatures';
import s from './productivity.module.css';
import ProductivityNav,{type ProductivityTool} from './ProductivityNav';
const QUIET_KEY='quiet-space-v1';
type Runtime={now:number;settings:QuietSettings;configure:(change:(s:QuietSettings)=>QuietSettings)=>boolean;playing:boolean;loading:boolean;error:string;status:string;play:()=>Promise<void>;pause:()=>void;minutes:number;setMinutes:(n:number)=>void;audioLeft:number|null;toggleFocus:()=>Promise<void>};
const Context=createContext<Runtime|null>(null);
export function useProductivity(){const value=useContext(Context);if(!value)throw new Error('Productivity provider missing.');return value;}
export function ProductivityProvider({children,tools}:{children:React.ReactNode;tools:ProductivityTool[]}){
 const path=usePathname(),{study,ready,error:studyError}=useStudyRoom(),quietEnabled=useSiteFeature('productivity.quiet'),focusEnabled=useSiteFeature('productivity.focus');
 const [now,setNow]=useState(0),[settings,setSettings]=useState(defaultQuiet),[loaded,setLoaded]=useState(false),[playing,setPlaying]=useState(false),[loading,setLoading]=useState(false),[error,setError]=useState(''),[status,setStatus]=useState('Choose an atmosphere. Give one thing your attention.'),[minutes,setMinutes]=useState(0),[audioEnd,setAudioEnd]=useState<number|null>(null),[audioRemaining,setAudioRemaining]=useState<number|null>(null);
 const engine=useRef<QuietAudio|null>(null),release=useRef<(()=>void)|null>(null),playingRef=useRef(false),generation=useRef(0),loadedRef=useRef(false),settingsRef=useRef(settings),endRef=useRef(audioEnd);
 useEffect(()=>{settingsRef.current=settings;endRef.current=audioEnd;},[settings,audioEnd,study]);
 function pause(){generation.current++;playingRef.current=false;setPlaying(false);setLoading(false);engine.current?.pause();if(endRef.current!==null)setAudioRemaining(Math.max(0,(endRef.current-Date.now())/1000));setAudioEnd(null);release.current?.();release.current=null;}
 function configure(change:(s:QuietSettings)=>QuietSettings){try{if(!loadedRef.current)throw new Error('Saved sound settings are unavailable. Existing data has been kept.');const next=change(settingsRef.current);if(next.linkFocus!==settingsRef.current.linkFocus){setAudioEnd(null);setAudioRemaining(null);}restoreQuiet(JSON.stringify(next));toolStorage.setItem(QUIET_KEY,JSON.stringify(next));settingsRef.current=next;setSettings(next);setError('');return true;}catch(e){setError(e instanceof Error?e.message:'Settings could not be saved.');return false;}}
 async function acquire(){if(release.current||!navigator.locks)return;await new Promise<void>((resolve,reject)=>{void navigator.locks.request('quiet-space-audio',{ifAvailable:true},async lock=>{if(!lock){reject(new Error('Quiet Space is playing in another tab. Pause it there before starting here.'));return;}await new Promise<void>(unlock=>{release.current=unlock;resolve();});}).catch(reject);});}
 async function play(){
  if(playingRef.current||loading||!loaded||!quietEnabled)return;
  if(!Object.values(settingsRef.current.levels).some(v=>v>0)){setError('Turn up at least one sound before playing.');return;}
  const token=++generation.current;setLoading(true);setError('');
  try{engine.current??=new QuietAudio();await engine.current.resume();await acquire();if(token!==generation.current){release.current?.();release.current=null;return;}
   const current=settingsRef.current,seconds=current.linkFocus&&focusEnabled?null:(audioRemaining??(minutes>0?minutes*60:null));
   const initialVolume=current.linkFocus&&focusEnabled?(study.deadline===null?0:study.mode==='focus'||current.breakAudio==='continue'?current.master:current.breakAudio==='quiet'?current.master*.3:0):current.master;
   await engine.current.sync(current.levels,initialVolume,true,seconds);
   if(token!==generation.current){engine.current.pause();release.current?.();release.current=null;return;}
   playingRef.current=true;setPlaying(true);setAudioEnd(seconds===null?null:Date.now()+seconds*1000);setStatus('Your space is ready. Settle into your next task.');
  }catch(e){engine.current?.pause();release.current?.();release.current=null;setError(e instanceof Error?e.message:'Audio could not start. Please try Play again.');}finally{setLoading(false);}
 }
 async function toggleFocus(){try{await updateStudy(s=>toggleStudy(s,Date.now(),crypto.randomUUID()));setNow(Date.now());}catch{setError('Your focus session could not be saved. Existing history has been kept.');}}
 useEffect(()=>{
  const load=setTimeout(()=>{void initializeStudy().catch(()=>setError('Study history is unavailable. Existing data has been kept.'));try{const next=restoreQuiet(toolStorage.getItem(QUIET_KEY));settingsRef.current=next;setSettings(next);loadedRef.current=true;setLoaded(true);}catch(e){setError(e instanceof Error?e.message:'Sound settings are unavailable.');}setNow(Date.now());},0);
  const tick=()=>{const time=Date.now();setNow(time);let completed=false;void updateStudy(state=>{const next=finish(state,time);completed=next!==state;return next;}).then(()=>{if(completed){setStatus('Session complete. Your next break or focus session is ready.');if(playingRef.current&&settingsRef.current.linkFocus&&settingsRef.current.chime)engine.current?.chime();}}).catch(()=>setError('Focus progress could not be saved. Existing history has been kept. Please check browser storage before continuing.'));if(endRef.current!==null&&time>=endRef.current){engine.current?.pause(settingsRef.current.chime?1800:650);if(settingsRef.current.chime)engine.current?.chime();playingRef.current=false;setPlaying(false);setAudioEnd(null);setAudioRemaining(null);release.current?.();release.current=null;setStatus('Your listening session has ended. Take a moment before the next thing.');}};
  const restoreSettings=(event:Event)=>{
   const values=(event as CustomEvent<Record<string,string|null>>).detail;
   if(!Object.hasOwn(values,QUIET_KEY))return;
   try{const next=restoreQuiet(values[QUIET_KEY]);settingsRef.current=next;setSettings(next);}catch{setError('Synced sound settings could not be loaded.');}
  };
  window.addEventListener(ACCOUNT_DATA_RESTORED,restoreSettings);
  const timer=setInterval(tick,1000);document.addEventListener('visibilitychange',tick);
  return()=>{window.removeEventListener(ACCOUNT_DATA_RESTORED,restoreSettings);clearTimeout(load);clearInterval(timer);document.removeEventListener('visibilitychange',tick);release.current?.();void engine.current?.close();engine.current=null;};
 },[]);
 useEffect(()=>{
  if(!playing||!engine.current)return;
  let volume=settings.master,left=audioEnd===null?null:Math.max(0,(audioEnd-Date.now())/1000);
  if(settings.linkFocus&&focusEnabled){left=study.deadline===null?null:Math.max(0,(study.deadline-Date.now())/1000);if(study.deadline===null)volume=0;else if(study.mode!=='focus')volume=settings.breakAudio==='off'?0:settings.breakAudio==='quiet'?volume*.3:volume;}
  void engine.current.sync(settings.levels,volume,true,left).catch(e=>{setError(e instanceof Error?e.message:'A sound could not be loaded.');});
 },[settings,playing,study.deadline,study.mode,audioEnd,focusEnabled]);
 useEffect(()=>{if(!quietEnabled){engine.current?.pause();playingRef.current=false;}},[quietEnabled]);
 const seconds=remaining(study,now),label=study.mode==='focus'?'Focus':study.mode==='short'?'Short break':'Long break',onQuiet=path==='/productivity/rain',onFocus=path==='/productivity/pomodoro',privateShell=/^\/(admin|login)(\/|$)/.test(path);
 return <Context.Provider value={{now,settings,configure,playing,loading,error:error||studyError,status,play,pause,minutes,setMinutes:n=>{setMinutes(n);setAudioRemaining(null);if(playing&&!(settingsRef.current.linkFocus&&focusEnabled))setAudioEnd(n>0?Date.now()+n*60000:null);},audioLeft:audioEnd!==null?Math.max(0,Math.ceil((audioEnd-now)/1000)):audioRemaining,toggleFocus}}>{children}{path.startsWith('/productivity')&&<ProductivityNav tools={tools}/>}{!privateShell&&((playing&&quietEnabled&&!onQuiet)||(ready&&focusEnabled&&study.sessionId&&!onFocus))&&<aside className={s.dock} aria-label="Your productivity session">{ready&&focusEnabled&&study.sessionId&&!onFocus&&<><Link href="/productivity/pomodoro">{label} · {Math.floor(seconds/60)}:{String(seconds%60).padStart(2,'0')} {study.deadline===null?'· paused':''}</Link><button onClick={toggleFocus}>{study.deadline===null?'Resume focus timer':'Pause focus timer'}</button></>}{playing&&quietEnabled&&!onQuiet&&<><Link href="/productivity/rain">Quiet Space · {settings.linkFocus?'linked to timer':'sound on'}</Link><button onClick={pause}>Pause sound</button></>}</aside>}</Context.Provider>;
}
