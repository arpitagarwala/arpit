import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Coming Soon – Arpit Agarwala',
  description: 'Something exciting is being built. Stay tuned.',
  robots: 'noindex',
};

export default function ComingSoonPage() {
  return (
    <div className={styles.page}>
      <div className="bg-blob" style={{background:'rgba(34,211,238,0.1)',top:'-200px',left:'-200px'}} />
      <div className="bg-blob" style={{background:'rgba(99,102,241,0.1)',bottom:'-200px',right:'-200px'}} />
      <div className={styles.content}>
        <div className={styles.icon}>🚧</div>
        <h1 className={styles.title}>Coming Soon</h1>
        <p className={styles.subtitle}>Something exciting is being crafted here. Check back soon!</p>
        <Link href="/" className={styles.btn}>
          <i className="ri-arrow-left-line" /> Back to Home
        </Link>
      </div>
    </div>
  );
}
