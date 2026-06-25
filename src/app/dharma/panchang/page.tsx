import type { Metadata } from 'next';
import Link from 'next/link';
import BackButton from '@/components/BackButton/BackButton';
import BgBlobs from '@/components/BgBlobs/BgBlobs';
import Footer from '@/components/Footer/Footer';
import PanchangClient from './PanchangClient';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Hindu Panchang — Today\'s Tithi, Nakshatra & Muhurta | Arpit Agarwala',
  description:
    'Live Hindu Panchang for today — Tithi, Nakshatra, Yoga, Karana, Sunrise, Sunset, Brahma Muhurta, Abhijit Muhurta, Rahu Kalam, Yamagandam and Gulika Kalam.',
  alternates: { canonical: 'https://arpitagarwala.online/dharma/panchang' },
};

export default function PanchangPage() {
  return (
    <div className={styles.wrap}>
      <BgBlobs color1="rgba(245,158,11,0.1)" color2="rgba(124,58,237,0.1)" />
      <BackButton />

      <div className={styles.inner}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link href="/dharma">Dharma</Link>
          <i className="ri-arrow-right-s-line" />
          <span>Hindu Panchang</span>
        </nav>

        {/* Header */}
        <header className={styles.header}>
          <div className={styles.omSymbol}>
            <i className="ri-calendar-2-line" style={{ color: '#f59e0b', fontSize: '2.5rem' }} />
          </div>
          <h1 className={styles.title}>Hindu Panchang</h1>
          <p className={styles.subtitle}>पञ्चाङ्ग — The Five-Limbed Hindu Calendar</p>
          <p className={styles.desc}>
            Today's Tithi, Nakshatra, Yoga, Karana and Vara — computed astronomically
            for your location. Plan auspicious activities and avoid inauspicious times.
          </p>
        </header>

        {/* Live Panchang */}
        <PanchangClient />

        <Footer />
      </div>
    </div>
  );
}
