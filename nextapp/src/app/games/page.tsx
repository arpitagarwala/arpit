import type { Metadata } from 'next';
import BackButton from '@/components/BackButton/BackButton';
import BgBlobs from '@/components/BgBlobs/BgBlobs';
import Footer from '@/components/Footer/Footer';
import GamesClient from './GamesClient';

export const metadata: Metadata = {
  title: 'Games – Arpit Agarwala | Fun Browser Games',
  description:
    'Play fun browser games by Arpit Agarwala — Tic Tac Toe with Minimax AI, Memory Cards, 2048, Snake and more.',
  alternates: { canonical: 'https://arpitagarwala.online/games' },
};

export default function GamesPage() {
  return (
    <div style={{minHeight:'100vh',background:'#020817',color:'#e2e8f0',overflowX:'hidden'}}>
      <BgBlobs color1="rgba(34,211,238,0.15)" color2="rgba(168,85,247,0.15)" />
      <BackButton />
      <div style={{maxWidth:'80rem',margin:'0 auto',padding:'2.5rem 1rem 3rem'}}>
        <GamesClient />
        <Footer />
      </div>
    </div>
  );
}
