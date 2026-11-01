'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Project } from '@/data/projects';
import styles from './page.module.css';



export default function ProjectsClient({projects:PROJECTS}:{projects:Project[]}) {
  const ALL_CATS=['All',...new Set(PROJECTS.flatMap(p=>[p.category,p.financeCategory]).filter((c):c is string=>!!c))];
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return PROJECTS.filter((p) => {
      const matchCat = cat === 'All' || p.category === cat || p.financeCategory === cat;
      const matchQ =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.sub.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [search, cat, PROJECTS]);

  return (
    <>
      {/* Header */}
      <div className={`${styles.header} fade-up`}>
        <div className={styles.titleRow}>
          <div>
            <p className={styles.eyebrow}>THE PROJECT STUDIO · EXPLORE & CREATE</p>
            <h1 className={styles.title}>Projects<span>.</span></h1>
            <p className={styles.tagline}>Useful ideas. Thoughtfully built.</p>
          </div>
          <p className={styles.subtitle}>Plan your finances, make something useful, or sharpen a skill. Practical tools for the decisions and details of everyday life.</p>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.countBadge}>
            <i className="ri-rocket-2-fill" style={{color:'#e5c293'}} />
            <span>{PROJECTS.length} Tools Total</span>
          </div>
          <div className={styles.searchWrap}>
            <i className="ri-search-line" style={{position:'absolute',left:'0.75rem',top:'50%',transform:'translateY(-50%)',color:'#b9afa2',fontSize:'0.875rem',pointerEvents:'none'}} />
            <input
              aria-label="Search projects"
              type="text"
              placeholder="Search projects archive..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
            {search && (
              <button onClick={() => setSearch('')} className={styles.clearBtn} aria-label="Clear project search">
                <i className="ri-close-line" style={{fontSize:'0.875rem'}} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        {ALL_CATS.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            aria-pressed={cat === c}
            className={`${styles.chip} ${cat === c ? styles.chipActive : ''}`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <i className="ri-search-eye-line" style={{fontSize:'2.5rem',color:'#475569',marginBottom:'0.75rem'}} />
          <h3 style={{fontSize:'1.125rem',fontWeight:700,color:'#94a3b8',marginBottom:'0.5rem'}}>No projects found.</h3>
          <p style={{fontSize:'0.875rem',color:'#b9afa2',marginBottom:'0.75rem'}}>Try a different filter or search.</p>
          <button onClick={() => { setSearch(''); setCat('All'); }} style={{fontSize:'0.875rem',color:'#e5c293',background:'none',border:'none',cursor:'pointer',textDecoration:'underline'}}>Clear</button>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((p, i) => (
            <Link
              key={p.href}
              href={p.href}
              className={`stagger-item ${styles.card}`}
              style={{'--delay': `${Math.min(i, 10) * 50}ms`} as React.CSSProperties}
            >
              <div className={styles.cardIcon} >
                <div className={styles.iconInner}>
                  <i className={p.icon} style={{fontSize:'1.5rem'}} />
                </div>
              </div>
              <h2 className={styles.cardTitle}>{p.title}</h2>
              <p className={styles.cardSub}>{p.sub}</p>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
