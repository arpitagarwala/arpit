import { useState, useMemo, useCallback } from 'react';
import BackButton from '../components/BackButton';
import SEOHead from '../components/SEOHead';
import Footer from '../components/Footer';
import { ARTICLES } from '../data/articles';

const CATEGORIES = ['all', 'Taxation', 'Business', 'Technology'];

function ArticleCard({ article, onClick }) {
  return (
    <button
      className="card"
      onClick={() => onClick(article)}
      style={{ padding: '1.25rem', textAlign: 'left', cursor: 'pointer', width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem', border: '1px solid rgba(71,85,105,0.3)', transition: 'border-color 180ms ease' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(71,85,105,0.6)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(71,85,105,0.3)'}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: article.iconBg }}>
          <i className={article.icon} style={{ color: article.iconColor, fontSize: '1rem' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.375rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, padding: '0.1rem 0.5rem', borderRadius: '9999px', background: 'rgba(71,85,105,0.3)', color: '#94a3b8' }}>{article.category}</span>
            <span style={{ fontSize: '0.6875rem', color: '#475569' }}>{article.date}</span>
            <span style={{ fontSize: '0.6875rem', color: '#475569' }}>{article.readTime} min read</span>
          </div>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#f1f5f9', lineHeight: 1.35, marginBottom: '0.5rem' }}>{article.title}</h2>
          <p style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{article.summary}</p>
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
        {article.tags.slice(0, 4).map(tag => (
          <span key={tag} style={{ fontSize: '0.625rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '9999px', background: 'rgba(6,182,212,0.08)', color: '#22d3ee', border: '1px solid rgba(6,182,212,0.15)' }}>{tag}</span>
        ))}
      </div>
    </button>
  );
}

function Modal({ article, onClose }) {
  if (!article) return null;

  const handleBackdrop = (e) => { if (e.target === e.currentTarget) onClose(); };

  return (
    <div className="modal-backdrop" onClick={handleBackdrop} role="dialog" aria-modal="true" aria-label={article.title}>
      <div className="modal-box">
        <div className="modal-header">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.375rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, padding: '0.15rem 0.625rem', borderRadius: '9999px', background: 'rgba(71,85,105,0.4)', color: '#94a3b8' }}>{article.category}</span>
              <span style={{ fontSize: '0.6875rem', color: '#475569' }}>{article.date}</span>
              <span style={{ fontSize: '0.6875rem', color: '#475569' }}>{article.readTime} min read</span>
            </div>
            <h2 style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', fontWeight: 800, color: '#f1f5f9', lineHeight: 1.3 }}>{article.title}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close article"
            style={{ flexShrink: 0, width: '2rem', height: '2rem', borderRadius: '0.625rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(71,85,105,0.3)', color: '#94a3b8', border: 'none', cursor: 'pointer', transition: 'background 180ms ease' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(71,85,105,0.5)'; e.currentTarget.style.color = '#f1f5f9'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(71,85,105,0.3)'; e.currentTarget.style.color = '#94a3b8'; }}
          >
            <i className="ri-close-line" style={{ fontSize: '0.875rem' }} />
          </button>
        </div>
        <div className="modal-body" dangerouslySetInnerHTML={{ __html: article.content }} />
      </div>
    </div>
  );
}

export default function ArticlesPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [openArticle, setOpenArticle] = useState(null);

  const filtered = useMemo(() => {
    return ARTICLES.filter(a => {
      const matchCat = category === 'all' || a.category === category;
      const q = query.toLowerCase();
      const matchQ = !q || a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q) || a.tags.some(t => t.toLowerCase().includes(q));
      return matchCat && matchQ;
    });
  }, [query, category]);

  const handleClose = useCallback(() => setOpenArticle(null), []);

  return (
    <>
      <SEOHead
        title="Articles – Arpit Agarwala | Finance & Taxation Writings"
        description="Articles and writings by Arpit Agarwala on finance, taxation, and investing."
        canonical="https://arpitagarwala.online/articles"
      />
      <BackButton to="/" />

      {openArticle && <Modal article={openArticle} onClose={handleClose} />}

      <div className="page-wrap">
        <div className="page-content">

          {/* Header card */}
          <div className="card" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} className="articles-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                <div>
                  <p className="label-caps" style={{ marginBottom: '0.25rem' }}>Portfolio</p>
                  <h1 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <i className="ri-article-line" style={{ color: '#fb923c' }} />
                    Articles
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.1rem 0.5rem', borderRadius: '9999px', color: '#475569', background: 'rgba(71,85,105,0.3)' }}>{ARTICLES.length}</span>
                  </h1>
                </div>
              </div>
              {/* Search */}
              <div style={{ position: 'relative' }}>
                <i className="ri-search-line" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.875rem', color: '#475569', pointerEvents: 'none' }} />
                <input
                  type="text"
                  placeholder="Search articles…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="search-input"
                  style={{ paddingLeft: '2rem' }}
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    aria-label="Clear search"
                    style={{ position: 'absolute', right: '0.625rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#475569', cursor: 'pointer', padding: 0 }}
                  >
                    <i className="ri-close-circle-fill" style={{ fontSize: '0.875rem' }} />
                  </button>
                )}
              </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.375rem', marginTop: '0.875rem', paddingTop: '0.875rem', borderTop: '1px solid rgba(71,85,105,0.3)' }}>
              <span className="label-caps" style={{ marginRight: '0.125rem' }}>Filter:</span>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`art-filter${category === cat ? ' active' : ''}`}
                >
                  {cat === 'Taxation' && <i className="ri-scales-3-line" />}
                  {cat === 'Business' && <i className="ri-building-line" />}
                  {cat === 'Technology' && <i className="ri-cpu-line" />}
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
              {(query || category !== 'all') && (
                <span style={{ marginLeft: 'auto', fontSize: '0.625rem', fontWeight: 600, color: '#475569', fontVariantNumeric: 'tabular-nums' }}>
                  {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Articles grid */}
          {filtered.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1rem', marginBottom: '1rem' }} className="articles-grid">
              {filtered.map(a => <ArticleCard key={a.id} article={a} onClick={setOpenArticle} />)}
            </div>
          ) : (
            <div className="card" style={{ padding: '5rem 2rem', textAlign: 'center', marginBottom: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '3rem', height: '3rem', borderRadius: '0.75rem', background: 'rgba(71,85,105,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="ri-search-eye-line" style={{ fontSize: '1.25rem', color: '#475569' }} />
              </div>
              <p style={{ fontWeight: 600, color: '#94a3b8' }}>No articles found</p>
              <p style={{ fontSize: '0.8125rem', color: '#475569' }}>Try a different keyword or clear the filter.</p>
              <button
                onClick={() => { setQuery(''); setCategory('all'); }}
                style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#22d3ee', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Clear filters
              </button>
            </div>
          )}

          <Footer />
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .articles-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .articles-header { flex-direction: row !important; align-items: center !important; }
          .articles-header > div:last-child { width: 16rem; }
        }
      `}</style>
    </>
  );
}
