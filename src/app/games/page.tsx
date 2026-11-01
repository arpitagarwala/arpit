import {pageMetadata} from '@/lib/page-metadata';
import type {Metadata} from 'next';
import {getSite} from '@/lib/site-server';
import {configuredGames} from '@/lib/site-config';
import BackButton from '@/components/BackButton/BackButton';
import Footer from '@/components/Footer/Footer';
import GamesClient from './GamesClient';
import s from './games.module.css';
export const metadata:Metadata=pageMetadata("/games", {title:'Logic games',description:'Practise arithmetic, deduction, pattern recognition and spatial reasoning with logic puzzles at your own pace.',alternates:{canonical:'/games'}});
export default async function GamesPage(){const site=await getSite();return <main className={`${s.page} ${s.logic}`}><BackButton/><div className={s.shell}><GamesClient games={configuredGames(site)}/><Footer/></div></main>;}
