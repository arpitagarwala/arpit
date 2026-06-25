import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import BgBlobs from '@/components/BgBlobs/BgBlobs';
import BackButton from '@/components/BackButton/BackButton';
import Footer from '@/components/Footer/Footer';
import { GITA_CHAPTERS, getChapter, getVerse } from '@/data/gita';
import VerseReaderClient from './VerseReaderClient';
import styles from './page.module.css';

interface Props {
  params: Promise<{ chapter: string; verse: string }>;
}

export async function generateStaticParams() {
  const paths: { chapter: string; verse: string }[] = [];
  for (const ch of GITA_CHAPTERS) {
    for (const v of ch.verses) {
      paths.push({ chapter: String(ch.chapter), verse: String(v.verse) });
    }
  }
  return paths;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { chapter, verse } = await params;
  const ch = getChapter(Number(chapter));
  const v = getVerse(Number(chapter), Number(verse));
  if (!ch || !v) return {};
  return {
    title: `BG ${chapter}.${verse} — ${ch.nameTranslated} | Bhagavad Gītā | Arpit Agarwala`,
    description: v.meaning.slice(0, 155),
    alternates: { canonical: `https://arpitagarwala.online/dharma/gita/${chapter}/${verse}` },
  };
}

export default async function VersePage({ params }: Props) {
  const { chapter, verse } = await params;
  const chNum = Number(chapter);
  const vNum = Number(verse);

  const ch = getChapter(chNum);
  const v = getVerse(chNum, vNum);
  if (!ch || !v) notFound();

  // Prev/Next verse (across chapter boundaries)
  const prevVerse = vNum > 1
    ? { chapter: chNum, verse: vNum - 1 }
    : chNum > 1
      ? { chapter: chNum - 1, verse: (getChapter(chNum - 1)?.versesCount ?? 1) }
      : null;

  const nextVerse = vNum < ch.versesCount
    ? { chapter: chNum, verse: vNum + 1 }
    : chNum < 18
      ? { chapter: chNum + 1, verse: 1 }
      : null;

  const progress = Math.round(((vNum - 1) / ch.versesCount) * 100);

  return (
    <div className={styles.wrap}>
      <BgBlobs color1="rgba(245,158,11,0.08)" color2="rgba(124,58,237,0.08)" />
      <BackButton />

      <div className={styles.layout}>
        {/* ── SIDEBAR ── */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarInner}>
            <p className={styles.sidebarTitle}>
              <i className="ri-book-open-line" /> Chapter {chNum}
            </p>
            <p className={styles.sidebarChName}>{ch.nameTranslated}</p>

            {/* Progress */}
            <div className={styles.progressWrap}>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${progress}%` }} />
              </div>
              <span className={styles.progressTxt}>{vNum}/{ch.versesCount}</span>
            </div>

            <div className={styles.sidebarVerses}>
              {ch.verses.map(sv => (
                <Link
                  key={sv.verse}
                  href={`/dharma/gita/${chNum}/${sv.verse}`}
                  className={`${styles.sideVerse} ${sv.verse === vNum ? styles.sideVerseActive : ''}`}
                >
                  <span>{chNum}.{sv.verse}</span>
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className={styles.main}>
          {/* Breadcrumb */}
          <nav className={styles.breadcrumb}>
            <Link href="/dharma">Dharma</Link>
            <i className="ri-arrow-right-s-line" />
            <Link href="/dharma/gita">Bhagavad Gītā</Link>
            <i className="ri-arrow-right-s-line" />
            <Link href={`/dharma/gita/${chNum}`}>Chapter {chNum}</Link>
            <i className="ri-arrow-right-s-line" />
            <span>Verse {vNum}</span>
          </nav>

          {/* Client component handles font size + verse content + nav */}
          <VerseReaderClient
            sanskrit={v.sanskrit}
            transliteration={v.transliteration}
            meaning={v.meaning}
            meaningHindi={v.meaningHindi}
            wordMeanings={v.wordMeanings}
            purport={v.purport}
            prevVerse={prevVerse}
            nextVerse={nextVerse}
            chNum={chNum}
            vNum={vNum}
            chName={ch.nameTranslated}
          />

          <Footer />
        </main>
      </div>
    </div>
  );
}
