'use client';
import {useMemo,useSyncExternalStore} from 'react';
import {freshTime,readTime,TIME_KEY,TIME_EVENT,type GameTime} from './game-time';
const EMPTY=JSON.stringify(freshTime());
function subscribe(fn:()=>void){window.addEventListener('storage',fn);window.addEventListener(TIME_EVENT,fn);return()=>{window.removeEventListener('storage',fn);window.removeEventListener(TIME_EVENT,fn);};}
function snapshot(){try{return localStorage.getItem(TIME_KEY)??EMPTY;}catch{return EMPTY;}}
export function useGameTime(){const raw=useSyncExternalStore(subscribe,snapshot,()=>EMPTY);return useMemo(()=>{try{return{data:readTime(raw),error:''};}catch(e){return{data:freshTime(),error:e instanceof Error?e.message:'Screen-time history is unavailable.'};}},[raw]);}
export async function updateGameTime(change:(s:GameTime)=>GameTime){
 const write=()=>{const current=readTime(localStorage.getItem(TIME_KEY)),next=change(current);if(next!==current){localStorage.setItem(TIME_KEY,JSON.stringify(next));window.dispatchEvent(new Event(TIME_EVENT));}return next;};
 // Serialize writes across tabs. Older browsers use the shared cursor and
 // foreground focus check, so another tab cannot add the same interval.
 return navigator.locks? navigator.locks.request(TIME_KEY,write):write();
}
