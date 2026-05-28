'use client';

import { useState, useEffect } from 'react';
import { PHOTOS } from '@/data/gallery';
import styles from './page.module.css';

export default function GalleryClient() {
  const [lbOpen, setLbOpen] = useState(false);
  const [lbIdx, setLbIdx] = useState(0);

  function openLightbox(idx: number) {
    setLbIdx(idx);
    setLbOpen(true);
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    setLbOpen(false);
    document.body.style.overflow = '';
  }

  function lbNav(dir: number) {
    setLbIdx((prev) => (prev + dir + PHOTOS.length) % PHOTOS.length);
  }

  useEffect(() => {
    if (!lbOpen) return;
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') lbNav(-1);
      else if (e.key === 'ArrowRight') lbNav(1);
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lbOpen]);

  const photo = PHOTOS[lbIdx];

  return (
    <>
      {/* Header */}
      <div className={`${styles.header} fade-up`}>
        <div className={styles.titleRow}>
          <div>
            <h1 className={styles.title}>Gallery</h1>
            <div className={`${styles.underline} shimmer-underline`} />
          </div>
          <p className={styles.subtitle}>Moments, milestones &amp; memories — a visual story of who I am beyond the code.</p>
        </div>
        <div className={styles.countBadge}>
          <i className="ri-camera-lens-fill" style={{color:'#f97316'}} />
          <span>{PHOTOS.length} Captures Total</span>
        </div>
      </div>

      {/* Masonry Grid */}
      <div className="masonry">
        {PHOTOS.map((p, i) => (
          <div key={i} className={`stagger-item masonry-item`} style={{'--delay': `${i * 100}ms`} as React.CSSProperties}>
            <div className="photo-card" onClick={() => openLightbox(i)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.thumb} alt={p.title} loading="lazy" />
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lbOpen && (
        <div className={styles.lightbox} onClick={(e) => { if (e.target === e.currentTarget) closeLightbox(); }}>
          <button className={styles.lbClose} onClick={closeLightbox} aria-label="Close">
            <i className="ri-close-line" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo.src} alt={photo.title} className={styles.lbImg} />
          <div className={styles.lbMeta}>
            <div className={styles.lbTitle}>{photo.title}</div>
            {photo.category && <div className={styles.lbSub}>{photo.category}</div>}
          </div>
          <div className={styles.lbNav}>
            <button className={styles.lbNavBtn} onClick={() => lbNav(-1)} aria-label="Previous">
              <i className="ri-arrow-left-s-line" />
            </button>
            <span className={styles.lbCaption}>{lbIdx + 1} / {PHOTOS.length}</span>
            <button className={styles.lbNavBtn} onClick={() => lbNav(1)} aria-label="Next">
              <i className="ri-arrow-right-s-line" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
