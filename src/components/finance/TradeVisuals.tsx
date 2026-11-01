'use client';
/* User-provided data URLs stay private; image optimization would send them to a server. */
/* eslint-disable @next/next/no-img-element */
import {useSiteFeature} from '@/components/SiteFeatures';
import { useEffect, useRef, useState } from 'react';
import type { Trade } from '@/lib/trade-journal';
import { validateVisuals, type TradeVisuals as Visuals } from '@/lib/trade-visuals';
import { readVisuals, writeVisuals } from '@/lib/trade-media-store';
import styles from './planning.module.css';
import js from './journal.module.css';
function TradeVisuals({trade,practice=false}:{trade:Trade;practice?:boolean}){
  const viewer=useRef<HTMLDialogElement>(null);
  const [data,setData]=useState<Visuals>({id:trade.id,images:[]}),[ready,setReady]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[status,setStatus]=useState(''),[zoom,setZoom]=useState<number|null>(null);
  useEffect(()=>{let alive=true;readVisuals(trade.id,practice).then(v=>{if(alive){setData(v);setReady(true);}}).catch(e=>{if(alive)setError(e.message);});return()=>{alive=false;};},[trade.id,practice]);
  useEffect(()=>{if(zoom!==null)viewer.current?.showModal();else viewer.current?.close();},[zoom]);
  async function save(next:Visuals){await writeVisuals(next,practice,data);setData(next);setStatus(practice?'Screenshots kept in this practice session.':'Screenshots saved on this device.');}
  async function images(files:File[]){if(!ready||busy||!files.length)return;setBusy(true);setError('');try{
    if(files.length+data.images.length>3)throw new Error('Keep up to 3 screenshots per trade. Remove one to add another.');
    const added=await Promise.all(files.map(async file=>{if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>2000000)throw new Error('Use PNG, JPEG or WebP screenshots, up to 2 MB each.');
      const url=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(new Error('Could not read the image.'));reader.readAsDataURL(file);});
      await new Promise<void>((resolve,reject)=>{const img=new Image();img.onload=()=>resolve();img.onerror=()=>reject(new Error('This file cannot be decoded as an image.'));img.src=url;});return{name:file.name.slice(0,200)||'Trade screenshot',url};}));await save(validateVisuals({...data,images:[...data.images,...added]}));
    }catch(e){setError(e instanceof Error?e.message:'Screenshot could not be saved.');}finally{setBusy(false);}}
  return <section className={js.visuals} aria-label={`Screenshots for ${trade.symbol}`}>{data.images.length>0&&<div className={styles.sectionHeading}><h3>Trade screenshots</h3><span className={js.pill}>{data.images.length}/3 images</span></div>}
    {error&&<p role="alert" className={styles.error}>{error}</p>}{status&&<p role="status" className={js.muted}>{status}</p>}
    {data.images.length>0&&<div className={`${js.gallery} ${data.images.length===1?js.singleImage:''}`}>{data.images.map((img,i)=><figure key={i}><button onClick={()=>setZoom(i)} aria-label={`View screenshot ${i+1}: ${img.name}`}><img src={img.url} alt={`Trade screenshot: ${img.name}`}/></button><figcaption><span>{img.name}</span><button disabled={busy} onClick={async()=>{setBusy(true);try{await save({...data,images:data.images.filter((_,n)=>n!==i)});}catch(e){setError(e instanceof Error?e.message:'Remove failed.');}finally{setBusy(false);}}}>Remove</button></figcaption></figure>)}</div>}
    <div className={js.dropzone} tabIndex={0} aria-label={`Paste or drop screenshots for ${trade.symbol}`} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();void images(Array.from(e.dataTransfer.files));}} onPaste={e=>{const files=Array.from(e.clipboardData.items).filter(x=>x.kind==='file').map(x=>x.getAsFile()).filter((f):f is File=>!!f);if(files.length){e.preventDefault();void images(files);}}}>
      <div><p>{data.images.length?'Add another view or paste a screenshot.':'Optional: add your own screenshot.'}</p><small>Upload, paste or drop · PNG, JPEG, WebP · 2 MB each</small></div><label className={js.upload}><span>{busy?'Saving…':'＋ Add screenshot'}</span><input type="file" aria-label={`Add screenshots for ${trade.symbol}`} accept="image/png,image/jpeg,image/webp" multiple disabled={!ready||busy||data.images.length===3} onChange={e=>{void images(Array.from(e.target.files??[]));e.target.value='';}}/></label>
    </div>
    <dialog ref={viewer} className={js.lightbox} aria-label="Trade screenshot viewer" onCancel={()=>setZoom(null)}>{zoom!==null&&data.images[zoom]&&<><button onClick={()=>setZoom(null)}>Close screenshot ×</button><img src={data.images[zoom].url} alt={data.images[zoom].name}/><a href={data.images[zoom].url} download={data.images[zoom].name}>Download original</a></>}</dialog>
  </section>;
}

export default function ControlledVisuals(props:Parameters<typeof TradeVisuals>[0]){return useSiteFeature('journal.screenshots')?<TradeVisuals {...props}/>:null;}
