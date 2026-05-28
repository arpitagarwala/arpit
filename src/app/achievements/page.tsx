import type { Metadata } from 'next';
import BackButton from '@/components/BackButton/BackButton';
import BgBlobs from '@/components/BgBlobs/BgBlobs';
import Footer from '@/components/Footer/Footer';
import AchievementsClient from './AchievementsClient';

export const metadata: Metadata = {
  title: 'Achievements \u2013 Arpit Agarwala | Certifications & Milestones',
  description:
    "A showcase of Arpit Agarwala's professional achievements, certifications, and milestones.",
  alternates: { canonical: 'https://arpitagarwala.online/achievements' },
};

export default function AchievementsPage() {
  return (
    <div style={{minHeight:'100vh',background:'#020817',color:'#e2e8f0',overflowX:'hidden'}}>
      <BgBlobs color1="rgba(245,158,11,0.1)" color2="rgba(234,179,8,0.08)" />
      <BackButton />
      <div style={{maxWidth:'64rem',margin:'0 auto',padding:'2.5rem 1rem 3rem'}}>
        <AchievementsClient />
        <Footer />
      </div>
    </div>
  );
}
