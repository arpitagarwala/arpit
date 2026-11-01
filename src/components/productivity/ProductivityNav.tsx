'use client';
import {useEffect,useId,useRef,useState} from 'react';
import Link from '@/components/productivity/SuiteNavigation';
import {usePathname} from 'next/navigation';
import s from './productivity.module.css';
export type ProductivityTool={href:string;title:string;sub:string;icon:string};
export default function ProductivityNav({tools}:{tools:ProductivityTool[]}){
 const path=usePathname();
 const [open,setOpen]=useState(false),id=useId(),root=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null);
 useEffect(()=>{if(!open)return;const outside=(event:PointerEvent)=>{if(!root.current?.contains(event.target as Node))setOpen(false);};const key=(event:KeyboardEvent)=>{if(event.key==='Escape'){setOpen(false);trigger.current?.focus();}};document.addEventListener('pointerdown',outside);document.addEventListener('keydown',key);return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',key);};},[open]);
 useEffect(()=>{const timer=setTimeout(()=>setOpen(false),0);return()=>clearTimeout(timer);},[path]);
 const links=[{href:'/productivity',label:'Your workspace',sub:'A little room to focus',icon:'ri-layout-grid-line'},...tools.map(tool=>({href:tool.href,label:tool.title==='Pomodoro'?'Focus Room':tool.title,sub:tool.sub,icon:tool.icon}))];
 return <div className={s.launcher} ref={root}>{open&&<div id={id} className={s.launchPanel}><div className={s.launchHeading}><div><span>YOUR PRODUCTIVITY SPACE</span><p>Move with your flow.</p></div><button aria-label="Close productivity navigation" onClick={()=>{setOpen(false);trigger.current?.focus();}}>×</button></div><nav aria-label="Productivity tools">{links.map(link=><Link key={link.href} href={link.href} aria-current={path===link.href?'page':undefined} onClick={()=>setOpen(false)}><i className={link.icon} aria-hidden="true"/><span><strong>{link.label}</strong><small>{link.sub}</small></span><i className={path===link.href?'ri-checkbox-blank-circle-fill':'ri-arrow-right-up-line'} aria-hidden="true"/></Link>)}</nav><p className={s.launchFooter}>Your timer and sound come with you.</p></div>}<button ref={trigger} className={s.launchButton} aria-label={open?'Close productivity workspace':'Open productivity workspace'} aria-expanded={open} aria-controls={open?id:undefined} onClick={()=>setOpen(!open)}><i className={open?'ri-close-line':'ri-apps-2-line'} aria-hidden="true"/><span>Workspace</span></button></div>;
}
