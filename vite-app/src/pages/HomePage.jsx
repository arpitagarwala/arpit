import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import Footer from '../components/Footer';

function useClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

const NAV_ITEMS = [
  { to: '/projects', label: 'Projects', sub: 'Tools & experiments', iconClass: 'ri-code-box-line', iconColor: '#60a5fa', iconBg: 'rgba(96,165,250,0.1)', external: false },
  { to: 'https://design.arpitagarwala.online', label: 'Designs', sub: 'UI/UX & Figma work', iconClass: 'ri-palette-line', iconColor: '#e879f9', iconBg: 'rgba(232,121,249,0.1)', external: true },
  { to: '/achievements', label: 'Achievements', sub: 'Awards & milestones', iconClass: 'ri-trophy-line', iconColor: '#fbbf24', iconBg: 'rgba(251,191,36,0.1)', external: false },
  { to: '/games', label: 'Games', sub: 'Learn money, have fun', iconClass: 'ri-gamepad-line', iconColor: '#a78bfa', iconBg: 'rgba(167,139,250,0.1)', external: false },
  { to: '/about', label: 'About', sub: 'Who am I?', iconClass: 'ri-user-line', iconColor: '#2dd4bf', iconBg: 'rgba(45,212,191,0.1)', external: false },
  { to: '/gallery', label: 'Gallery', sub: 'Moments & memories', iconClass: 'ri-image-line', iconColor: '#f472b6', iconBg: 'rgba(244,114,182,0.1)', external: false },
];

const SOCIALS = [
  { href: 'https://wa.me/919957414146?text=Hi%20Arpit!%20I%20came%20across%20your%20portfolio%20at%20arpitagarwala.online%20and%20wanted%20to%20connect.', icon: 'ri-whatsapp-line', label: 'WhatsApp', color: '#34d399' },
  { href: 'https://www.instagram.com/arpit.agarwala_/', icon: 'ri-instagram-line', label: 'Instagram', color: '#f472b6' },
  { href: 'https://www.linkedin.com/in/arpitagarwala/', icon: 'ri-linkedin-line', label: 'LinkedIn', color: '#60a5fa' },
  { href: 'https://github.com/arpitagarwala', icon: 'ri-github-line', label: 'GitHub', color: '#e2e8f0' },
];

export default function HomePage() {
  const now = useClock();

  const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <>
      <SEOHead
        title="Arpit Agarwala – Portfolio | BCom Student, CA Aspirant & Web Creator"
        description="Personal portfolio of Arpit Agarwala – BCom (Hons) student, CA aspirant from Kolkata. Explore projects, tools, games, articles and achievements."
        canonical="https://arpitagarwala.online/"
      />

      <div className="page-wrap" style={{ alignItems: 'center' }}>
        <main
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(1, 1fr)',
            gap: '1rem',
            maxWidth: '64rem',
            width: '100%',
          }}
          className="home-grid"
        >

          {/* === HERO === */}
          <div className="card" style={{
            padding: '1.75rem',
            gridColumn: 'span 1',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: '-4rem', right: '-4rem',
              width: '18rem', height: '18rem',
              background: 'rgba(6,182,212,0.05)',
              borderRadius: '9999px', filter: 'blur(48px)',
              pointerEvents: 'none',
            }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="hero-inner">
              <img
                src="https://arpitagarwala.online/assets/images/my-miniature.png"
                alt="Arpit Agarwala"
                width="160" height="160"
                loading="lazy"
                style={{
                  width: '7rem', flexShrink: 0,
                  filter: 'drop-shadow(0 10px 24px rgba(0,0,0,0.55))',
                  position: 'relative', zIndex: 1,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.875rem' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                    fontSize: '0.75rem', fontWeight: 600,
                    padding: '0.375rem 0.75rem', borderRadius: '9999px',
                    background: 'rgba(6,182,212,0.1)', color: '#06b6d4',
                  }}>
                    <i className="ri-map-pin-line" /> Kolkata, India
                  </span>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                    fontSize: '0.75rem', fontWeight: 600,
                    padding: '0.375rem 0.75rem', borderRadius: '9999px',
                    background: 'rgba(52,211,153,0.1)', color: '#34d399',
                  }}>
                    <span style={{
                      width: '0.375rem', height: '0.375rem', borderRadius: '9999px',
                      background: '#34d399', animation: 'pulse 2s infinite',
                    }} />
                    Available
                  </span>
                </div>
                <h1 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', fontWeight: 800, marginBottom: '0.625rem', color: '#fff' }}>
                  Hello there! 👋
                </h1>
                <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: '#94a3b8', maxWidth: '52ch' }}>
                  I'm <strong style={{ color: '#e2e8f0' }}>Arpit Agarwala</strong> — BCom (Hons) student, CA
                  Intermediate aspirant, and builder of finance-first web tools. Cleared CA Foundation in Dec 2023,
                  currently in deep prep for Intermediate while shipping projects at the intersection of finance, tech,
                  and design.
                </p>
                <div style={{ marginTop: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <Link
                    to="/about"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                      padding: '0.625rem 1.25rem',
                      borderRadius: '0.5rem',
                      background: '#06b6d4', color: '#fff',
                      fontSize: '0.875rem', fontWeight: 600,
                      textDecoration: 'none',
                      boxShadow: '0 4px 14px rgba(6,182,212,0.2)',
                      transition: 'background 180ms ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#22d3ee'}
                    onMouseLeave={e => e.currentTarget.style.background = '#06b6d4'}
                  >
                    <i className="ri-user-smile-line" /> Who am I?
                  </Link>
                  <a
                    href="https://ca.arpitagarwala.online"
                    target="_blank" rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                      padding: '0.625rem 1.25rem',
                      borderRadius: '0.5rem',
                      border: '1px solid rgba(167,139,250,0.3)',
                      background: 'rgba(167,139,250,0.1)', color: '#a78bfa',
                      fontSize: '0.875rem', fontWeight: 600,
                      textDecoration: 'none',
                      transition: 'background 180ms ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(167,139,250,0.2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(167,139,250,0.1)'}
                  >
                    <i className="ri-robot-2-line" /> Try CA Bhaiya
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* === CLOCK === */}
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(6,182,212,0.05) 0%, transparent 60%)', pointerEvents: 'none' }} />
            <p className="label-caps" style={{ marginBottom: '0.75rem' }}>TIME IS MONEY 💸</p>
            <div style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)', fontWeight: 900, letterSpacing: '0.1em', fontFamily: 'monospace', color: '#06b6d4', fontVariantNumeric: 'tabular-nums' }}>
              {timeStr}
            </div>
            <p style={{ fontSize: '0.75rem', marginTop: '0.75rem', letterSpacing: '0.05em', color: '#475569' }}>{dateStr}</p>
          </div>

          {/* === PAGES NAV === */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <p className="label-caps" style={{ marginBottom: '0.75rem', paddingInline: '0.25rem' }}>Explore</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.375rem' }}>
              {NAV_ITEMS.map(item => (
                item.external ? (
                  <a
                    key={item.label}
                    href={item.to}
                    target="_blank" rel="noopener noreferrer"
                    className="nav-link"
                  >
                    <span className="nav-icon" style={{ background: item.iconBg }}>
                      <i className={item.iconClass} style={{ color: item.iconColor }} />
                    </span>
                    <div>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0' }}>{item.label}</p>
                      <p style={{ fontSize: '0.75rem', color: '#475569' }}>{item.sub}</p>
                    </div>
                    <i className="ri-arrow-right-up-line nav-arrow" style={{ color: '#475569' }} />
                  </a>
                ) : (
                  <Link key={item.label} to={item.to} className="nav-link">
                    <span className="nav-icon" style={{ background: item.iconBg }}>
                      <i className={item.iconClass} style={{ color: item.iconColor }} />
                    </span>
                    <div>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0' }}>{item.label}</p>
                      <p style={{ fontSize: '0.75rem', color: '#475569' }}>{item.sub}</p>
                    </div>
                    <i className="ri-arrow-right-line nav-arrow" style={{ color: '#475569' }} />
                  </Link>
                )
              ))}
            </div>
          </div>

          {/* === SOCIALS === */}
          <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
            <a
              href="mailto:arpitagarwalms@gmail.com?subject=Hello%20Arpit!&body=Hi%20Arpit%2C%0A%0AI%20came%20across%20your%20portfolio%20(arpitagarwala.online)%20and%20wanted%20to%20reach%20out."
              style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', textDecoration: 'none' }}
              className="contact-row"
            >
              <div style={{ width: '2.75rem', height: '2.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '9999px', background: 'rgba(6,182,212,0.1)', flexShrink: 0 }}>
                <i className="ri-mail-send-line" style={{ fontSize: '1.125rem', color: '#06b6d4' }} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff' }}>Get in Touch</p>
                <p style={{ fontSize: '0.75rem', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>arpitagarwalms@gmail.com</p>
              </div>
              <i className="ri-arrow-right-up-line" style={{ fontSize: '0.875rem', color: '#475569' }} />
            </a>

            <div style={{ height: '1px', background: 'rgba(71,85,105,0.4)' }} />

            <div>
              <p className="label-caps" style={{ marginBottom: '0.625rem' }}>Find me on</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {SOCIALS.map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="nav-link">
                    <i className={s.icon} style={{ fontSize: '1rem', color: s.color }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1' }}>{s.label}</span>
                    <i className="ri-arrow-right-up-line nav-arrow" style={{ color: '#475569' }} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* === FOOTER === */}
          <div style={{ gridColumn: '1 / -1' }}>
            <Footer />
          </div>

        </main>
      </div>

      {/* Responsive grid styles injected via style tag */}
      <style>{`
        @media (min-width: 1024px) {
          .home-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
          .home-grid > .card:first-child { grid-column: span 2; }
          .home-grid > .card:nth-child(3) { grid-column: span 2; }
          .hero-inner { flex-direction: row-reverse !important; align-items: center !important; }
          .hero-inner img { width: 10rem !important; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </>
  );
}
