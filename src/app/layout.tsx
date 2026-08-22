import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://arpitagarwala.online'),
  title: {
    default: 'Arpit Agarwala – Portfolio | BCom Student, CA Aspirant & Web Creator',
    template: '%s | Arpit Agarwala',
  },
  description:
    'Official portfolio of Arpit Agarwala – BCom (Hons) student, aspiring Chartered Accountant (CA aspirant) from Kolkata, financial tool developer, and creator. Explore custom SIP calculators, parcel trackers, Bhagavad Gita shlokas, and interactive web tools.',
  keywords: [
    'Arpit Agarwala',
    'Arpit Agarwala portfolio',
    'Arpit Agarwala Kolkata',
    'Arpit Agarwala CA aspirant',
    'Arpit Agarwala BCom',
    'Chartered Accountant aspirant India',
    'web developer Kolkata',
    'finance tools developer',
    'SIP calculator online',
    'budget tracker app',
    'universal parcel tracker',
    'Bhagavad Gita Sanskrit shloka English',
    'Hindu Panchang live',
    'financial literacy games',
    'react nextjs developer kolkata',
  ],
  authors: [{ name: 'Arpit Agarwala', url: 'https://arpitagarwala.online/' }],
  creator: 'Arpit Agarwala',
  publisher: 'Arpit Agarwala',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    siteName: 'Arpit Agarwala Portfolio',
    locale: 'en_IN',
    url: 'https://arpitagarwala.online/',
    title: 'Arpit Agarwala – Portfolio | BCom Student, CA Aspirant & Web Creator',
    description:
      'Explore projects, financial calculators, Bhagavad Gita portal, parcel tracker, and web applications built by Arpit Agarwala.',
    images: [
      {
        url: '/assets/images/my-miniature.png',
        width: 1200,
        height: 630,
        alt: 'Arpit Agarwala – BCom Student, CA Aspirant & Web Creator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Arpit Agarwala – Portfolio | BCom Student, CA Aspirant & Web Creator',
    description:
      'Official portfolio of Arpit Agarwala from Kolkata. Financial tools, Bhagavad Gita portal, and web projects.',
    images: ['/assets/images/my-miniature.png'],
    creator: '@arpit_agarwala_',
  },
  alternates: {
    canonical: 'https://arpitagarwala.online/',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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
                  '@id': 'https://arpitagarwala.online/#website',
                  url: 'https://arpitagarwala.online/',
                  name: 'Arpit Agarwala Portfolio',
                  description:
                    'Official portfolio of Arpit Agarwala – BCom (Hons) student, CA aspirant from Kolkata, and web developer.',
                  publisher: {
                    '@id': 'https://arpitagarwala.online/#person',
                  },
                  inLanguage: 'en-IN',
                },
                {
                  '@type': 'Person',
                  '@id': 'https://arpitagarwala.online/#person',
                  name: 'Arpit Agarwala',
                  url: 'https://arpitagarwala.online/',
                  image: {
                    '@type': 'ImageObject',
                    url: 'https://arpitagarwala.online/assets/images/my-miniature.png',
                  },
                  jobTitle: 'BCom Student, CA Aspirant & Web Creator',
                  description:
                    'BCom (Hons) student and aspiring Chartered Accountant from Kolkata, India. Developer of financial calculators, Bhagavad Gita portal, and productivity tools.',
                  email: 'arpitagarwalms@gmail.com',
                  address: {
                    '@type': 'PostalAddress',
                    addressLocality: 'Kolkata',
                    addressRegion: 'West Bengal',
                    addressCountry: 'IN',
                  },
                  knowsAbout: [
                    'Chartered Accountancy',
                    'Direct Taxation',
                    'Indirect Taxation GST',
                    'Financial Management',
                    'Accounting Standards',
                    'React',
                    'Next.js',
                    'TypeScript',
                    'Web Development',
                    'Financial Calculators',
                    'Bhagavad Gita',
                  ],
                  sameAs: [
                    'https://www.linkedin.com/in/arpitagarwala/',
                    'https://www.instagram.com/arpit.agarwala/',
                    'https://github.com/arpitagarwala',
                  ],
                },
                {
                  '@type': 'ProfilePage',
                  '@id': 'https://arpitagarwala.online/#profilepage',
                  url: 'https://arpitagarwala.online/',
                  name: 'Arpit Agarwala – Portfolio',
                  isPartOf: {
                    '@id': 'https://arpitagarwala.online/#website',
                  },
                  about: {
                    '@id': 'https://arpitagarwala.online/#person',
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
