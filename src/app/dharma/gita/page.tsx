import type { Metadata } from 'next';
import Link from 'next/link';
import BackButton from '@/components/BackButton/BackButton';
import BgBlobs from '@/components/BgBlobs/BgBlobs';
import Footer from '@/components/Footer/Footer';
import { GITA_CHAPTERS } from '@/data/gita';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Bhagavad Gītā — All 18 Chapters | Arpit Agarwala',
  description:
    'Read the complete Bhagavad Gītā — all 18 chapters with Sanskrit shloka, IAST transliteration, and English meaning. Curated by Arpit Agarwala.',
  alternates: { canonical: 'https://arpitagarwala.online/dharma/gita' },
};

// Prominent chapter colour accents (cycling saffron/violet)
const CHAPTER_ACCENTS = [
  '#f59e0b','#fb923c','#7c3aed','#f59e0b','#a78bfa','#fb923c',
  '#f59e0b','#7c3aed','#fb923c','#f59e0b','#a78bfa','#fb923c',
  '#7c3aed','#f59e0b','#fb923c','#a78bfa','#f59e0b','#7c3aed',
];

export default function GitaIndexPage() {
  return (
    <div className={styles.wrap}>
      <BgBlobs color1="rgba(245,158,11,0.12)" color2="rgba(124,58,237,0.12)" />
      <BackButton />

      <div className={styles.inner}>
        <header className={styles.header}>
          <Link href="/dharma" className={styles.breadcrumb}>
            <i className="ri-arrow-left-s-line" /> Dharma
          </Link>
          <div className={styles.omSmall}>ॐ</div>
          <h1 className={styles.title}>Bhagavad Gītā</h1>
          <p className={styles.subtitle}>श्रीमद्भगवद्गीता</p>
          <p className={styles.desc}>
            The eternal dialogue between Arjuna and Śrī Krishna on the battlefield of Kurukṣetra.
            18 chapters · 700 verses · timeless wisdom.
          </p>

          <div className={styles.statsRow}>
            <div className={styles.stat}>
              <span className={styles.statNum}>18</span>
              <span className={styles.statLbl}>Chapters</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>700</span>
              <span className={styles.statLbl}>Verses</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>3</span>
              <span className={styles.statLbl}>Translators</span>
            </div>
          </div>
        </header>

        <div className={styles.chaptersGrid}>
          {GITA_CHAPTERS.map((ch, i) => {
            const accent = CHAPTER_ACCENTS[i];
            return (
              <Link
                key={ch.chapter}
                href={`/dharma/gita/${ch.chapter}`}
                className={styles.chapterCard}
              >
                <div className={styles.chNum} style={{ color: accent, borderColor: `${accent}40`, background: `${accent}10` }}>
                  {String(ch.chapter).padStart(2, '0')}
                </div>
                <div className={styles.chBody}>
                  <p className={styles.chSanskrit}>{ch.name}</p>
                  <h2 className={styles.chName}>{ch.nameTranslated}</h2>
                  <p className={styles.chEnglish}>{ch.nameEnglish}</p>
                  <p className={styles.chSummary}>{ch.summary.slice(0, 120)}…</p>
                </div>
                <div className={styles.chFooter}>
                  <span className={styles.chVerses} style={{ color: accent }}>
                    <i className="ri-book-2-line" /> {ch.versesCount} verses
                  </span>
                  <i className="ri-arrow-right-line" style={{ color: '#475569', fontSize: '0.875rem' }} />
                </div>
              </Link>
            );
          })}
        </div>

        <Footer />
      </div>
    </div>
  );
}
