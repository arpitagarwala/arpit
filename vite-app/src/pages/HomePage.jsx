import { Link } from 'react-router-dom'
import SEOHead from '../components/SEOHead'
import { useEffect, useState } from 'react'

/* ── Live clock hook ── */
function useClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

/* ── Nav items config ── */
const NAV_ITEMS = [
  { to: '/projects',     icon: 'ri-code-box-line',   color: 'blue',    label: 'Projects',     sub: 'Tools & experiments' },
  { to: '/gallery',      icon: 'ri-image-line',       color: 'pink',    label: 'Gallery',      sub: 'Moments & memories' },
  { to: '/achievements', icon: 'ri-trophy-line',      color: 'amber',   label: 'Achievements', sub: 'Awards & milestones' },
  { to: '/games',        icon: 'ri-gamepad-line',     color: 'violet',  label: 'Games',        sub: 'Learn money, have fun' },
  { to: '/about',        icon: 'ri-user-line',        color: 'teal',    label: 'About',        sub: 'Who am I?' },
]

const SOCIALS = [
  { href: 'https://wa.me/919957414146?text=Hi%20Arpit!%20I%20came%20across%20your%20portfolio%20at%20arpitagarwala.online%20and%20wanted%20to%20connect.', icon: 'ri-whatsapp-line',  color: '#34d399', label: 'WhatsApp'  },
  { href: 'https://www.instagram.com/arpit.agarwala_/',                                                                                                    icon: 'ri-instagram-line', color: '#f472b6', label: 'Instagram' },
  { href: 'https://www.linkedin.com/in/arpitagarwala/',                                                                                                    icon: 'ri-linkedin-line',  color: '#60a5fa', label: 'LinkedIn'  },
  { href: 'https://github.com/arpitagarwala',                                                                                                              icon: 'ri-github-line',    color: '#cbd5e1', label: 'GitHub'    },
]

const COLOR_MAP = {
  blue:   { bg: 'rgba(59,130,246,0.10)',  text: '#60a5fa' },
  pink:   { bg: 'rgba(236,72,153,0.10)',  text: '#f472b6' },
  amber:  { bg: 'rgba(245,158,11,0.10)',  text: '#fbbf24' },
  violet: { bg: 'rgba(139,92,246,0.10)',  text: '#a78bfa' },
  teal:   { bg: 'rgba(20,184,166,0.10)',  text: '#2dd4bf' },
  fuchsia:{ bg: 'rgba(217,70,239,0.10)',  text: '#e879f9' },
}

export default function HomePage() {
  const now = useClock()

  const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <>
      <SEOHead
        title={null}
        description="Personal portfolio of Arpit Agarwala – BCom (Hons) student, CA aspirant from Kolkata. Explore projects, tools, games, articles and achievements."
        canonical="/"
      />

      {/* Remix Icons CDN */}
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" />

      <div className="page-wrap">
        <div className="page-grid">

          {/* ── HERO ── */}
          <div className="card p-7 fade-in" style={{ gridColumn: 'span 1' }} data-lg-col="span 2">
            <div style={{ position: 'relative', overflow: 'hidden' }}>
              {/* Glow blob */}
              <div style={{
                position: 'absolute', top: '-4rem', right: '-4rem',
                width: '18rem', height: '18rem',
                background: 'radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)',
                borderRadius: '50%', pointerEvents: 'none'
              }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Top row: avatar + text */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-start' }}>
                  <img
                    src="https://arpitagarwala.online/assets/images/my-miniature.png"
                    alt="Arpit Agarwala"
                    width={140} height={140}
                    loading="eager"
                    style={{ width: '8.5rem', flexShrink: 0, filter: 'drop-shadow(0 10px 24px rgba(0,0,0,0.55))', position: 'relative', zIndex: 1 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Badges */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.875rem' }}>
                      <span className="badge" style={{ background: 'rgba(6,182,212,0.10)', color: '#22d3ee' }}>
                        <i className="ri-map-pin-line" /> Kolkata, India
                      </span>
                      <span className="badge" style={{ background: 'rgba(52,211,153,0.10)', color: '#34d399' }}>
                        <span className="pulse" style={{ width: '0.375rem', height: '0.375rem', borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
                        Available
                      </span>
                    </div>

                    <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, lineHeight: 1.15, color: '#fff', marginBottom: '0.625rem' }}>
                      Hello there! 👋
                    </h1>
                    <p style={{ fontSize: 'var(--text-sm)', lineHeight: 1.7, color: 'var(--text-muted)' }}>
                      I'm <strong style={{ color: 'var(--text)' }}>Arpit Agarwala</strong> — BCom (Hons) student,
                      CA Intermediate aspirant, and builder of finance-first web tools. Cleared CA Foundation in Dec 2023,
                      currently in deep prep for Intermediate while shipping projects at the intersection of finance, tech, and design.
                    </p>

                    {/* CTAs */}
                    <div style={{ marginTop: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <Link to="/about" className="btn btn-primary">
                        <i className="ri-user-smile-line" /> Who am I?
                      </Link>
                      <a
                        href="https://ca.arpitagarwala.online"
                        target="_blank" rel="noopener noreferrer"
                        className="btn btn-ghost"
                      >
                        <i className="ri-robot-2-line" /> Try CA Bhaiya
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── CLOCK ── */}
          <div className="card p-6 fade-in fade-in-d1" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(135deg, rgba(6,182,212,0.05) 0%, transparent 60%)',
              pointerEvents: 'none'
            }} />
            <p style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '0.75rem', color: 'var(--text-faint)' }}>
              TIME IS MONEY 💸
            </p>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', fontWeight: 900, letterSpacing: '0.1em', color: 'var(--accent)', lineHeight: 1 }}>
              {timeStr}
            </div>
            <p style={{ fontSize: 'var(--text-xs)', marginTop: '0.75rem', letterSpacing: '0.04em', color: 'var(--text-faint)' }}>
              {dateStr}
            </p>
          </div>

          {/* ── PAGES NAV ── */}
          <div className="card p-5 fade-in fade-in-d2" style={{ gridColumn: 'span 1' }} data-lg-col="span 2">
            <p style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.75rem', paddingInline: '0.25rem', color: 'var(--text-faint)' }}>
              Explore
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.375rem' }}>
              {NAV_ITEMS.map(item => {
                const c = COLOR_MAP[item.color]
                return (
                  <Link key={item.to} to={item.to} className="nav-link">
                    <span className="nav-icon" style={{ background: c.bg }}>
                      <i className={item.icon} style={{ color: c.text }} />
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)' }}>{item.label}</p>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-faint)' }}>{item.sub}</p>
                    </div>
                    <i className="ri-arrow-right-line nav-arrow" />
                  </Link>
                )
              })}

              {/* External: Designs */}
              <a href="https://design.arpitagarwala.online" target="_blank" rel="noopener noreferrer" className="nav-link">
                <span className="nav-icon" style={{ background: COLOR_MAP.fuchsia.bg }}>
                  <i className="ri-palette-line" style={{ color: COLOR_MAP.fuchsia.text }} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)' }}>Designs</p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-faint)' }}>UI/UX & Figma work</p>
                </div>
                <i className="ri-arrow-right-up-line nav-arrow" />
              </a>
            </div>
          </div>

          {/* ── SOCIALS + CONTACT ── */}
          <div className="card p-6 fade-in fade-in-d3" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
            {/* Email */}
            <a
              href="mailto:arpitagarwalms@gmail.com?subject=Hello%20Arpit!&body=Hi%20Arpit%2C%0A%0AI%20came%20across%20your%20portfolio%20(arpitagarwala.online)%20and%20wanted%20to%20reach%20out."
              style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}
              className="nav-link"
            >
              <div style={{ width: '2.75rem', height: '2.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', flexShrink: 0, background: 'var(--accent-dim)' }}>
                <i className="ri-mail-send-line" style={{ fontSize: '1.125rem', color: 'var(--accent)' }} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text)' }}>Get in Touch</p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-faint)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>arpitagarwalms@gmail.com</p>
              </div>
              <i className="ri-arrow-right-up-line nav-arrow" />
            </a>

            <div style={{ height: '1px', background: 'var(--border)' }} />

            {/* Socials */}
            <div>
              <p style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.625rem', color: 'var(--text-faint)' }}>
                Find me on
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {SOCIALS.map(s => (
                  <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer" className="nav-link">
                    <i className={s.icon} style={{ fontSize: '1rem', color: s.color }} />
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-muted)' }}>{s.label}</span>
                    <i className="ri-arrow-right-up-line nav-arrow" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* ── FOOTER ── */}
          <div className="fade-in fade-in-d4" style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '0.875rem 1.5rem',
            borderRadius: 'var(--radius-2xl)',
            border: '1px solid var(--border)',
            background: 'rgba(30,36,51,0.5)',
            fontSize: 'var(--text-sm)',
            color: 'var(--text-faint)'
          }}>
            © 2026 Arpit Agarwala. Engineered with <span style={{ color: '#f87171' }}>❤️</span>
          </div>

        </div>
      </div>

      {/* ── Responsive grid fix for lg: ── */}
      <style>{`
        @media (min-width: 1024px) {
          .page-grid > *:nth-child(1) { grid-column: span 2; }
          .page-grid > *:nth-child(3) { grid-column: span 2; }
        }
      `}</style>
    </>
  )
}
