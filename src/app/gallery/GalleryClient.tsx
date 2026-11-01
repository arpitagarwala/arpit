'use client';

/* eslint-disable @next/next/no-img-element -- Gallery supports owner-managed image providers. */
import {useEffect,useRef,useState,type PointerEvent} from 'react';
import {getImageProps} from 'next/image';
import type {Photo} from '@/data/gallery';
import styles from './page.module.css';

function imageSource(src:string,width:number){
 try{const url=new URL(src);if(url.protocol==='https:'&&url.hostname==='res.cloudinary.com'&&/\/image\/upload\/v\d+\//.test(url.pathname))return src.replace('/image/upload/',`/image/upload/w_${width},c_limit,q_auto,f_auto/`);}catch{}
 return src;
}
function PhotoTile({photo,index,onOpen}:{photo:Photo;index:number;onOpen:()=>void}){
 const [failed,setFailed]=useState(false);
 const src=photo.thumb||imageSource(photo.src,800),alt=photo.alt||photo.title;
 const imageProps=src.startsWith('/photos/')?getImageProps({src,alt,width:600,height:800,sizes:'(max-width: 600px) 50vw, (max-width: 1000px) 33vw, 300px',loading:index<3?'eager':'lazy'}).props:{src,alt,loading:index<3?'eager' as const:'lazy' as const};
 return <button type="button" className={styles.photoCard} onClick={onOpen} aria-label={'View '+photo.title} aria-haspopup="dialog"><span className={styles.photoFrame}>{!failed?<img {...imageProps} alt={alt} decoding="async" onError={()=>setFailed(true)}/>:<span className={styles.thumbnailError}><i className="ri-image-line" aria-hidden="true"/>View photograph</span>}<span className={styles.expandIcon} aria-hidden="true"><i className="ri-fullscreen-line"/></span></span><span className={styles.photoCaption}><span><strong>{photo.title}</strong>{photo.category&&<small>{photo.category}</small>}</span><span className={styles.photoNumber} aria-hidden="true">{String(index+1).padStart(2,'0')}</span></span></button>;
}
function ViewerImage({photo,zoomed}:{photo:Photo;zoomed:boolean}){
 const [loaded,setLoaded]=useState(false),[failed,setFailed]=useState(false),[attempt,setAttempt]=useState(0);
 return <>{!loaded&&!failed&&<div className={styles.imageStatus} role="status"><span className={styles.loadingDot}/>Loading photograph…</div>}{failed?<div className={styles.imageStatus} role="alert"><i className="ri-image-line" aria-hidden="true"/><p>This photograph couldn’t be loaded.</p><button onClick={()=>{setFailed(false);setLoaded(false);setAttempt(v=>v+1);}}>Try again</button></div>:<div className={styles.imageStage}><img key={attempt} src={imageSource(photo.src,zoomed?2600:1800)} alt={photo.alt||photo.title} decoding="async" className={loaded?styles.imageReady:styles.imagePending} onLoad={()=>setLoaded(true)} onError={()=>setFailed(true)} draggable={false}/></div>}</>;
}
function PhotoViewer({photos,index,onIndex,onClose,returnFocus}:{photos:Photo[];index:number;onIndex:(index:number)=>void;onClose:()=>void;returnFocus:HTMLElement|null}){
 const dialog=useRef<HTMLDialogElement>(null),viewport=useRef<HTMLDivElement>(null),gesture=useRef<{x:number;y:number;at:number}|null>(null),swiped=useRef(false),[zoomed,setZoomed]=useState(false);
 const photo=photos[index],multiple=photos.length>1;
 useEffect(()=>{const node=dialog.current;if(!node)return;const previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';node.showModal();node.querySelector<HTMLButtonElement>('[aria-label="Close photo viewer"]')?.focus();return()=>{node.close();document.body.style.overflow=previousOverflow;returnFocus?.focus({preventScroll:true});};},[returnFocus]);
 useEffect(()=>{const node=viewport.current;if(!node)return;node.scrollTo({left:zoomed?(node.scrollWidth-node.clientWidth)/2:0,top:zoomed?(node.scrollHeight-node.clientHeight)/2:0,behavior:'instant'});},[zoomed,index]);
 function navigate(direction:number){if(!multiple)return;setZoomed(false);gesture.current=null;onIndex((index+direction+photos.length)%photos.length);}
 function pointerDown(event:PointerEvent<HTMLDivElement>){swiped.current=false;if(zoomed||event.button!==0||!event.isPrimary)return;gesture.current={x:event.clientX,y:event.clientY,at:Date.now()};}
 function pointerUp(event:PointerEvent<HTMLDivElement>){const from=gesture.current;gesture.current=null;if(!from||zoomed||Date.now()-from.at>1000)return;const dx=event.clientX-from.x,dy=event.clientY-from.y;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.4){swiped.current=true;navigate(dx<0?1:-1);}}
 return <dialog ref={dialog} className={styles.lightbox} aria-labelledby="gallery-photo-title" aria-describedby="gallery-viewer-help" onCancel={event=>{event.preventDefault();onClose();}} onKeyDown={event=>{if(event.altKey||event.ctrlKey||event.metaKey)return;if(!zoomed&&(event.key==='ArrowLeft'||event.key==='ArrowRight')){event.preventDefault();navigate(event.key==='ArrowLeft'?-1:1);}}}>
  <div className={styles.viewerLayout}><header className={styles.viewerHeader}><span className={styles.viewerBrand}><i className="ri-camera-lens-line" aria-hidden="true"/>Gallery <span>{index+1} / {photos.length}</span></span><div className={styles.viewerActions}><button type="button" onClick={()=>setZoomed(v=>!v)} aria-pressed={zoomed} aria-label={zoomed?'Zoom out':'Zoom in'} title={zoomed?'Zoom out':'Zoom in'}><i className={zoomed?'ri-zoom-out-line':'ri-zoom-in-line'} aria-hidden="true"/></button><button type="button" autoFocus onClick={onClose} aria-label="Close photo viewer" title="Close (Esc)"><i className="ri-close-line" aria-hidden="true"/></button></div></header>
  <div ref={viewport} className={`${styles.photoViewport} ${zoomed?styles.zoomed:''}`} onPointerDown={pointerDown} onPointerUp={pointerUp} onPointerCancel={()=>{gesture.current=null;}} onClick={event=>{if(swiped.current){swiped.current=false;return;}if(event.target===event.currentTarget&&!zoomed)onClose();}}><ViewerImage key={photo.src+index} photo={photo} zoomed={zoomed}/></div>
  <footer className={styles.viewerFooter}><div className={styles.viewerMeta}><h2 id="gallery-photo-title">{photo.title}</h2>{photo.category&&<p>{photo.category}</p>}</div><div className={styles.viewerNavigation}><button type="button" disabled={!multiple} onClick={()=>navigate(-1)} aria-label="Previous photo"><i className="ri-arrow-left-line" aria-hidden="true"/></button><span>{String(index+1).padStart(2,'0')} <span>/ {String(photos.length).padStart(2,'0')}</span></span><button type="button" disabled={!multiple} onClick={()=>navigate(1)} aria-label="Next photo"><i className="ri-arrow-right-line" aria-hidden="true"/></button></div><p id="gallery-viewer-help" className={styles.viewerHelp}>{zoomed?'Scroll to explore · zoom out for swiping':'Swipe or use arrow keys to browse · Esc to close'}</p></footer></div>
 </dialog>;
}
export default function GalleryClient({photos,title,description}:{photos:Photo[];title:string;description:string}){
 const [category,setCategory]=useState<string|null>(null),[selected,setSelected]=useState<number|null>(null),[opener,setOpener]=useState<HTMLElement|null>(null);
 const categories=[...new Set(photos.map(p=>p.category?.trim()).filter((c):c is string=>Boolean(c)))],visible=category?photos.filter(p=>p.category?.trim()===category):photos;
 function openPhoto(index:number){setOpener(document.activeElement instanceof HTMLElement?document.activeElement:null);setSelected(index);}
 return <><header className={styles.header}><p className={styles.eyebrow}>THROUGH MY LENS</p><div className={styles.titleRow}><h1>{title}</h1><p>{description}</p></div></header><div className={styles.toolbar}><div className={styles.filters} role="group" aria-label="Photo collections"><button type="button" aria-pressed={category===null} onClick={()=>setCategory(null)}>All photos <span>{photos.length}</span></button>{categories.map(c=><button type="button" key={c} aria-pressed={category===c} onClick={()=>setCategory(c)}>{c}<span>{photos.filter(p=>p.category?.trim()===c).length}</span></button>)}</div><p className={styles.browseHint}><i className="ri-fullscreen-line" aria-hidden="true"/>A closer look, one moment at a time.</p></div>
 <p className={styles.srOnly} role="status">{visible.length} {visible.length===1?'photograph':'photographs'}{category?' in '+category:''}</p>
 {visible.length?<div className={styles.photoGrid} data-analytics-section="gallery/photographs">{visible.map((photo,index)=><PhotoTile key={photo.src+index} photo={photo} index={index} onOpen={()=>openPhoto(index)}/>)}</div>:<div className={styles.empty}><i className="ri-camera-line" aria-hidden="true"/><h2>A little room for new memories.</h2><p>Photographs will appear here when they’re added.</p></div>}
 {selected!==null&&visible[selected]&&<PhotoViewer photos={visible} index={selected} onIndex={setSelected} onClose={()=>setSelected(null)} returnFocus={opener}/>}</>;
}
