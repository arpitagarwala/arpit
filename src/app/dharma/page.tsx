import type { Metadata } from 'next';
import Link from 'next/link';
import BackButton from '@/components/BackButton/BackButton';
import BgBlobs from '@/components/BgBlobs/BgBlobs';
import Footer from '@/components/Footer/Footer';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Dharma – Arpit Agarwala | Bhagavad Gītā & Hindu Panchang',
  description:
    'Explore the spiritual wing of Arpit Agarwala\'s website — read the Bhagavad Gītā with Sanskrit shloka and English meaning, and check the live Hindu Panchang.',
  alternates: { canonical: 'https://arpitagarwala.online/dharma' },
};

const FEATURES = [
  {
    href: '/dharma/gita',
    icon: 'ri-book-open-line',
    label: 'Bhagavad Gītā',
    sub: '18 Chapters · 700 Verses',
    desc: 'Read the eternal song of the Lord — Sanskrit shloka, IAST transliteration, and English meaning for all 700 verses.',
    badge: '700 verses',
    gradient: 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(124,58,237,0.1) 100%)',
    accent: '#f59e0b',
  },
  {
    href: '/dharma/panchang',
    icon: 'ri-calendar-2-line',
    label: 'Hindu Panchang',
    sub: 'Live · Updates daily',
    desc: 'Today\'s Tithi, Nakshatra, Yoga, Karana, Sunrise, Sunset, Rahu Kalam and auspicious Muhurta — computed astronomically.',
    badge: 'Live',
    gradient: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(245,158,11,0.08) 100%)',
    accent: '#7c3aed',
  },
];

export default function DharmaPage() {
  return (
    <div className={styles.wrap}>
      <BgBlobs color1="rgba(245,158,11,0.12)" color2="rgba(124,58,237,0.12)" />
      <BackButton />

      <div className={styles.inner}>

        {/* ── HEADER ── */}
        <header className={styles.header}>
          <div className={styles.omSymbol}>ॐ</div>
          <h1 className={styles.title}>Dharma</h1>
          <p className={styles.subtitle}>
            धर्मो रक्षति रक्षितः — <em>Dharma protects those who protect it.</em>
          </p>
          <p className={styles.desc}>
            A space dedicated to Hindu scripture, Vedic wisdom and spiritual tools.
            Read the Bhagavad Gītā in its original Sanskrit glory, and plan your day
            with astronomically-accurate Panchang.
          </p>
        </header>

        {/* ── FEATURE CARDS ── */}
        <div className={styles.grid}>
          {FEATURES.map((f) => (
            <Link key={f.href} href={f.href} className={styles.featureCard} style={{ background: f.gradient }}>
              <div className={styles.cardTop}>
                <span className={styles.cardIcon} style={{ color: f.accent, background: `${f.accent}18` }}>
                  <i className={f.icon} />
                </span>
                <span className={styles.badge} style={{ color: f.accent, borderColor: `${f.accent}40`, background: `${f.accent}10` }}>
                  {f.badge}
                </span>
              </div>
              <h2 className={styles.cardTitle}>{f.label}</h2>
              <p className={styles.cardSub}>{f.sub}</p>
              <p className={styles.cardDesc}>{f.desc}</p>
              <span className={styles.cardCta} style={{ color: f.accent }}>
                Explore <i className="ri-arrow-right-line" />
              </span>
            </Link>
          ))}

          {/* Coming Soon placeholder */}
          <div className={styles.comingSoon}>
            <span className={styles.csIcon}><i className="ri-seedling-line" /></span>
            <p className={styles.csLabel}>More Dharma Content</p>
            <p className={styles.csSub}>Stotras, Vedic Calendar, Mythology — coming soon</p>
          </div>
        </div>

        {/* ── MISSION NOTE ── */}
        <div className={styles.mission}>
          <i className="ri-heart-3-line" style={{ color: '#f59e0b', fontSize: '1.1rem' }} />
          <p>
            This section is built with the intention of making sacred Hindu texts and Vedic
            knowledge accessible to everyone, freely and beautifully. If it helps even one
            person connect with the Gita or plan their day better — it has served its purpose.
          </p>
        </div>

        <Footer />
      </div>
    </div>
  );
}
