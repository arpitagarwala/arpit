'use client';

/* eslint-disable @next/next/no-img-element -- Cloudinary transforms provide responsive versions while preserving intrinsic design proportions. */
import {useEffect, useRef, useState} from 'react';
import {DESIGNS, type DesignWork} from '@/data/designs';
import styles from './page.module.css';

function thumbnail(src: string) {
  return src.replace('/image/upload/', '/image/upload/w_800,c_limit,q_auto,f_auto/');
}

function DesignViewer({work, onClose, opener}: {work: DesignWork; onClose: () => void; opener: HTMLElement | null}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const node = dialog.current;
    if (!node) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    node.showModal();
    return () => {
      node.querySelector('video')?.pause();
      node.close();
      document.body.style.overflow = overflow;
      opener?.focus({preventScroll: true});
    };
  }, [opener]);
  return <dialog ref={dialog} className={styles.viewer} aria-labelledby="design-preview-title" onCancel={onClose} onClick={event => {if (event.target === event.currentTarget) onClose();}}>
    <div className={styles.viewerPanel}>
      <header className={styles.viewerHeader}>
        <h2 id="design-preview-title">{work.title}</h2>
        <button type="button" onClick={onClose} aria-label="Close design preview" autoFocus><i className="ri-close-line" aria-hidden="true" /></button>
      </header>
      <div className={styles.mediaStage}>
        {!loaded && !failed && <p className={styles.mediaStatus} role="status">Loading preview…</p>}
        {failed && <p className={styles.mediaStatus} role="alert">This preview couldn’t load. Use “Open original” below to view the file.</p>}
        {work.type === 'video'
          ? <video controls playsInline preload="metadata" poster={work.poster} aria-label={work.title} onLoadedMetadata={() => setLoaded(true)} onError={() => setFailed(true)}><source src={work.src} type="video/mp4" />Your browser does not support this video.</video>
          : <img src={work.src} alt={work.title} onLoad={() => setLoaded(true)} onError={() => setFailed(true)} />}
      </div>
      <footer className={styles.viewerFooter}><span>{work.type === 'video' ? 'Interactive prototype walkthrough' : 'Original design'} · Esc to close</span><a href={work.src} target="_blank" rel="noopener noreferrer">Open original <span aria-hidden="true">↗</span></a></footer>
    </div>
  </dialog>;
}

export default function DesignsGallery() {
  const [selected, setSelected] = useState<DesignWork | null>(null);
  const [opener, setOpener] = useState<HTMLElement | null>(null);
  return <>
    <div className={styles.collectionBar}><p><strong>{DESIGNS.filter(work => work.type === 'image').length}</strong> designs <span aria-hidden="true">/</span> <strong>1</strong> prototype</p><span>Select a piece to explore</span></div>
    <div id="gallery" className={styles.gallery} data-analytics-section="designs/collection">
      {DESIGNS.map((work, index) => <button key={work.src} type="button" className={styles.work} aria-label={`View ${work.title}`} aria-haspopup="dialog" onClick={event => {setOpener(event.currentTarget); setSelected(work);}}>
        <span className={styles.preview}>
          {work.type === 'video'
            ? <><video muted playsInline preload="none" poster={work.poster} tabIndex={-1} aria-hidden="true"><source src={work.src} type="video/mp4" /></video><span className={styles.play}><i className="ri-play-fill" aria-hidden="true" />Prototype</span></>
            : <img src={thumbnail(work.src)} alt={work.title} loading={index < 3 ? 'eager' : 'lazy'} decoding="async" />}
          <span className={styles.expand} aria-hidden="true"><i className="ri-fullscreen-line" /></span>
        </span>
        <span className={styles.caption}><strong>{work.title}</strong><span>{String(index + 1).padStart(2, '0')}</span></span>
      </button>)}
    </div>
    {selected && <DesignViewer work={selected} opener={opener} onClose={() => setSelected(null)} />}
  </>;
}
