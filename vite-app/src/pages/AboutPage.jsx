import { Link } from 'react-router-dom'
import SEOHead from '../components/SEOHead'
import { useEffect, useRef } from 'react'

/* ── Data ── */
const STATS = [
  { val: '2+',   label: 'Internships' },
  { val: '40+',  label: 'Students Mentored' },
  { val: '\u20b910k+', label: 'Revenue Generated' },
  { val: 'CA',   label: 'Foundation Cleared' },
]

const CONNECT = [
  { href: 'mailto:arpitagarwalms@gmail.com?subject=Hello%20Arpit!&body=Hi%20Arpit%2C%0A%0AI%20came%20across%20your%20portfolio%20(arpitagarwala.online)%20and%20wanted%20to%20reach%20out.', icon: 'ri-mail-send-line',  color: '#22d3ee', label: 'arpitagarwalms@gmail.com' },
  { href: 'https://wa.me/919957414146?text=Hi%20Arpit!', target: '_blank', icon: 'ri-whatsapp-line',   color: '#34d399', label: 'WhatsApp' },
  { href: 'https://www.linkedin.com/in/arpitagarwala/', target: '_blank', icon: 'ri-linkedin-line',   color: '#60a5fa', label: 'linkedin.com/in/arpitagarwala' },
  { href: 'https://github.com/arpitagarwala',           target: '_blank', icon: 'ri-github-line',     color: '#cbd5e1', label: 'github.com/arpitagarwala' },
  { href: 'https://www.instagram.com/arpit.agarwala_/', target: '_blank', icon: 'ri-instagram-line',  color: '#f472b6', label: 'arpit.agarwala_' },
]

const EXPERIENCE = [
  {
    role: 'Operations Management Intern',
    period: 'May \u2013 Jul 2024',
    company: 'House of AC',
    companyColor: '#22d3ee',
    location: 'Kolkata',
    bulletColor: 'rgba(34,211,238,0.5)',
    bullets: [
      'Built automated invoicing system bridging HR and IT workflows, saving significant manual time',
      'Designed master product sheet with auto-generated unique IDs and duplicate prevention logic',
      'Integrated inventory system with purchase/sales automation and low-stock alert triggers',
    ],
  },
  {
    role: 'Business Development & Research Intern',
    period: 'May \u2013 Sep 2023',
    company: 'Younity.in',
    companyColor: '#67e8f9',
    location: 'Remote',
    bulletColor: 'rgba(34,211,238,0.5)',
    bullets: [
      'Created marketing strategies and led promotions for a 50,000+ learner online platform',
      'Generated \u20b910k+ revenue in Month 1 \u2014 surpassing 80% of all teammates',
      'Tenure extended an additional 3 months for exceptional contribution',
    ],
  },
  {
    role: 'Head Boy & IT Club Founder',
    period: 'Apr 2022 \u2013 Apr 2023',
    company: 'LK Singhania Education Centre',
    companyColor: '#fbbf24',
    location: 'Rajasthan',
    dotAmber: true,
    bulletColor: 'rgba(251,191,36,0.5)',
    bullets: [
      'Founded school IT Club \u2014 designed and ran workshops for 40+ students',
      'Covered Photoshop, Premiere Pro, Figma, Photography, Arduino, and Coding',
      'Led coordination for national and international online conferences',
    ],
  },
]

const EDUCATION = [
  { icon: 'ri-building-line',      iconBg: 'rgba(34,211,238,0.10)',  iconColor: '#22d3ee', title: 'Chartered Accountant \u2014 CA Intermediate', inst: 'ICAI \u00b7 2023 \u2013 2028',        instColor: '#22d3ee', sub: 'Foundation cleared Dec 2023 \u00b7 Currently preparing for Intermediate' },
  { icon: 'ri-graduation-cap-line', iconBg: 'rgba(139,92,246,0.10)', iconColor: '#a78bfa', title: 'BCom (Hons)',                                  inst: 'Bhawanipur Education Society College \u00b7 2023 \u2013 2027', instColor: '#a78bfa', sub: 'Commerce \u00b7 Kolkata, West Bengal' },
  { icon: 'ri-book-open-line',      iconBg: 'rgba(245,158,11,0.10)', iconColor: '#fbbf24', title: 'Class XII \u2014 Commerce',                   inst: 'LK Singhania Education Centre \u00b7 2018 \u2013 2023', instColor: '#fbbf24', sub: 'Rajasthan' },
]

const SKILLS = [
  { label: 'Financial Analysis',           pct: 90, delay: '0.1s' },
  { label: 'Excel & Automation',           pct: 88, delay: '0.2s' },
  { label: 'Web Design (Figma/HTML/CSS)',   pct: 82, delay: '0.3s' },
  { label: 'Operations Management',        pct: 80, delay: '0.4s' },
  { label: 'Stock Market (SMC/ICT)',        pct: 75, delay: '0.5s' },
  { label: 'Communication & Leadership',   pct: 85, delay: '0.6s' },
]

const TAGS = [
  { label: 'Accountancy',           bg: 'rgba(34,211,238,0.05)',   border: 'rgba(34,211,238,0.15)',  color: '#22d3ee' },
  { label: 'Front-End Dev',         bg: 'rgba(139,92,246,0.05)',   border: 'rgba(139,92,246,0.15)', color: '#a78bfa' },
  { label: 'Market Analysis',       bg: 'rgba(245,158,11,0.05)',   border: 'rgba(245,158,11,0.15)', color: '#fbbf24' },
  { label: 'Automation',            bg: 'rgba(52,211,153,0.05)',   border: 'rgba(52,211,153,0.15)', color: '#34d399' },
  { label: 'Photo & Video Editing', bg: 'rgba(244,114,182,0.05)',  border: 'rgba(244,114,182,0.15)',color: '#f472b6' },
  { label: 'Business Development',  bg: 'rgba(251,146,60,0.05)',   border: 'rgba(251,146,60,0.15)', color: '#fb923c' },
  { label: 'Leadership',            bg: 'rgba(148,163,184,0.08)',  border: 'rgba(148,163,184,0.20)',color: '#94a3b8' },
  { label: 'Workshop Facilitation', bg: 'rgba(45,212,191,0.05)',   border: 'rgba(45,212,191,0.15)', color: '#2dd4bf' },
]

/* ── Skill bar (animates on mount) ── */
function SkillBar({ label, pct, delay }) {
  const fillRef = useRef(null)
  useEffect(() => {
    const el = fillRef.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        el.style.transitionDelay = delay
        el.style.transform = 'scaleX(1)'
        obs.disconnect()
      }
    }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)' }}>{label}</span>
        <span style={{ fontSize: '0.625rem', color: 'var(--text-faint)' }}>{pct}%</span>
      </div>
      <div style={{ height: '5px', borderRadius: '99px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <div
          ref={fillRef}
          style={{
            height: '100%', borderRadius: '99px',
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #22d3ee, #818cf8)',
            transform: 'scaleX(0)', transformOrigin: 'left',
            transition: 'transform 1.1s cubic-bezier(0.16,1,0.3,1)',
          }}
        />
      </div>
    </div>
  )
}

/* ── Card wrapper ── */
function Card({ children, style }) {
  return (
    <div className="card" style={{ padding: '1.5rem', ...style }}>
      {children}
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <p style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: '0.875rem' }}>
      {children}
    </p>
  )
}

export default function AboutPage() {
  return (
    <>
      <SEOHead
        title="About"
        description="Learn about Arpit Agarwala \u2014 BCom student, CA Intermediate aspirant, and web developer from Kolkata."
        canonical="/about"
      />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" />

      {/* Fixed back button */}
      <div style={{ position: 'fixed', top: '1rem', left: '1rem', zIndex: 50 }}>
        <Link
          to="/"
          style={{
            width: '2.5rem', height: '2.5rem', display: 'flex', alignItems: 'center',
            justifyContent: 'center', borderRadius: '50%',
            background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: 'var(--text)', transition: 'background var(--transition)',
          }}
          aria-label="Back to home"
          onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
          onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.10)'}
        >
          <i className="ri-arrow-left-line" style={{ fontSize: '1.125rem' }} />
        </Link>
      </div>

      <div style={{ maxWidth: '64rem', margin: '0 auto', padding: '2.5rem 1rem 3rem' }}>
        {/* Page header */}
        <div className="fade-in" style={{ marginBottom: '2.5rem' }}>
          <h1 style={{
            fontSize: 'var(--text-2xl)', fontWeight: 900, lineHeight: 1.1,
            background: 'linear-gradient(135deg, #10b981, #22d3ee, #818cf8)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', marginBottom: '0.375rem'
          }}>
            Profile
          </h1>
          <div style={{ height: '3px', width: '4.5rem', background: 'linear-gradient(90deg,#10b981,#22d3ee)', borderRadius: '99px', marginBottom: '0.75rem' }} />
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', maxWidth: '32rem', lineHeight: 1.7 }}>
            The story, the mission, and the technical journey of Arpit Agarwala.
          </p>
        </div>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>

          {/* ── LEFT COLUMN ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Identity card */}
            <Card style={{ position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
              <div style={{ position: 'absolute', top: '-2.5rem', right: '-2.5rem', width: '12rem', height: '12rem', background: 'radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
              <img
                src="https://arpitagarwala.online/assets/images/my-miniature.png"
                alt="Arpit Agarwala" width={112} height={112} loading="eager"
                style={{ width: '7rem', margin: '0 auto 1rem', filter: 'drop-shadow(0 10px 24px rgba(0,0,0,0.6))' }}
              />
              <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: '#fff' }}>Arpit Agarwala</h2>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)', fontWeight: 600, marginTop: '0.25rem', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
                BCom (Hons) · CA Intermediate
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.375rem', marginBottom: '1rem' }}>
                <span className="badge" style={{ background: 'rgba(6,182,212,0.10)', color: '#22d3ee' }}>
                  <i className="ri-map-pin-line" /> Kolkata, India
                </span>
                <span className="badge" style={{ background: 'rgba(52,211,153,0.10)', color: '#34d399' }}>
                  <span className="pulse" style={{ width: '0.375rem', height: '0.375rem', borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
                  Available
                </span>
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                Born in Rajasthan, raised in Assam, building in Kolkata. Bridging finance, technology and leadership.
              </p>
            </Card>

            {/* Stats */}
            <Card>
              <SectionLabel>At a Glance</SectionLabel>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '0.5rem' }}>
                {STATS.map(s => (
                  <div key={s.label} style={{ background: 'rgba(34,211,238,0.04)', border: '1px solid rgba(34,211,238,0.11)', borderRadius: '0.8rem', padding: '1rem 0.75rem', textAlign: 'center' }}>
                    <p style={{ fontSize: 'var(--text-lg)', fontWeight: 900, color: 'var(--accent)' }}>{s.val}</p>
                    <p style={{ fontSize: '0.625rem', color: 'var(--text-faint)', marginTop: '0.25rem', fontWeight: 500 }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Connect */}
            <Card>
              <SectionLabel>Connect</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                {CONNECT.map(c => (
                  <a
                    key={c.href} href={c.href}
                    target={c.target || undefined} rel={c.target ? 'noopener noreferrer' : undefined}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem', borderRadius: '0.65rem', border: '1px solid transparent', transition: 'background var(--transition), border-color var(--transition)', color: 'inherit' }}
                    onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(34,211,238,0.2)' }}
                    onMouseOut={e => { e.currentTarget.style.background = ''; e.currentTarget.style.borderColor = 'transparent' }}
                  >
                    <i className={c.icon} style={{ fontSize: '1rem', color: c.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.label}</span>
                  </a>
                ))}
              </div>
            </Card>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Who I Am */}
            <Card>
              <SectionLabel>Who I Am</SectionLabel>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '0.75rem' }}>
                I'm a <strong style={{ color: 'var(--text)' }}>BCom (Hons) student at Bhawanipur Education Society College</strong> and a{' '}
                <strong style={{ color: 'var(--text)' }}>CA Intermediate candidate</strong> — on a focused mission to become a Chartered Accountant while building real-world tools at the intersection of finance and technology.
              </p>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '0.75rem' }}>
                Having cleared the <strong style={{ color: 'var(--accent)' }}>CA Foundation exam (Dec 2023)</strong>, I'm now deep in CA Intermediate preparation — running a structured high-intensity revision system built around Pareto analysis, speed learning, and zero-distraction focus blocks.
              </p>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 1.8 }}>
                Outside the books, I build web tools, analyse markets using SMC/ICT methodology, automate workflows in Excel, and train 6 days a week. My edge is the ability to bridge analytical rigour with practical execution.
              </p>
            </Card>

            {/* Experience */}
            <Card>
              <SectionLabel>Experience</SectionLabel>
              <div style={{ position: 'relative', paddingLeft: '2rem' }}>
                {/* Timeline line */}
                <div style={{ position: 'absolute', left: '1.05rem', top: '0.4rem', bottom: 0, width: '2px', background: 'linear-gradient(to bottom, rgba(34,211,238,0.35), rgba(34,211,238,0.03))' }} />

                {EXPERIENCE.map((exp, i) => (
                  <div key={i} style={{ position: 'relative', marginBottom: i < EXPERIENCE.length - 1 ? '1.75rem' : 0 }}>
                    {/* Dot */}
                    <div style={{ position: 'absolute', left: '-2rem', top: '0.25rem', width: '0.6rem', height: '0.6rem', borderRadius: '50%', background: exp.dotAmber ? '#fbbf24' : '#22d3ee', boxShadow: `0 0 7px ${exp.dotAmber ? 'rgba(251,191,36,0.45)' : 'rgba(34,211,238,0.5)'}`, flexShrink: 0 }} />

                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '0.25rem', marginBottom: '0.25rem' }}>
                      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text)' }}>{exp.role}</p>
                      <span style={{ fontSize: '0.625rem', fontWeight: 600, padding: '0.125rem 0.5rem', borderRadius: '9999px', background: 'rgba(30,36,51,0.8)', color: 'var(--text-faint)' }}>{exp.period}</span>
                    </div>
                    <p style={{ fontSize: 'var(--text-xs)', color: exp.companyColor, fontWeight: 600, marginBottom: '0.5rem' }}>{exp.company} · {exp.location}</p>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                      {exp.bullets.map((b, j) => (
                        <li key={j} style={{ display: 'flex', gap: '0.5rem', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                          <span style={{ color: exp.bulletColor, flexShrink: 0, marginTop: '0.15rem' }}>▸</span>
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Card>

            {/* Education */}
            <Card>
              <SectionLabel>Education</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {EDUCATION.map((e, i) => (
                  <>
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
                      <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.5rem', background: e.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <i className={e.icon} style={{ color: e.iconColor }} />
                      </div>
                      <div>
                        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text)' }}>{e.title}</p>
                        <p style={{ fontSize: 'var(--text-xs)', color: e.instColor, fontWeight: 600 }}>{e.inst}</p>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-faint)', marginTop: '0.25rem' }}>{e.sub}</p>
                      </div>
                    </div>
                    {i < EDUCATION.length - 1 && <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginLeft: '3.125rem' }} />}
                  </>
                ))}
              </div>
            </Card>

            {/* Skills */}
            <Card>
              <SectionLabel>Skills & Expertise</SectionLabel>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
                {SKILLS.map(s => <SkillBar key={s.label} {...s} />)}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                {TAGS.map(t => (
                  <span key={t.label} style={{ fontSize: '0.625rem', fontWeight: 600, padding: '0.25rem 0.625rem', borderRadius: '9999px', border: `1px solid ${t.border}`, background: t.bg, color: t.color }}>
                    {t.label}
                  </span>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '1rem', textAlign: 'center', padding: '0.875rem 1.5rem', borderRadius: 'var(--radius-2xl)', border: '1px solid var(--border)', background: 'rgba(30,36,51,0.5)', fontSize: 'var(--text-sm)', color: 'var(--text-faint)' }}>
          © 2026 Arpit Agarwala. Engineered with <span style={{ color: '#f87171' }}>❤️</span>
        </div>
      </div>

      {/* 2-column layout on lg */}
      <style>{`
        @media (min-width: 1024px) {
          .about-grid { grid-template-columns: 1fr 2fr !important; }
          .skills-2col { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      <script dangerouslySetInnerHTML={{ __html: `
        document.addEventListener('DOMContentLoaded', function() {
          var grid = document.querySelector('[data-about-grid]');
          if (grid) grid.className += ' about-grid';
          var sg = document.querySelector('[data-skills-grid]');
          if (sg) sg.className += ' skills-2col';
        });
      ` }} />
    </>
  )
}
