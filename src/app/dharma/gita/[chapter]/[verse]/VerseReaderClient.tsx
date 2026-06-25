'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export type FontSize = 'sm' | 'md' | 'lg' | 'xl';

const FS_LABELS: Record<FontSize, string> = { sm: 'A', md: 'A', lg: 'A', xl: 'A' };
const FS_SIZES: Record<FontSize, { shloka: string; translit: string; meaning: string }> = {
  sm: { shloka: '1rem',    translit: '0.95rem', meaning: '0.95rem' },
  md: { shloka: '1.2rem',  translit: '1.05rem', meaning: '1.05rem' },
  lg: { shloka: '1.45rem', translit: '1.2rem',  meaning: '1.2rem'  },
  xl: { shloka: '1.75rem', translit: '1.4rem',  meaning: '1.4rem'  },
};
const FS_ORDER: FontSize[] = ['sm', 'md', 'lg', 'xl'];
const FS_STORAGE_KEY = 'gita-font-size';

interface Props {
  sanskrit: string;
  transliteration: string;
  meaning: string;
  meaningHindi: string;
  wordMeanings?: string;
  purport?: string;
  prevVerse: { chapter: number; verse: number } | null;
  nextVerse: { chapter: number; verse: number } | null;
  chNum: number;
  vNum: number;
  chName: string;
}

export default function VerseReaderClient({
  sanskrit, transliteration, meaning, meaningHindi, wordMeanings, purport,
  prevVerse, nextVerse, chNum, vNum, chName,
}: Props) {
  const [fs, setFs] = useState<FontSize>('md');

  // Load persisted preference
  useEffect(() => {
    const saved = localStorage.getItem(FS_STORAGE_KEY) as FontSize | null;
    if (saved && FS_ORDER.includes(saved)) setFs(saved);
  }, []);

  const changeFs = (next: FontSize) => {
    setFs(next);
    localStorage.setItem(FS_STORAGE_KEY, next);
  };

  const sizes = FS_SIZES[fs];
  const fsIdx = FS_ORDER.indexOf(fs);

  return (
    <>
      {/* ── Verse Header + Font Controls ── */}
      <div className={styles.verseHeaderRow}>
        <div className={styles.verseHeader}>
          <span className={styles.verseRef}>BG {chNum}.{vNum}</span>
          <span className={styles.chapterTag}>{chName}</span>
        </div>

        {/* Font Size Controls */}
        <div className={styles.fontControls} title="Adjust font size">
          <span className={styles.fontLabel}>
            <i className="ri-font-size" /> Size
          </span>
          <div className={styles.fontBtns}>
            <button
              className={styles.fontBtn}
              onClick={() => changeFs(FS_ORDER[Math.max(0, fsIdx - 1)])}
              disabled={fsIdx === 0}
              aria-label="Decrease font size"
            >
              A<sup>−</sup>
            </button>
            <div className={styles.fontDots}>
              {FS_ORDER.map((s, i) => (
                <button
                  key={s}
                  className={`${styles.fontDot} ${fs === s ? styles.fontDotActive : ''}`}
                  onClick={() => changeFs(s)}
                  aria-label={`Font size ${s}`}
                />
              ))}
            </div>
            <button
              className={styles.fontBtn}
              onClick={() => changeFs(FS_ORDER[Math.min(FS_ORDER.length - 1, fsIdx + 1)])}
              disabled={fsIdx === FS_ORDER.length - 1}
              aria-label="Increase font size"
            >
              A<sup>+</sup>
            </button>
          </div>
        </div>
      </div>

      {/* ── Sanskrit Shloka ── */}
      <div className={styles.shlokaCard}>
        <div className={styles.shlokaLabel}>
          <i className="ri-translate" /> Sanskrit
        </div>
        <p className={styles.shloka} style={{ fontSize: sizes.shloka }}>
          {sanskrit}
        </p>
      </div>

      {/* ── Transliteration ── */}
      <div className={styles.translitCard}>
        <div className={styles.shlokaLabel}>
          <i className="ri-text" /> Transliteration (IAST)
        </div>
        <p className={styles.translit} style={{ fontSize: sizes.translit }}>
          {transliteration}
        </p>
      </div>

      {/* ── Synonyms / Word Meanings ── */}
      {wordMeanings && (
        <div className={styles.synonymsCard}>
          <div className={styles.shlokaLabel}>
            <i className="ri-list-check" /> Synonyms (Word Meanings)
          </div>
          <p className={styles.synonyms} style={{ fontSize: sizes.translit }}>
            {wordMeanings}
          </p>
        </div>
      )}

      {/* ── English Meaning ── */}
      <div className={styles.meaningCard}>
        <div className={styles.shlokaLabel}>
          <i className="ri-message-3-line" /> English Meaning
        </div>
        <p className={styles.meaning} style={{ fontSize: sizes.meaning }}>
          {meaning}
        </p>
      </div>

      {/* ── Hindi Meaning ── */}
      {meaningHindi && (
        <div className={styles.hindiCard}>
          <div className={styles.shlokaLabel}>
            <i className="ri-message-3-line" /> हिंदी अर्थ
          </div>
          <p className={styles.meaningHindi} style={{ fontSize: sizes.meaning }}>
            {meaningHindi}
          </p>
        </div>
      )}

      {/* ── Purport / Commentary ── */}
      {purport && (
        <div className={styles.purportCard}>
          <div className={styles.shlokaLabel}>
            <i className="ri-book-open-fill" /> Purport (Bhaktivedanta Commentary)
          </div>
          <p className={styles.purport} style={{ fontSize: sizes.meaning }}>
            {purport}
          </p>
        </div>
      )}

      {/* ── Prev / Next Navigation ── */}
      <div className={`${styles.verseNav} ${!prevVerse ? styles.verseNavNoPrev : ''} ${!nextVerse ? styles.verseNavNoNext : ''}`}>
        {prevVerse && (
          <Link href={`/dharma/gita/${prevVerse.chapter}/${prevVerse.verse}`} className={styles.navBtn}>
            <i className="ri-arrow-left-line" style={{ color: '#f59e0b' }} />
            <span>
              <small className={styles.navLabel}>← Previous</small>
              <strong>BG {prevVerse.chapter}.{prevVerse.verse}</strong>
            </span>
          </Link>
        )}

        <Link href={`/dharma/gita/${chNum}`} className={styles.navBtnCenter}>
          <i className="ri-list-unordered" />
          <span>All Verses</span>
        </Link>

        {nextVerse ? (
          <Link href={`/dharma/gita/${nextVerse.chapter}/${nextVerse.verse}`} className={`${styles.navBtn} ${styles.navBtnRight}`}>
            <span>
              <small className={styles.navLabel}>Next →</small>
              <strong>BG {nextVerse.chapter}.{nextVerse.verse}</strong>
            </span>
            <i className="ri-arrow-right-line" style={{ color: '#f59e0b' }} />
          </Link>
        ) : (
          <div className={styles.endMsg}>
            <i className="ri-checkbox-circle-line" style={{ color: '#f59e0b' }} />
            <span>End of Gītā 🙏</span>
          </div>
        )}
      </div>
    </>
  );
}
