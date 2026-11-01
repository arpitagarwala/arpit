'use client';
import {useMemo,useState} from 'react';
import Link from 'next/link';
import type {Game} from '@/data/games';
import s from './games.module.css';
import {ScreenTime} from '@/components/training/GameTime';
import {TrainingSummary} from '@/components/training/TrainingViews';
export default function GamesClient({games}:{games:Game[]}){
 const [query,setQuery]=useState(''),[skill,setSkill]=useState('All');
 const skills=['All',...new Set(games.map(g=>g.genre))];
 const visible=useMemo(()=>games.filter(g=>(skill==='All'||g.genre===skill)&&[g.title,g.sub,...g.tags].join(' ').toLowerCase().includes(query.trim().toLowerCase())),[games,query,skill]);
 return <>
  <header className={s.hero}><div><p className={s.eyebrow}>THE LOGIC ROOM · PLAY & TRAIN</p><h1>Logic Games<span>.</span></h1><p className={s.heroTagline}>Small puzzles. Sharper thinking.</p><p className={s.lead}>Slow down, spot the pattern, and work it out. A space to practise reasoning, number sense and your next good move.</p><div className={s.facts}><span><i className="ri-grid-line"/> {games.length} games</span><span><i className="ri-user-line"/> Play at your pace</span><Link href="/productivity">Time to focus instead? ↗</Link></div></div><div className={s.heroArt} aria-hidden="true"><div className={s.puzzleTiles}>{['3','×','2','?','+','6','1','<','4'].map((x,i)=><span key={i} className={i===3?s.question:''}>{x}</span>)}</div><p>ONE CLEAR MOVE AT A TIME</p></div></header>
  <ScreenTime compact/><TrainingSummary canTrain={games.some(game=>game.href==='/games/math-sprint')}/>
  <section className={s.library} aria-label="Game library"><div className={s.libraryTop}><div><p className={s.eyebrow}>CHOOSE YOUR CHALLENGE</p><h2>What will you work out today?</h2></div><label className={s.search}><i className="ri-search-line" aria-hidden="true"/><input type="search" aria-label="Search logic games" placeholder="Find a game or skill" value={query} onChange={e=>setQuery(e.target.value)}/></label></div><div className={s.filters} aria-label="Filter by skill">{skills.map(x=><button key={x} aria-pressed={skill===x} className={skill===x?s.selected:''} onClick={()=>setSkill(x)}>{x}</button>)}</div><p className={s.resultCount}>{visible.length} {visible.length===1?'game':'games'} to explore</p><div className={s.grid}>{visible.map(game=><Link href={game.href} key={game.href} className={s.card}><div className={s.cardTop}><span className={s.icon}><i className={game.icon}/></span><span className={s.category}>{game.genre}</span></div><div><h3>{game.title}</h3><p>{game.sub}</p></div><div className={s.cardFoot}><span>{game.players==='1-2'?'Solo or a friend':'Play at your pace'}</span><span className={s.play}>Play <i className="ri-arrow-right-line"/></span></div></Link>)}</div>{!visible.length&&<div className={s.empty}><h3>No puzzles match that search.</h3><p>Try another name or choose a different skill.</p><button onClick={()=>{setQuery('');setSkill('All');}}>Show all games</button></div>}</section>
  <aside className={s.note}><i className="ri-lightbulb-line"/><p><strong>Make the reasoning the reward.</strong> Start with an easier grid, explain a move to yourself, and use Undo to explore. If you reveal a solution, restart and try the reasoning again.</p></aside><p className={s.credit}>Selected puzzles use <a href="https://www.chiark.greenend.org.uk/~sgtatham/puzzles/" target="_blank" rel="noopener noreferrer">Simon Tatham’s Portable Puzzle Collection</a>, by Simon Tatham and contributors. <a href="/vendor/tatham/LICENSE.txt" target="_blank">MIT licence</a>.</p>
 </>;
}
