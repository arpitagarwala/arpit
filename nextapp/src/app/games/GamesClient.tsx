'use client';

import { useState, useMemo } from 'react';
import { GAMES } from '@/data/games';
import styles from '../projects/page.module.css';

const ALL_GENRES = ['All', 'Puzzle', 'Arcade', 'Simulation', 'Memory', 'Idle', 'ASMR', 'Classic'];

// Gradient map for game icons (CSS-compatible from Tailwind color names)
const GRADIENT_MAP: Record<string, string> = {
  'from-orange-400 to-amber-500': 'linear-gradient(135deg, #fb923c, #f59e0b)',
  'from-slate-500 to-blue-900': 'linear-gradient(135deg, #64748b, #1e3a5f)',
  'from-blue-600 to-indigo-800': 'linear-gradient(135deg, #2563eb, #3730a3)',
  'from-cyan-500 to-blue-600': 'linear-gradient(135deg, #06b6d4, #2563eb)',
  'from-violet-500 to-purple-600': 'linear-gradient(135deg, #8b5cf6, #9333ea)',
  'from-amber-400 to-orange-500': 'linear-gradient(135deg, #fbbf24, #f97316)',
  'from-fuchsia-600 to-purple-600': 'linear-gradient(135deg, #c026d3, #9333ea)',
  'from-blue-400 to-cyan-500': 'linear-gradient(135deg, #60a5fa, #06b6d4)',
  'from-emerald-400 to-green-600': 'linear-gradient(135deg, #34d399, #16a34a)',
  'from-teal-400 to-emerald-500': 'linear-gradient(135deg, #2dd4bf, #10b981)',
  'from-emerald-500 to-teal-600': 'linear-gradient(135deg, #10b981, #0d9488)',
};

export default function GamesClient() {
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('All');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return GAMES.filter((g) => {
      const matchGenre = genre === 'All' || g.genre === genre;
      const matchQ =
        !q ||
        g.title.toLowerCase().includes(q) ||
        g.sub.toLowerCase().includes(q) ||
        g.tags.some((t) => t.toLowerCase().includes(q)) ||
        g.genre.toLowerCase().includes(q);
      return matchGenre && matchQ;
    });
  }, [search, genre]);

  return (
    <>
      {/* Header */}
      <div className={`${styles.header} fade-up`}>
        <div className={styles.titleRow}>
          <div>
            <h1 className={styles.title}>Games</h1>
            <div className={`${styles.underline} shimmer-underline`} />
          </div>
          <p className={styles.subtitle}>
            Fully playable browser games — classics rebuilt with physics, AI, and neon aesthetics.
          </p>
        </div>
        <div className={styles.toolbar}>
          <div className={styles.countBadge}>
            <i className="ri-gamepad-fill" style={{ color: '#22d3ee' }} />
            <span>{GAMES.length} Titles Total</span>
          </div>
          <div className={styles.searchWrap}>
            <i
              className="ri-search-line"
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b',
                fontSize: '0.875rem',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              placeholder="Search games archive..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
            {search && (
              <button onClick={() => setSearch('')} className={styles.clearBtn}>
                <i className="ri-close-line" style={{ fontSize: '0.875rem' }} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Genre filters */}
      <div className={styles.filters}>
        {ALL_GENRES.map((g) => (
          <button
            key={g}
            onClick={() => setGenre(g)}
            className={`${styles.chip} ${genre === g ? styles.chipActive : ''}`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <i
            className="ri-search-eye-line"
            style={{ fontSize: '2.5rem', color: '#475569', marginBottom: '0.75rem' }}
          />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.5rem' }}>
            No games found.
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.75rem' }}>
            Try a different filter or search.
          </p>
          <button
            onClick={() => { setSearch(''); setGenre('All'); }}
            style={{ fontSize: '0.875rem', color: '#22d3ee', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Clear
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((g, i) => (
            <a
              key={g.href}
              href={g.href}
              className={`stagger-item ${styles.card}`}
              style={{ '--delay': `${i * 50}ms` } as React.CSSProperties}
            >
              <div
                className={styles.cardIcon}
                style={{ background: GRADIENT_MAP[g.gradient] ?? 'linear-gradient(135deg,#22d3ee,#818cf8)' }}
              >
                <i className={g.icon} style={{ fontSize: '1.5rem', color: '#fff' }} />
              </div>
              <h2 className={styles.cardTitle}>{g.title}</h2>
              <p className={styles.cardSub}>{g.sub}</p>
            </a>
          ))}
        </div>
      )}
    </>
  );
}
