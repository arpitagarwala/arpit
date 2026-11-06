import Link from 'next/link';
import Footer from '@/components/Footer/Footer';
import { getSite } from '@/lib/site-server';
import { pageMetadata } from '@/lib/page-metadata';
import AppsClient from './AppsClient';
import s from './page.module.css';

export const metadata = pageMetadata('/apps', {
  title: 'Apps — Built by Arpit',
  description: 'Discover Gurukul, CA Bhaiya, Vertex Suite, Gita for Daily Life, Hindu Panchang, InformeDecision Market Tracker and Arpit’s portfolio. Enquire about an app, licensing or a custom build.',
});

export default async function AppsPage() {
  const site = await getSite();
  const whatsapp = site.about.connect.find(link => link.enabled && /^https:\/\/wa\.me\/\d+\/?(?:\?|$)/.test(link.href))?.href;
  return <main className={s.page}>
    <div className={s.shell}>
      <nav className={s.nav} aria-label="Apps page navigation">
        <Link href="/" className={s.brand}><span className={s.brandMark}>aa<span>®</span></span><span>Arpit Agarwala<small>Independent builder</small></span></Link>
        <Link href="/" className={s.back}><span aria-hidden="true">↖</span> Back to Explore</Link>
      </nav>
      <AppsClient email={site.home.email} whatsapp={whatsapp} />
      <Footer />
    </div>
  </main>;
}
