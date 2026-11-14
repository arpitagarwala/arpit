import AccountProvider from '@/components/account/AccountProvider';
import VisitorAnalytics from '@/components/analytics/VisitorAnalytics';
import type { Metadata } from 'next';
import '@/styles/globals.css';
import '@/styles/controls.css';
import {getSite} from '@/lib/site-server';
import {siteDefaults,sitePathEnabled} from '@/lib/site-config';
import {personalPhotos,photoUrl} from '@/lib/personal-photos';
import {SiteFeatures} from '@/components/SiteFeatures';
import {GameTimeTracker} from '@/components/training/GameTime';
import {ProductivityProvider} from '@/components/productivity/ProductivityProvider';
import {SuiteNavigationProvider} from '@/components/productivity/SuiteNavigation';

const defaultMetadata: Metadata = {
  metadataBase: new URL('https://arpitagarwala.com'),
  title: { default: 'Arpit Agarwala – Finance, Technology & Projects', template: '%s | Arpit Agarwala' },
  description: 'Explore Arpit Agarwala’s portfolio, finance tools, logic games and connected study productivity workspace. Based in Kolkata, India.',
  authors: [{ name: 'Arpit Agarwala', url: 'https://arpitagarwala.com/' }],
  creator: 'Arpit Agarwala', publisher: 'Arpit Agarwala',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
  openGraph: { type: 'website', siteName: 'Arpit Agarwala', locale: 'en_IN', images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Arpit Agarwala — Finance, Technology & Projects' }] },
  twitter: { card: 'summary_large_image', images: ['/opengraph-image'] },
};

// Keep the sign-in shell usable during a settings-service outage. Public pages
// still fail closed in the proxy and load their content through getSite().
async function shellSite(){try{return await getSite();}catch{return siteDefaults();}}
export async function generateMetadata():Promise<Metadata>{const site=await shellSite();return{...defaultMetadata,authors:[{name:site.profile.name,url:'https://arpitagarwala.com/'}],creator:site.profile.name,publisher:site.profile.name,title:{default:site.seo.title,template:`%s | ${site.profile.name}`},description:site.seo.description,openGraph:{...defaultMetadata.openGraph,siteName:site.profile.name+' Portfolio',title:site.seo.title,description:site.seo.description,images:[{url:'/opengraph-image',width:1200,height:630,alt:site.profile.name+' — Finance, Technology & Projects'}]},twitter:{...defaultMetadata.twitter,title:site.seo.title,description:site.seo.description,images:['/opengraph-image']}};}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const site=await shellSite();
  const photos=sitePathEnabled(site,'/gallery')?personalPhotos(site.gallery.photos):[];
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        {/* RemixIcon CDN */}
        <link
          href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css"
          rel="stylesheet"
        />
        {/* Noto Serif Devanagari — for Sanskrit shloka display */}
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+Devanagari:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        {/* Favicons */}
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="https://res.cloudinary.com/dxsja3wy5/image/upload/w_32,h_32,c_fill,q_auto,f_png/v1772863840/tab-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="https://res.cloudinary.com/dxsja3wy5/image/upload/w_16,h_16,c_fill,q_auto,f_png/v1772863840/tab-icon.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="https://res.cloudinary.com/dxsja3wy5/image/upload/w_180,h_180,c_fill,q_auto,f_png/v1772863840/tab-icon.png"
        />
        {/* JSON-LD Rich @graph Schema for SEO & AI Search */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'WebSite',
                  '@id': 'https://arpitagarwala.com/#website',
                  url: 'https://arpitagarwala.com/',
                  name: site.profile.name+' Portfolio',
                  description: site.seo.description,
                  publisher: {
                    '@id': 'https://arpitagarwala.com/#person',
                  },
                  inLanguage: 'en-IN',
                },
                {
                  '@type': 'Person',
                  '@id': 'https://arpitagarwala.com/#person',
                  name: site.profile.name,
                  url: 'https://arpitagarwala.com/',
                  alternateName: site.profile.name==='Arpit Agarwala'?'arpitagarwala':undefined,
                  image: photos.length?photos.map(photo=>({
                    '@type':'ImageObject',
                    '@id':photoUrl(photo)+'#image',
                    url:photoUrl(photo),
                    contentUrl:photoUrl(photo),
                    caption:`${site.profile.name} — ${photo.alt||photo.title}`,
                    about:{'@id':'https://arpitagarwala.com/#person'},
                  })):undefined,
                  jobTitle: site.profile.role,
                  description: site.profile.bio,
                  email: site.home.email,
                  address: {
                    '@type': 'PostalAddress',
                    addressLocality: site.profile.location,
                  },
                  knowsAbout: site.about.tags,
                  sameAs: site.about.connect.filter(c=>c.enabled&&c.href.startsWith('https:')).map(c=>c.href),
                },
              ],
            }).replace(/</g,'\\u003c'),
          }}
        />
      </head>
      <body><SiteFeatures features={{...site.features,'games.progress':site.features['games.progress']!==false&&sitePathEnabled(site,'/games/progress'),'games.math-sprint':sitePathEnabled(site,'/games/math-sprint'),'productivity.quiet':sitePathEnabled(site,'/productivity/rain'),'productivity.focus':sitePathEnabled(site,'/productivity/pomodoro'),'productivity.tasks':sitePathEnabled(site,'/productivity/todo'),'productivity.analysis':sitePathEnabled(site,'/productivity/analysis')}} footer={site.footer}><AccountProvider><SuiteNavigationProvider><ProductivityProvider tools={site.productivity.filter(t=>t.enabled&&sitePathEnabled(site,t.href)).map(t=>({href:t.href,title:t.title,sub:t.sub,icon:t.icon}))}>{children}</ProductivityProvider></SuiteNavigationProvider><GameTimeTracker/></AccountProvider><VisitorAnalytics/></SiteFeatures></body>
    </html>
  );
}
