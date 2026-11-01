import {pageMetadata} from '@/lib/page-metadata';
import type { Metadata } from 'next';
import BackButton from '@/components/BackButton/BackButton';
import NewsletterClient from './NewsletterClient';
import {NEWSLETTER_URL,parseNewsletterPosts,type NewsletterPost} from '@/lib/newsletter';
import Footer from '@/components/Footer/Footer';
import styles from './page.module.css';

export const metadata: Metadata = pageMetadata("/newsletter", {
  title: 'Newsletter – Fintech Horizon | Arpit Agarwala',
  description:
    'Read Fintech Horizon by Arpit Agarwala on Substack — analytical essays and frameworks exploring finance, chartered accountancy, Indian taxation, AI, and technology.',
  keywords: [
    'Fintech Horizon newsletter',
    'Arpit Agarwala newsletter',
    'Arpit Agarwala Substack',
    'finance technology newsletter India',
    'CA student blog Kolkata',
    'AI in finance essays',
  ],
  alternates: { canonical: 'https://arpitagarwala.com/newsletter' },
  openGraph: {
    title: 'Newsletter – Fintech Horizon by Arpit Agarwala',
    description: 'Analytical essays and frameworks exploring finance, CA studies, AI, and technology.',
    url: 'https://arpitagarwala.com/newsletter',
    type: 'website',
  },
});


export const revalidate=3600;
async function getPosts():Promise<{posts:NewsletterPost[];unavailable:boolean}>{
 try{
  const response=await fetch(NEWSLETTER_URL+'/api/v1/posts?limit=20&offset=0',{next:{revalidate:3600},signal:AbortSignal.timeout(8000),headers:{'User-Agent':'Mozilla/5.0 (compatible; RSS reader)',Accept:'application/json'}});
  if(!response.ok)throw new Error('Feed unavailable');
  return {posts:parseNewsletterPosts(await response.json()),unavailable:false};
 }catch{return {posts:[],unavailable:true};}
}
export default async function NewsletterPage(){
 const {posts,unavailable}=await getPosts();
 return <main className={styles.page}><BackButton/><div className={styles.shell}>
  <header className={styles.header}><div><p className={styles.eyebrow}>THE NEWSLETTER / BY ARPIT AGARWALA</p><h1>Fintech <span>Horizon</span></h1><p className={styles.introduction}>Notes from my readings, and the frameworks I use to make sense of finance and technology.</p><div className={styles.publicationLine}><i className="ri-quill-pen-line" aria-hidden="true"/><span>Independent thinking. Published on Substack.</span></div></div><aside className={styles.subscribeCard} aria-label="Subscribe to Fintech Horizon"><span className={styles.mailIcon}><i className="ri-mail-open-line" aria-hidden="true"/></span><h2>A clearer view,<br/>in your inbox.</h2><p>Receive new essays when I publish.</p><a href={NEWSLETTER_URL+'/subscribe'} target="_blank" rel="noopener noreferrer" className={styles.primary}>Subscribe on Substack <span aria-hidden="true">↗</span></a><small>Opens Substack to manage your subscription.</small></aside></header>
  <NewsletterClient posts={posts} unavailable={unavailable}/>
  <Footer/>
 </div></main>;
}
