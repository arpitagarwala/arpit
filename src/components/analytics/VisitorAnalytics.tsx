'use client';
import {createPortal} from 'react-dom';
import {usePathname} from 'next/navigation';
import {useEffect,useRef,useState} from 'react';
import {useSiteFeature} from '@/components/SiteFeatures';
import {ANALYTICS_ACTIONS,analyticsPath,analyticsSection,safeDomain,type AnalyticsPayload} from '@/lib/web-analytics';
import s from './privacy.module.css';
const CHOICE='website-analytics-choice-v1',VISITOR='website-analytics-visitor-v1',SESSION='website-analytics-session-v1';
type Choice='pending'|'ask'|'allow'|'decline';
const optedOut=()=>('globalPrivacyControl' in navigator&&navigator.globalPrivacyControl===true)||navigator.doNotTrack==='1';
export default function VisitorAnalytics(){
 const path=usePathname(),enabled=useSiteFeature('analytics.collection'),[choice,setChoice]=useState<Choice>('pending'),[protectedBrowser,setProtectedBrowser]=useState(false),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
 const [target,setTarget]=useState<HTMLElement|null>(null);
 const permission=useRef(false);
 const privatePage=/^\/(admin|owner|login|api)(\/|$)/.test(path),trackable=!!analyticsPath(path);
 useEffect(()=>{
  if(path!=='/privacy')return;
  const timer=setTimeout(()=>setTarget(document.getElementById('analytics-preferences')),0);
  return()=>clearTimeout(timer);
 },[path]);
 useEffect(()=>{const load=()=>{try{const stored=localStorage.getItem(CHOICE);permission.current=stored==='allow'&&!optedOut();setChoice(optedOut()?'decline':stored==='allow'?'allow':stored==='decline'?'decline':'ask');setProtectedBrowser(optedOut());}catch{setChoice('decline');permission.current=false;}};const timer=setTimeout(load,0);window.addEventListener('storage',load);return()=>{clearTimeout(timer);window.removeEventListener('storage',load);};},[]);
 useEffect(()=>{
  if(choice!=='allow'||!enabled||!trackable||privatePage||optedOut())return;
  let visitor:string,session:{id:string;last:number};
  try{const saved=JSON.parse(localStorage.getItem(VISITOR)??'null');visitor=saved&&Date.now()-saved.created<30*86400000?saved.id:crypto.randomUUID();if(!saved||saved.id!==visitor)localStorage.setItem(VISITOR,JSON.stringify({id:visitor,created:Date.now()}));const old=JSON.parse(sessionStorage.getItem(SESSION)??'null');session=old&&Date.now()-old.last<1800000?old:{id:crypto.randomUUID(),last:Date.now()};}catch{return;}
  const newPage=():AnalyticsPayload=>({visitor,session:session.id,page:crypto.randomUUID(),path,seq:0,started:Date.now(),active:0,scroll:0,sections:{},referrer:'',events:[]});
  let current=newPage(),lastTick=performance.now(),lastInteraction=Date.now(),stopped=false,inFlight=false;
  try{const domain=safeDomain(document.referrer);if(domain&&domain!==location.hostname)sessionStorage.setItem('website-analytics-source-v1',domain);current.referrer=sessionStorage.getItem('website-analytics-source-v1')??'';}catch{}
  function saveSession(){try{sessionStorage.setItem(SESSION,JSON.stringify(session));}catch{}}
  function payload(){return{...current,seq:++current.seq,sections:{...current.sections},events:[...current.events],consent:'optional-analytics-v1'};}
  async function flush(beacon=false){
   if(!permission.current||stopped&&!beacon||inFlight&&!beacon)return false;
   const outgoing=payload();
   if(beacon){navigator.sendBeacon('/api/analytics',new Blob([JSON.stringify(outgoing)],{type:'application/json'}));return true;}
   inFlight=true;try{const r=await fetch('/api/analytics',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(outgoing),keepalive:true});if(!r.ok)return false;current.events=current.events.filter(e=>!outgoing.events.some(v=>v.id===e.id));if(current.feedback===outgoing.feedback)delete current.feedback;return true;}catch{return false;}finally{inFlight=false;}
  }
  function section(){
   const explicit=[...document.querySelectorAll<HTMLElement>('[data-analytics-section]')];
   const nodes=explicit.length?explicit:[...document.querySelectorAll<HTMLElement>('main>section,main>div>section,main>div>article,main>div>aside')];
   const y=innerHeight*.48,x=innerWidth/2;
   const visible=nodes.map((node,i)=>{const r=node.getBoundingClientRect(),height=Math.max(0,Math.min(r.bottom,innerHeight)-Math.max(r.top,0)),width=Math.max(0,Math.min(r.right,innerWidth)-Math.max(r.left,0));return{node,i,area:width*height,center:r.top<=y&&r.bottom>=y&&r.left<=x&&r.right>=x,depth:node.querySelectorAll('[data-analytics-section]').length};}).filter(v=>v.area>0).sort((a,b)=>Number(b.center)-Number(a.center)||a.depth-b.depth||b.area-a.area);
   const found=visible[0];if(!found)return'page';const name=analyticsSection(found.node.dataset.analyticsSection??`content/section-${found.i+1}`);return name in current.sections||Object.keys(current.sections).length<31?name:'content/other';
  }
  function tick(){const time=performance.now(),delta=Math.round(time-lastTick);lastTick=time;if(document.visibilityState!=='visible'||!document.hasFocus()||Date.now()-lastInteraction>60000||delta<0||delta>2500)return;
   if(Date.now()-session.last>1800000){void flush(true);session={id:crypto.randomUUID(),last:Date.now()};current=newPage();}
   session.last=Date.now();const key=section();current.active+=delta;current.sections[key]=(current.sections[key]??0)+delta;
   const max=document.documentElement.scrollHeight-innerHeight;current.scroll=Math.max(current.scroll,max>0?Math.min(100,Math.round(scrollY/max*100)):100);
  }
  function interact(){lastInteraction=Date.now();}
  function click(e:MouseEvent){const node=e.target instanceof Element?e.target.closest<HTMLElement>('[data-analytics-event],a'):null;if(!node||current.events.length>=12)return;const tagged=node.dataset.analyticsEvent;if(tagged&&(ANALYTICS_ACTIONS as readonly string[]).includes(tagged))current.events.push({id:crypto.randomUUID(),kind:'action',name:tagged,target:''});else if(node instanceof HTMLAnchorElement){try{const url=new URL(node.href);if(/^https?:$/.test(url.protocol)&&url.hostname!==location.hostname)current.events.push({id:crypto.randomUUID(),kind:'action',name:'external-link',target:url.hostname});}catch{}}}
  function problem(event:Event){if(current.events.filter(e=>e.kind==='error').length>=3||current.events.length>=12)return;current.events.push({id:crypto.randomUUID(),kind:'error',name:event.type==='unhandledrejection'?'unhandled-rejection':event.target!==window?'resource-error':'script-error',target:''});}
  function action(event:Event){const name=(event as CustomEvent).detail;if(current.events.length<12&&(ANALYTICS_ACTIONS as readonly unknown[]).includes(name))current.events.push({id:crypto.randomUUID(),kind:'action',name,target:''});}
  function hide(){tick();saveSession();if(document.visibilityState==='hidden')void flush(true);else{lastTick=performance.now();interact();}}
  function leave(){tick();saveSession();void flush(true);}
  const ticker=setInterval(tick,1000),heartbeat=setInterval(()=>{saveSession();if(document.visibilityState==='visible'&&document.hasFocus()&&Date.now()-lastInteraction<60000)void flush();},20000);
  void flush();for(const event of ['pointerdown','keydown','scroll','touchstart'])window.addEventListener(event,interact,{passive:true});window.addEventListener('click',click);window.addEventListener('website-action',action);window.addEventListener('error',problem,true);window.addEventListener('unhandledrejection',problem);window.addEventListener('pagehide',leave);document.addEventListener('visibilitychange',hide);
  return()=>{tick();saveSession();void flush(true);stopped=true;clearInterval(ticker);clearInterval(heartbeat);for(const event of ['pointerdown','keydown','scroll','touchstart'])window.removeEventListener(event,interact);window.removeEventListener('click',click);window.removeEventListener('website-action',action);window.removeEventListener('error',problem,true);window.removeEventListener('unhandledrejection',problem);window.removeEventListener('pagehide',leave);document.removeEventListener('visibilitychange',hide);};
 },[choice,enabled,trackable,privatePage,path]);
 function choose(value:'allow'|'decline'){permission.current=value==='allow'&&!optedOut();try{localStorage.setItem(CHOICE,value);}catch{}setChoice(value);setMessage('');}
 async function forget(){setBusy(true);setMessage('');choose('decline');try{const saved=JSON.parse(localStorage.getItem(VISITOR)??'null');if(saved?.id){const r=await fetch('/api/analytics',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({forget:true,visitor:saved.id})});if(!r.ok)throw Error();}localStorage.removeItem(VISITOR);sessionStorage.removeItem(SESSION);sessionStorage.removeItem('website-analytics-source-v1');setMessage('Tracking stopped. Analytics linked to this browser token have been deleted.');}catch{setMessage('Tracking is stopped, but deletion could not complete. Keep this browser token and retry.');}finally{setBusy(false);}}
 if(path!=='/privacy'||choice==='pending')return null;
 if(!target)return null;
 return createPortal(<section className={s.preferences} aria-label="Analytics preferences">
  <h2>Analytics preferences</h2>
  <p>{protectedBrowser?"Your browser’s privacy signal keeps analytics off.":!enabled?'Optional analytics is paused.':choice==='allow'?'Optional analytics is on for this browser.':'Optional analytics is off for this browser.'}</p>
  <div className={s.actions}>
   {enabled&&!protectedBrowser&&choice!=='allow'&&<button className={s.primary} onClick={()=>choose('allow')}>Allow optional analytics</button>}
   {choice==='allow'&&<button onClick={()=>choose('decline')}>Stop analytics</button>}
   <button disabled={busy} onClick={()=>void forget()}>Stop and delete this browser’s analytics</button>
  </div>
  {message&&<p role="status">{message}</p>}
 </section>,target);
}
