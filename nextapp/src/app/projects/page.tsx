import type { Metadata } from 'next';
import BackButton from '@/components/BackButton/BackButton';
import BgBlobs from '@/components/BgBlobs/BgBlobs';
import Footer from '@/components/Footer/Footer';
import ProjectsClient from './ProjectsClient';

export const metadata: Metadata = {
  title: 'Projects – Arpit Agarwala | Finance Tools, Web Apps & Interactive Experiments',
  description:
    'Browse projects by Arpit Agarwala – SIP calculator, budget tracker, expense splitter, notepad, clock and more.',
  alternates: { canonical: 'https://arpitagarwala.online/projects' },
};

export default function ProjectsPage() {
  return (
    <div style={{minHeight:'100vh',background:'#020817',color:'#e2e8f0',overflowX:'hidden'}}>
      <BgBlobs color1="rgba(16,185,129,0.15)" color2="rgba(99,102,241,0.15)" />
      <BackButton />
      <div style={{maxWidth:'80rem',margin:'0 auto',padding:'2.5rem 1rem 3rem'}}>
        <ProjectsClient />
        <Footer />
      </div>
    </div>
  );
}
