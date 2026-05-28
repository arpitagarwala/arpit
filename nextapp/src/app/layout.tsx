import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://arpitagarwala.online'),
  title: 'Arpit Agarwala – Portfolio | BCom Student, CA Aspirant & Web Creator',
  description:
    'Personal portfolio of Arpit Agarwala – BCom (Hons) student, CA aspirant from Kolkata. Explore projects, tools, games, and achievements.',
  keywords: [
    'Arpit Agarwala',
    'portfolio',
    'CA aspirant',
    'BCom',
    'Kolkata',
    'web developer',
    'finance tools',
    'SIP calculator',
    'budget tracker',
  ],
  authors: [{ name: 'Arpit Agarwala' }],
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    siteName: 'Arpit Agarwala',
    locale: 'en_IN',
    images: [{ url: '/assets/images/my-miniature.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/assets/images/my-miniature.png'],
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
        {/* JSON-LD Person schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: 'Arpit Agarwala',
              url: 'https://arpitagarwala.online/',
              image: 'https://arpitagarwala.online/assets/images/my-miniature.png',
              jobTitle: 'BCom Student & CA Aspirant',
              description:
                'BCom (Hons) student and aspiring Chartered Accountant from Kolkata.',
              email: 'arpitagarwalms@gmail.com',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Kolkata',
                addressRegion: 'West Bengal',
                addressCountry: 'IN',
              },
              sameAs: [
                'https://www.linkedin.com/in/arpitagarwala/',
                'https://www.instagram.com/arpit.agarwala_/',
                'https://github.com/arpitagarwala',
              ],
            }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
