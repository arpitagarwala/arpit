import {pageMetadata} from '@/lib/page-metadata';
import MathSprintClient from './MathSprintClient';
import {OPERATIONS,type Mode,type Focus,type Level} from '@/lib/training';
export const metadata=pageMetadata("/games/math-sprint", {title:'Math Sprint · Logic room',description:'A 60-second arithmetic sprint with per-answer timing, operation-level accuracy, targeted practice and personal progress.',alternates:{canonical:'/games/math-sprint'}});
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){const params=await searchParams;const mode:Mode=params.mode==='daily'?'daily':params.mode==='practice'?'practice':'sprint',focus:Focus=OPERATIONS.includes(params.focus as never)?params.focus as Focus:'mixed',level:Level=params.level==='easy'?'easy':params.level==='challenge'?'challenge':'standard';return <MathSprintClient initialMode={mode} initialFocus={focus} initialLevel={level}/>;}
