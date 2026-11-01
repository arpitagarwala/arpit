'use client';
import Link from '@/components/productivity/SuiteNavigation';
import {useStudyRoom} from '@/lib/study-store';
import {useProductivity} from './ProductivityProvider';
import {studyAnalysis,focusTime} from '@/lib/study-analytics';
import {useSiteFeature} from '@/components/SiteFeatures';
import s from './productivity.module.css';
export default function ProductivityOverview(){const {study,ready}=useStudyRoom(),{now}=useProductivity(),show=useSiteFeature('productivity.analysis');if(!show)return null;const a=studyAnalysis(study,now||0);return <section className={s.card} aria-label="Your productivity overview"><p className={s.eyebrow}>YOUR TIME, WORKING TOGETHER</p><h2>Plan it. Focus on it. See the progress.</h2><div className={s.stats}><div><strong>{ready?focusTime(a.today):'—'}</strong><span>Focus today</span></div><div><strong>{ready?focusTime(a.total):'—'}</strong><span>This week · last 7 days</span></div><div><strong>{ready?study.tasks.filter(t=>!t.done&&!t.archived).length:'—'}</strong><span>Tasks to work on</span></div><div><strong>{focusTime(study.goal)}</strong><span>Your daily focus goal</span></div></div><Link className={s.button} href="/productivity/analysis">Open focus analysis →</Link><p className={s.fine}>One task list and timer across the suite. Time reflects your focus timer; sound-only listening and breaks are excluded.</p></section>;}
