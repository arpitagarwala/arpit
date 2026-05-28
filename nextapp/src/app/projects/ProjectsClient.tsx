'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { PROJECTS } from '@/data/projects';
import styles from './page.module.css';

const ALL_CATS = ['All', 'Finance', 'Utility'];

const GRADIENT_MAP: Record<string, string> = {
  'from-indigo-600 to-violet-700': 'linear-gradient(135deg, #4f46e5, #6d28d9)',
  'from-violet-500 to-purple-600': 'linear-gradient(135deg, #8b5cf6, #9333ea)',
  'from-orange-500 to-red-500': 'linear-gradient(135deg, #f97316, #ef4444)',
  'from-slate-500 to-slate-700': 'linear-gradient(135deg, #64748b, #334155)',
  'from-slate-700 to-slate-900': 'linear-gradient(135deg, #334155, #0f172a)',
  'from-yellow-500 to-amber-500': 'linear-gradient(135deg, #eab308, #f59e0b)',
  'from-indigo-500 to-purple-600': 'linear-gradient(135deg, #6366f1, #9333ea)',
  'from-purple-500 to-indigo-600': 'linear-gradient(135deg, #a855f7, #4f46e5)',
  'from-gray-700 to-gray-900': 'linear-gradient(135deg, #374151, #111827)',
  'from-cyan-500 to-blue-600': 'linear-gradient(135deg, #06b6d4, #2563eb)',
  'from-cyan-400 to-blue-500': 'linear-gradient(135deg, #22d3ee, #3b82f6)',
};

export default function ProjectsClient() {
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return PROJECTS.filter((p) => {
      const matchCat = cat === 'All' || p.category === cat;
      const matchQ =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.sub.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [search, cat]);

  return (
    <>
      {/* Header */}
      <div className={`${styles.header} fade-up`}>
        <div className={styles.titleRow}>
          <div>
            <h1 className={styles.title}>Projects</h1>
            <div className={`${styles.underline} shimmer-underline`} />
          </div>
          <p className={styles.subtitle}>Finance tools, productivity apps, and interactive experiments — engineered with precision.</p>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.countBadge}>
            <i className="ri-rocket-2-fill" style={{color:'#34d399'}} />
            <span>{PROJECTS.length} Tools Total</span>
          </div>
          <div className={styles.searchWrap}>
            <i className="ri-search-line" style={{position:'absolute',left:'0.75rem',top:'50%',transform:'translateY(-50%)',color:'#64748b',fontSize:'0.875rem',pointerEvents:'none'}} />
            <input
              type="text"
              placeholder="Search projects archive..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
            {search && (
              <button onClick={() => setSearch('')} className={styles.clearBtn}>
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
          <p style={{fontSize:'0.875rem',color:'#64748b',marginBottom:'0.75rem'}}>Try a different filter or search.</p>
          <button onClick={() => { setSearch(''); setCat('All'); }} style={{fontSize:'0.875rem',color:'#34d399',background:'none',border:'none',cursor:'pointer',textDecoration:'underline'}}>Clear</button>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((p, i) => (
            <Link
              key={p.href}
              href={p.href}
              className={`stagger-item ${styles.card}`}
              style={{'--delay': `${i * 50}ms`} as React.CSSProperties}
            >
              <div className={styles.cardIcon} style={{background: GRADIENT_MAP[p.gradient] ?? 'linear-gradient(135deg, #3b82f6, #8b5cf6)'}}>
                <div className={styles.iconInner}>
                  <i className={p.icon} style={{fontSize:'1.5rem',color:'#fff'}} />
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
