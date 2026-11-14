'use client';
import {ACCOUNT_DATA_RESTORED,toolStorage} from './account-storage';
import {useMemo,useSyncExternalStore} from 'react';
import {appendRound,appendPuzzle,emptyProgress,restoreProgress,validateRound,validatePuzzle,type Progress,type Round,type PuzzleRun} from './training';
const KEY='logic-training-v1',EVENT='logic-training-change',EMPTY=JSON.stringify(emptyProgress());
function subscribe(fn:()=>void){window.addEventListener('storage',fn);window.addEventListener(ACCOUNT_DATA_RESTORED,fn);window.addEventListener(EVENT,fn);return()=>{window.removeEventListener('storage',fn);window.removeEventListener(ACCOUNT_DATA_RESTORED,fn);window.removeEventListener(EVENT,fn);};}
function snapshot(){try{return toolStorage.getItem(KEY)??EMPTY;}catch{return EMPTY;}}
export function useTraining(){const raw=useSyncExternalStore(subscribe,snapshot,()=>EMPTY);return useMemo(()=>{try{return{progress:restoreProgress(JSON.parse(raw)),error:''};}catch(e){return{progress:emptyProgress(),error:e instanceof Error?e.message:'Progress is unavailable.'};}},[raw]);}
function update(change:(progress:Progress)=>Progress){const raw=toolStorage.getItem(KEY);const next=change(raw?restoreProgress(JSON.parse(raw)):emptyProgress());toolStorage.setItem(KEY,JSON.stringify(next));window.dispatchEvent(new Event(EVENT));return next;}
export function saveRound(round:Round){validateRound(round);return update(p=>appendRound(p,round));}
export function savePuzzle(run:PuzzleRun){validatePuzzle(run);return update(p=>appendPuzzle(p,run));}

function subscribeClock(callback:()=>void){const timer=setInterval(callback,60000);return()=>clearInterval(timer);}
const clockSnapshot=()=>Math.floor(Date.now()/60000)*60000;
export function useTrainingClock(){return useSyncExternalStore(subscribeClock,clockSnapshot,()=>0);}
