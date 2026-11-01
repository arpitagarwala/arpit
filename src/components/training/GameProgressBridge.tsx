'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {useSiteFeature} from '@/components/SiteFeatures';
import {savePuzzle} from '@/lib/training-store';
import {validatePuzzle} from '@/lib/training';
import s from './training.module.css';
export default function GameProgressBridge({slug}:{slug:string}){const showProgress=useSiteFeature('games.progress');const [message,setMessage]=useState('');useEffect(()=>{const receive=(event:Event)=>{try{const run=validatePuzzle((event as CustomEvent).detail);if(run.slug!==slug&&!run.slug.startsWith(slug+'-'))return;savePuzzle(run);setMessage(run.revealed?'Workout recorded with help noted.':run.moves>=3&&(run.outcome==='solved'||run.elapsedMs>=60000)?'Workout recorded · +30 XP. Today’s streak is complete.':'Practice recorded. Keep building your next small win.');}catch{setMessage('Your game result is ready, but training progress could not be saved on this device.');}};window.addEventListener('logic-game-result',receive);return()=>window.removeEventListener('logic-game-result',receive);},[slug]);return message?<aside role="status" className={s.winNotice}><p>{message}</p>{showProgress&&<Link href="/games/progress">Your progress ↗</Link>}<button aria-label="Dismiss training update" onClick={()=>setMessage('')}>×</button></aside>:null;}
