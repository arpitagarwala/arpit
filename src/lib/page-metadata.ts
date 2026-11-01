import type { Metadata } from 'next';

/** Keep each public page's search and social identity aligned with its canonical URL. */
export function pageMetadata(path: string, metadata: Metadata): Metadata {
  const title = typeof metadata.title === 'string'
    ? metadata.title.replace(/\s*[|–—]\s*Arpit Agarwala(?:\s*[|–—].*)?$/, '')
    : metadata.title;
  const canonical = metadata.alternates?.canonical ?? path;
  const socialTitle = (typeof title === 'string' ? title : title && ('absolute' in title ? title.absolute : 'default' in title ? title.default : undefined)) ?? undefined;
  return {
    ...metadata,
    title,
    alternates: { ...metadata.alternates, canonical },
    openGraph: {
      ...metadata.openGraph,
      title: socialTitle,
      description: metadata.description ?? undefined,
      url: typeof canonical === 'object' && 'url' in canonical ? canonical.url : canonical,
      siteName: 'Arpit Agarwala',
      locale: 'en_IN',
      images: metadata.openGraph?.images ?? ['/opengraph-image'],
    },
    twitter: {
      ...metadata.twitter,
      card: 'summary_large_image',
      title: socialTitle,
      description: metadata.description ?? undefined,
      images: metadata.twitter?.images ?? ['/opengraph-image'],
    },
  };
}
