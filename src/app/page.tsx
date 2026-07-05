import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Footer/Footer';
import Clock from './Clock';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Arpit Agarwala – Portfolio | BCom Student, CA Aspirant & Web Creator',
  description:
    'Personal portfolio of Arpit Agarwala – BCom (Hons) student, CA aspirant from Kolkata. Explore projects, tools, games and achievements.',
  alternates: { canonical: 'https://arpitagarwala.online/' },
};

const NAV_LINKS = [
  { href: '/projects', icon: 'ri-code-box-line', iconBg: styles.iconBlue, label: 'Projects', sub: 'Tools & experiments', external: false },
  { href: '/gallery', icon: 'ri-image-line', iconBg: styles.iconPink, label: 'Gallery', sub: 'Moments & memories', external: false },
  { href: '/achievements', icon: 'ri-trophy-line', iconBg: styles.iconAmber, label: 'Achievements', sub: 'Awards & milestones', external: false },
  { href: '/games', icon: 'ri-gamepad-line', iconBg: styles.iconViolet, label: 'Games', sub: 'Learn money, have fun', external: false },
  { href: '/about', icon: 'ri-user-line', iconBg: styles.iconTeal, label: 'About', sub: 'Who am I?', external: false },
  { href: '/newsletter', icon: 'ri-newspaper-line', iconBg: styles.iconViolet, label: 'Newsletter', sub: 'Fintech Horizon', external: false },
  { href: 'https://design.arpitagarwala.online', icon: 'ri-palette-line', iconBg: styles.iconFuchsia, label: 'Designs', sub: 'UI/UX & Figma work', external: true },
];

export default function HomePage() {
  return (
    <main className={styles.main}>
      {/* Ambient blobs */}
      <div className="bg-blob" style={{ background: 'rgba(34,211,238,0.12)', top: '-200px', left: '-200px' }} />
      <div className="bg-blob" style={{ background: 'rgba(99,102,241,0.1)', bottom: '-200px', right: '-200px' }} />

      <div className={styles.grid}>

        {/* ── HERO ── */}
        <div className={`card ${styles.hero}`}>
          <div className={styles.heroBlobAccent} />
          <div className={styles.heroInner}>
            <img
              src="/assets/images/my-miniature.png"
              alt="Arpit Agarwala"
              className={styles.heroImage}
            />
            <div className={styles.heroContent}>
              <div className={styles.badges}>
                <span className={styles.badgeLocation}>
                  <i className="ri-map-pin-line" /> Kolkata, India
                </span>
                <span className={styles.badgeAvailable}>
                  <span className={`${styles.pulseDot} animate-pulse`} />
                  Available
                </span>
              </div>
              <h1 className={styles.heroTitle}>Hello there! 👋</h1>
              <p className={styles.heroDesc}>
                I&apos;m <strong>Arpit Agarwala</strong> — BCom (Hons) student, CA Intermediate
                aspirant, and builder of finance-first web tools. Cleared CA Foundation in Dec 2023,
                currently in deep prep for Intermediate while shipping projects at the intersection
                of finance, tech, and design.
              </p>
              <div className={styles.heroCTAs}>
                <Link href="/about" className={styles.ctaPrimary}>
                  <i className="ri-user-smile-line" /> Who am I?
                </Link>
                <a
                  href="https://ca.arpitagarwala.online"
                  target="_blank"
                  rel="noopener"
                  className={styles.ctaSecondary}
                >
                  <i className="ri-robot-2-line" /> Try CA Bhaiya
                </a>
                <a
                  href="https://vertex.arpitagarwala.online"
                  target="_blank"
                  rel="noopener"
                  className={styles.ctaSecondary}
                >
                  <i className="ri-bar-chart-box-line" /> Vertex App
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ── CLOCK ── */}
        <div className={`card ${styles.clockCard}`}>
          <div className={styles.clockBg} />
          <p className={styles.clockLabel}>TIME IS MONEY 💸</p>
          <Clock />
        </div>

        {/* ── NAV ── */}
        <div className={`card ${styles.navCard}`}>
          <p className={styles.sectionLabel}>Explore</p>
          <div className={styles.navGrid}>
            {NAV_LINKS.map((link) =>
              link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener"
                  className={`nav-link ${styles.navItem}`}
                >
                  <span className={`nav-icon ${link.iconBg}`}>
                    <i className={link.icon} />
                  </span>
                  <div>
                    <p className={styles.navLabel}>{link.label}</p>
                    <p className={styles.navSub}>{link.sub}</p>
                  </div>
                  <i className="ri-arrow-right-up-line nav-arrow" style={{ fontSize: '0.875rem', color: '#475569' }} />
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link ${styles.navItem}`}
                >
                  <span className={`nav-icon ${link.iconBg}`}>
                    <i className={link.icon} />
                  </span>
                  <div>
                    <p className={styles.navLabel}>{link.label}</p>
                    <p className={styles.navSub}>{link.sub}</p>
                  </div>
                  <i className="ri-arrow-right-line nav-arrow" style={{ fontSize: '0.875rem', color: '#475569' }} />
                </Link>
              )
            )}
          </div>
        </div>

        {/* ── SOCIALS ── */}
        <div className={`card ${styles.socialsCard}`}>
          <a
            href="mailto:arpitagarwalms@gmail.com?subject=Hello%20Arpit!&body=Hi%20Arpit%2C%0A%0AI%20came%20across%20your%20portfolio%20and%20wanted%20to%20reach%20out."
            className={styles.emailRow}
          >
            <div className={styles.emailIcon}>
              <i className="ri-mail-send-line" style={{ fontSize: '1.125rem', color: '#22d3ee' }} />
            </div>
            <div className={styles.emailContent}>
              <p className={styles.emailTitle}>Get in Touch</p>
              <p className={styles.emailAddr}>arpitagarwalms@gmail.com</p>
            </div>
            <i className="ri-arrow-right-up-line" style={{ fontSize: '0.875rem', color: '#475569' }} />
          </a>

          <div className={styles.divider} />

          <div>
            <p className={styles.sectionLabel}>Find me on</p>
            <div className={styles.socialsList}>
              {[
                {
                  href: 'https://wa.me/919957414146?text=Hi%20Arpit!%20I%20came%20across%20your%20portfolio%20and%20wanted%20to%20connect.',
                  icon: 'ri-whatsapp-line',
                  color: '#34d399',
                  label: 'WhatsApp',
                },
                {
                  href: 'https://www.instagram.com/arpit.agarwala_/',
                  icon: 'ri-instagram-line',
                  color: '#f472b6',
                  label: 'Instagram',
                },
                {
                  href: 'https://www.linkedin.com/in/arpitagarwala/',
                  icon: 'ri-linkedin-line',
                  color: '#60a5fa',
                  label: 'LinkedIn',
                },
                {
                  href: 'https://github.com/arpitagarwala',
                  icon: 'ri-github-line',
                  color: '#cbd5e1',
                  label: 'GitHub',
                },
              ].map((s) => (
                <a key={s.href} href={s.href} target="_blank" rel="noopener" className={`nav-link ${styles.socialRow}`}>
                  <i className={s.icon} style={{ fontSize: '1rem', color: s.color }} />
                  <span className={styles.socialLabel}>{s.label}</span>
                  <i className="ri-arrow-right-up-line nav-arrow" style={{ fontSize: '0.75rem', color: '#475569' }} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div className={styles.footerWrap}>
          <Footer />
        </div>

      </div>
    </main>
  );
}
