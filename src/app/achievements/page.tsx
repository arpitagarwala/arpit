import {pageMetadata} from '@/lib/page-metadata';
import {getSite} from '@/lib/site-server';
import type { Metadata } from 'next';
import BackButton from '@/components/BackButton/BackButton';
import styles from './page.module.css';
import Footer from '@/components/Footer/Footer';
import AchievementsClient from './AchievementsClient';

export const metadata: Metadata = pageMetadata("/achievements", {
  title: 'Achievements \u2013 Arpit Agarwala | Certifications & Milestones',
  description:
    "A showcase of Arpit Agarwala's professional achievements, certifications, and milestones.",
  alternates: { canonical: 'https://arpitagarwala.com/achievements' },
});

export default async function AchievementsPage() {
  const site=await getSite();
  return (
    <div className={styles.page}>
      <BackButton />
      <div className={styles.shell}>
        <AchievementsClient content={site.achievements}/>
        <Footer />
      </div>
    </div>
  );
}
