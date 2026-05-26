import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import SEOHead from '../components/SEOHead'
import { PROJECTS } from '../data/projects'

const ALL_CATS = ['All', ...new Set(PROJECTS.map(p => p.category))]

export default function ProjectsPage() {
  const [search, setSearch] = useState('')
  const [activecat, setActivecat] = useState('All')

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return PROJECTS.filter(p => {
      const matchCat = activecat === 'All' || p.category === activecat
      const matchQ = !q
        || p.title.toLowerCase().includes(q)
        || p.sub.toLowerCase().includes(q)
        || p.tags.some(t => t.toLowerCase().includes(q))
        || p.category.toLowerCase().includes(q)
      return matchCat && matchQ
    })
  }, [search, activecat])

  return (
    <>
      <SEOHead
        title="Projects"
        description="Browse projects by Arpit Agarwala — SIP calculator, budget tracker, expense splitter, and more."
        canonical="/projects"
      />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" />

      {/* Background blobs */}
      <div className="bg-blob" style={{ top: -200, left: -200, background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)', width: 600, height: 600, position: 'fixed', borderRadius: '50%', pointerEvents: 'none', zIndex: 0 }} />
      <div className="bg-blob" style={{ bottom: -200, right: -200, background: 'radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)', width: 600, height: 600, position: 'fixed', borderRadius: '50%', pointerEvents: 'none', zIndex: 0 }} />

      {/* Back button */}
      <div style={{ position: 'fixed', top: '1rem', left: '1rem', zIndex: 50 }}>
        <Link
          to="/"
          style={{
            width: '2.5rem', height: '2.5rem', display: 'flex', alignItems: 'center',
            justifyContent: 'center', borderRadius: '50%',
            background: 'rgba(30,41,59,0.7)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'var(--text)', transition: 'background 180ms ease',
          }}
          aria-label="Back to home"
          onMouseOver={e => e.currentTarget.style.background = 'rgba(30,41,59,0.95)'}
          onMouseOut={e => e.currentTarget.style.background = 'rgba(30,41,59,0.7)'}
        >
          <i className="ri-arrow-left-line" style={{ fontSize: '1.125rem' }} />
        </Link>
      </div>

      <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '2.5rem 1rem 3rem', position: 'relative', zIndex: 1 }}>

        {/* Page header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <h1 style={{
                fontSize: 'var(--text-2xl)', fontWeight: 900, lineHeight: 1.05,
                background: 'linear-gradient(135deg,#10b981,#22d3ee,#818cf8)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>Projects</h1>
              <div style={{ height: 3, width: 72, background: 'linear-gradient(90deg,#10b981,#22d3ee)', borderRadius: 99, marginTop: 6 }} />
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', maxWidth: '32rem', lineHeight: 1.7, paddingBottom: 4 }}>
              Finance tools, productivity apps, and interactive experiments — engineered with precision.
            </p>
          </div>

          {/* Search + count row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              fontSize: 'var(--text-xs)', fontWeight: 700, padding: '0.375rem 0.75rem',
              borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(30,41,59,0.5)', color: 'var(--text-faint)',
            }}>
              <i className="ri-rocket-2-fill" style={{ color: '#10b981' }} />
              {PROJECTS.length} Tools Total
            </div>

            <div style={{ position: 'relative', flex: '1', maxWidth: '22rem' }}>
              <i className="ri-search-line" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontSize: 'var(--text-sm)', color: 'var(--text-faint)', pointerEvents: 'none' }} />
              <input
                type="text" value={search}
                placeholder="Search projects archive..."
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', paddingLeft: '2.25rem', paddingRight: search ? '2rem' : '0.75rem',
                  paddingBlock: '0.625rem', borderRadius: '0.75rem',
                  border: `1px solid ${search ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.10)'}`,
                  background: 'rgba(30,41,59,0.8)', color: 'var(--text)',
                  fontSize: 'var(--text-sm)', outline: 'none',
                  transition: 'border-color 180ms ease',
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  style={{ position: 'absolute', right: '0.625rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  aria-label="Clear search"
                >
                  <i className="ri-close-line" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {ALL_CATS.map(cat => {
            const isActive = activecat === cat
            return (
              <button
                key={cat}
                onClick={() => setActivecat(cat)}
                style={{
                  padding: '0.375rem 1rem', borderRadius: '9999px',
                  fontSize: 'var(--text-xs)', fontWeight: 700, cursor: 'pointer',
                  border: `1px solid ${isActive ? 'rgba(16,185,129,0.45)' : 'rgba(255,255,255,0.10)'}`,
                  background: isActive ? 'rgba(16,185,129,0.12)' : 'rgba(30,41,59,0.5)',
                  color: isActive ? '#10b981' : 'var(--text-muted)',
                  transition: 'all 180ms ease',
                }}
              >{cat}</button>
            )
          })}
        </div>

        {/* Projects grid */}
        {filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', textAlign: 'center' }}>
            <i className="ri-search-eye-line" style={{ fontSize: '2.5rem', marginBottom: '0.75rem', color: 'var(--text-faint)' }} />
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>No projects found.</h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-faint)', marginBottom: '0.75rem' }}>Try a different filter or search.</p>
            <button onClick={() => { setSearch(''); setActivecat('All') }} style={{ fontSize: 'var(--text-sm)', color: '#10b981', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}>Clear</button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(160px, 100%), 1fr))',
            gap: '0.625rem',
          }}>
            {filtered.map((p, i) => (
              <ProjectCard key={p.href} project={p} index={i} />
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: '2rem', textAlign: 'center', padding: '0.875rem 1.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(30,41,59,0.5)', fontSize: 'var(--text-sm)', color: 'var(--text-faint)' }}>
          &copy; 2026 Arpit Agarwala. Engineered with <span style={{ color: '#f87171' }}>❤️</span>
        </div>
      </div>
    </>
  )
}

function ProjectCard({ project: p, index }) {
  const [hovered, setHovered] = useState(false)

  // Project pages are still vanilla HTML — open them directly
  const isExternal = !p.href.startsWith('/projects/')
  const dest = p.externalHref  // always route to the original HTML page for now

  return (
    <a
      href={dest}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        padding: '1.25rem 0.75rem', borderRadius: '1rem',
        border: `1px solid ${hovered ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.08)'}`,
        background: hovered ? 'rgba(16,185,129,0.05)' : 'rgba(30,41,59,0.45)',
        backdropFilter: 'blur(8px)',
        transition: 'all 220ms cubic-bezier(0.16,1,0.3,1)',
        boxShadow: hovered ? '0 8px 32px rgba(16,185,129,0.12)' : '0 1px 4px rgba(0,0,0,0.2)',
        animationDelay: `${index * 40}ms`,
        color: 'inherit', textDecoration: 'none',
      }}
      onMouseOver={() => setHovered(true)}
      onMouseOut={() => setHovered(false)}
    >
      <div style={{
        width: '3.5rem', height: '3.5rem', borderRadius: '0.875rem',
        background: p.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.35)', marginBottom: '1rem',
        transform: hovered ? 'scale(1.1) rotate(3deg)' : 'scale(1) rotate(0deg)',
        transition: 'transform 300ms cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        <i className={p.icon} style={{ fontSize: '1.375rem', color: '#fff' }} />
      </div>
      <h2 style={{ fontSize: 'var(--text-xs)', fontWeight: 700, lineHeight: 1.3, color: 'var(--text)', marginBottom: '0.25rem' }}>{p.title}</h2>
      <p style={{ fontSize: '0.625rem', lineHeight: 1.5, color: 'var(--text-faint)' }}>{p.sub}</p>
    </a>
  )
}
