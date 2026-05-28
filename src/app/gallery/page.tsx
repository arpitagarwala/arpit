import type { Metadata } from 'next';
import BackButton from '@/components/BackButton/BackButton';
import BgBlobs from '@/components/BgBlobs/BgBlobs';
import Footer from '@/components/Footer/Footer';
import GalleryClient from './GalleryClient';

export const metadata: Metadata = {
  title: 'Gallery – Arpit Agarwala | Moments & Memories',
  description: 'Photo gallery of Arpit Agarwala – moments, milestones, and memories.',
  alternates: { canonical: 'https://arpitagarwala.online/gallery' },
};

export default function GalleryPage() {
  return (
    <div style={{minHeight:'100vh',background:'#020817',color:'#e2e8f0',overflowX:'hidden'}}>
      <BgBlobs color1="rgba(244,63,94,0.1)" color2="rgba(249,115,22,0.1)" />
      <BackButton />
      <div style={{maxWidth:'64rem',margin:'0 auto',padding:'2.5rem 1rem 3rem'}}>
        <GalleryClient />
        <Footer />
      </div>
    </div>
  );
}
