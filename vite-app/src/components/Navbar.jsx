import { NavLink, useLocation } from 'react-router-dom'
import { useState } from 'react'

const LINKS = [
  { to: '/',             label: 'Home',         icon: 'ri-home-5-line' },
  { to: '/about',        label: 'About',        icon: 'ri-user-line' },
  { to: '/projects',     label: 'Projects',     icon: 'ri-code-box-line' },
  { to: '/achievements', label: 'Achievements', icon: 'ri-trophy-line' },
  { to: '/articles',     label: 'Articles',     icon: 'ri-article-line' },
  { to: '/gallery',      label: 'Gallery',      icon: 'ri-image-line' },
  { to: '/games',        label: 'Games',        icon: 'ri-gamepad-line' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  // Don't show on home — home has its own full-screen nav
  if (location.pathname === '/') return null

  return (
    <>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" />

      {/* Desktop navbar */}
      <nav
        aria-label="Site navigation"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          background: 'rgba(15,18,30,0.80)',
          backdropFilter: 'blur(14px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center',
          padding: '0 1.25rem', height: '3.25rem',
          gap: '0.25rem',
        }}
      >
        {/* Logo */}
        <NavLink
          to="/"
          style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
        >
          <img
            src="https://arpitagarwala.online/assets/images/my-miniature.png"
            alt="AA"
            width={28} height={28}
            style={{ borderRadius: '50%', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))' }}
          />
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>Arpit</span>
        </NavLink>

        {/* Desktop links — hidden on mobile */}
        <div className="nav-desktop-links" style={{ display: 'flex', gap: '0.125rem', alignItems: 'center' }}>
          {LINKS.filter(l => l.to !== '/').map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.375rem 0.625rem', borderRadius: '0.5rem',
                fontSize: 'var(--text-xs)', fontWeight: 600,
                textDecoration: 'none',
                color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                background: isActive ? 'rgba(34,211,238,0.09)' : 'transparent',
                transition: 'all 160ms ease',
              })}
            >
              <i className={link.icon} style={{ fontSize: '0.875rem' }} />
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className="nav-hamburger"
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          style={{
            display: 'none',
            width: '2.25rem', height: '2.25rem', borderRadius: '0.5rem',
            alignItems: 'center', justifyContent: 'center',
            background: open ? 'rgba(34,211,238,0.1)' : 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.09)',
            color: 'var(--text)', transition: 'background 160ms ease',
          }}
        >
          <i className={open ? 'ri-close-line' : 'ri-menu-line'} style={{ fontSize: '1.125rem' }} />
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div
          style={{
            position: 'fixed', top: '3.25rem', left: 0, right: 0, zIndex: 99,
            background: 'rgba(15,18,30,0.97)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            padding: '0.75rem 1rem',
            display: 'flex', flexDirection: 'column', gap: '0.25rem',
          }}
        >
          {LINKS.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.625rem 0.75rem', borderRadius: '0.625rem',
                fontSize: 'var(--text-sm)', fontWeight: 600,
                textDecoration: 'none',
                color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                background: isActive ? 'rgba(34,211,238,0.09)' : 'transparent',
                transition: 'all 160ms ease',
              })}
            >
              <i className={link.icon} style={{ fontSize: '1rem' }} />
              {link.label}
            </NavLink>
          ))}
        </div>
      )}

      {/* Responsive: show hamburger on mobile, hide desktop links */}
      <style>{`
        @media (max-width: 640px) {
          .nav-desktop-links { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
        /* Push page content below fixed navbar on inner pages */
        .page-wrap { padding-top: 3.25rem; }
      `}</style>
    </>
  )
}
