import {pageMetadata} from '@/lib/page-metadata';
import {notFound} from 'next/navigation';
import BackButton from '@/components/BackButton/BackButton';
import {PUZZLES} from '@/data/puzzles';
import {getSite} from '@/lib/site-server';
import Footer from '@/components/Footer/Footer';
import PuzzlePlayer from './PuzzlePlayer';
import s from './puzzle.module.css';
export const dynamicParams=false;
export function generateStaticParams(){return PUZZLES.map(p=>({slug:p.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params,p=PUZZLES.find(p=>p.slug===slug);return pageMetadata('/games/'+slug,{title:p?.title+' · Logic room',description:p?.description});}
export default async function PuzzlePage({params}:{params:Promise<{slug:string}>}){const {slug}=await params,puzzle=PUZZLES.find(p=>p.slug===slug);if(!puzzle)notFound();const site=await getSite(),entry=site.games.find(g=>g.href==='/games/'+slug);return <main className={s.page}><BackButton/><div className={s.shell}><p className={s.breadcrumb}>{puzzle.skill}</p><header className={s.header}><div><p className={s.eyebrow}>{puzzle.tagline}</p><h1>{entry?.title??puzzle.title}</h1></div><p>{entry?.sub??puzzle.description}</p></header><PuzzlePlayer puzzle={puzzle}/><p className={s.credit}>Puzzle engine by <a href="https://www.chiark.greenend.org.uk/~sgtatham/puzzles/" target="_blank" rel="noopener noreferrer">Simon Tatham and contributors</a> · <a href="/vendor/tatham/LICENSE.txt" target="_blank">MIT licence</a> · <a href={'https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/'+slug+'.html'} target="_blank" rel="noopener noreferrer">Full rules ↗</a></p><Footer/></div></main>;}
