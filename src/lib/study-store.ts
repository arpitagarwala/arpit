'use client';
import {useMemo,useSyncExternalStore} from 'react';
import {initialStudy,restoreStudy,type StudyState} from './study';
export const STUDY_KEY='study-room-v1',STUDY_EVENT='study-room-change';
function subscribe(fn:()=>void){window.addEventListener('storage',fn);window.addEventListener(STUDY_EVENT,fn);return()=>{window.removeEventListener('storage',fn);window.removeEventListener(STUDY_EVENT,fn);};}
function snapshot(){try{return localStorage.getItem(STUDY_KEY);}catch{return '!storage-unavailable';}}
export function useStudyRoom(){const raw=useSyncExternalStore(subscribe,snapshot,()=>null);return useMemo(()=>{try{return{study:raw?restoreStudy(JSON.parse(raw)):initialStudy,ready:raw!==null,error:''};}catch{return{study:initialStudy,ready:false,error:'Study history could not be read. Your existing data has been left unchanged.'};}},[raw]);}
export async function updateStudy(change:(study:StudyState)=>StudyState){const write=()=>{const raw=localStorage.getItem(STUDY_KEY),current=raw?restoreStudy(JSON.parse(raw)):structuredClone(initialStudy),next=change(current);if(next!==current){localStorage.setItem(STUDY_KEY,JSON.stringify(next));window.dispatchEvent(new Event(STUDY_EVENT));}return next;};return navigator.locks?navigator.locks.request(STUDY_KEY,write):write();}
export async function initializeStudy(){return updateStudy(current=>{
 if(localStorage.getItem(STUDY_KEY))return current;
 const legacy=(key:string)=>Math.max(0,Number(localStorage.getItem(key))||0),level=Math.min(10000,Math.floor(legacy('pomo_level')||1));
 return restoreStudy({...current,focus:legacy('pomo_c_f')||25,short:legacy('pomo_c_b')||5,xp:legacy('pomo_xp')+50*(level-1)*(level+1),legacyMinutes:legacy('pomo_mins'),legacySessions:legacy('pomo_sessions'),remaining:(legacy('pomo_c_f')||25)*60,duration:legacy('pomo_c_f')||25});
});}
