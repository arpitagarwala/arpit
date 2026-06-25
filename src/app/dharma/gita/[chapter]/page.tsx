import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import BackButton from '@/components/BackButton/BackButton';
import BgBlobs from '@/components/BgBlobs/BgBlobs';
import Footer from '@/components/Footer/Footer';
import { GITA_CHAPTERS, getChapter } from '@/data/gita';
import styles from './page.module.css';

interface Props {
  params: Promise<{ chapter: string }>;
}

export async function generateStaticParams() {
  return GITA_CHAPTERS.map(ch => ({ chapter: String(ch.chapter) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { chapter } = await params;
  const ch = getChapter(Number(chapter));
  if (!ch) return {};
  return {
    title: `Chapter ${ch.chapter}: ${ch.nameTranslated} — Bhagavad Gītā | Arpit Agarwala`,
    description: ch.summary.slice(0, 155),
    alternates: { canonical: `https://arpitagarwala.online/dharma/gita/${ch.chapter}` },
  };
}

export default async function ChapterPage({ params }: Props) {
  const { chapter } = await params;
  const ch = getChapter(Number(chapter));
  if (!ch) notFound();

  const prevCh = ch.chapter > 1 ? getChapter(ch.chapter - 1) : null;
  const nextCh = ch.chapter < 18 ? getChapter(ch.chapter + 1) : null;

  return (
    <div className={styles.wrap}>
      <BgBlobs color1="rgba(245,158,11,0.1)" color2="rgba(124,58,237,0.1)" />
      <BackButton />

      <div className={styles.inner}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link href="/dharma">Dharma</Link>
          <i className="ri-arrow-right-s-line" />
          <Link href="/dharma/gita">Bhagavad Gītā</Link>
          <i className="ri-arrow-right-s-line" />
          <span>Chapter {ch.chapter}</span>
        </nav>

        {/* Chapter Header */}
        <header className={styles.chHeader}>
          <div className={styles.chNum}>Chapter {ch.chapter}</div>
          <p className={styles.chSanskrit}>{ch.name}</p>
          <h1 className={styles.chTitle}>{ch.nameTranslated}</h1>
          <p className={styles.chSubtitle}>{ch.nameEnglish}</p>
          <p className={styles.chSummary}>{ch.summary}</p>
          <div className={styles.chMeta}>
            <span><i className="ri-book-2-line" /> {ch.versesCount} verses</span>
          </div>
        </header>

        {/* Verse List */}
        <div className={styles.verseList}>
          <h2 className={styles.listTitle}>Verses</h2>
          <div className={styles.versesGrid}>
            {ch.verses.map(v => (
              <Link
                key={v.verse}
                href={`/dharma/gita/${ch.chapter}/${v.verse}`}
                className={styles.verseCard}
              >
                <div className={styles.vNum}>{ch.chapter}.{v.verse}</div>
                <div className={styles.vPreview}>
                  <p className={styles.vSanskrit}>
                    {v.sanskrit.split('\n')[0].replace(/\|.*$/, '').trim()}
                  </p>
                  <p className={styles.vMeaning}>
                    {v.meaning.slice(0, 90)}{v.meaning.length > 90 ? '…' : ''}
                  </p>
                </div>
                <i className="ri-arrow-right-s-line" style={{ color: '#475569', flexShrink: 0 }} />
              </Link>
            ))}
          </div>
        </div>

        {/* Chapter Navigation */}
        <div className={`${styles.chapterNav} ${!prevCh ? styles.chapterNavEnd : ''} ${!nextCh ? styles.chapterNavEnd : ''}`}>
          {prevCh && (
            <Link href={`/dharma/gita/${prevCh.chapter}`} className={styles.navBtn}>
              <i className="ri-arrow-left-line" style={{ color: '#f59e0b', flexShrink: 0 }} />
              <span>
                <small className={styles.navLabel}>← Previous Chapter</small>
                <strong>Chapter {prevCh.chapter}: {prevCh.nameTranslated}</strong>
              </span>
            </Link>
          )}
          {nextCh && (
            <Link href={`/dharma/gita/${nextCh.chapter}`} className={`${styles.navBtn} ${styles.navBtnRight}`}>
              <span>
                <small className={styles.navLabel}>Next Chapter →</small>
                <strong>Chapter {nextCh.chapter}: {nextCh.nameTranslated}</strong>
              </span>
              <i className="ri-arrow-right-line" style={{ color: '#f59e0b', flexShrink: 0 }} />
            </Link>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
}
