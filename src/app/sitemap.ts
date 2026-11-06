import type { MetadataRoute } from 'next';
import { getSite } from '@/lib/site-server';
import { sitePathEnabled } from '@/lib/site-config';
import { publicEntries } from '@/lib/admin-server';
import { DESIGNS } from '@/data/designs';
import {personalPhotos,photoUrl} from '@/lib/personal-photos';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [site, entries] = await Promise.all([getSite(), publicEntries().catch(() => [])]);
  const baseUrl = 'https://arpitagarwala.com';
  const portrait = site.profile.portrait ? new URL(site.profile.portrait, baseUrl).href : undefined;
  const realPortrait=sitePathEnabled(site,'/gallery')?personalPhotos(site.gallery.photos)[0]:undefined;
  const pageImages: Record<string, string[]> = {
    '/': portrait ? [portrait] : [],
    '/about': realPortrait ? [photoUrl(realPortrait)] : portrait ? [portrait] : [],
    '/gallery': site.gallery.photos.filter(photo => photo.enabled).map(photo => new URL(photo.src, baseUrl).href),
    '/designs': DESIGNS.filter(work => work.type === 'image').map(work => work.src),
    '/achievements': site.achievements.items.filter(item => item.enabled && item.bannerUrl).map(item => new URL(item.bannerUrl, baseUrl).href),
  };
  const paths = new Set([
    '/',
    '/privacy',
    ...site.pages.filter(page => page.enabled).map(page => page.href),
    ...site.navigation.filter(link => link.enabled).map(link => link.href),
    ...site.projects.filter(app => app.enabled).map(app => app.href),
    ...site.games.filter(app => app.enabled).map(app => app.href),
    ...site.productivity.filter(app => app.enabled).map(app => app.href),
  ]);

  // List canonical public pages, rather than sign-in, personal reports or redirect aliases.
  const excluded = new Set(['/coming-soon', '/games/progress', '/productivity/analysis', '/markets', '/workspace', '/projects/finance/markets', '/projects/finance/workspace', '/projects/finance', '/tools', '/projects/pomodoro', '/games/asmr-rain', '/projects/finance/compound-growth']);
  const canonical = new Set([...paths].map(path => path === '/methodology' ? '/projects/finance/methodology' : path === '/projects/sip' ? '/projects/finance/sip' : path));
  const pages = [...canonical]
    .filter(path => !excluded.has(path) && !/^\/(?:admin|owner|login|api)(?:\/|$)/.test(path) && path.startsWith('/') && !path.startsWith('//') && sitePathEnabled(site, new URL(path, baseUrl).pathname))
    .map<MetadataRoute.Sitemap[number]>(path => ({
      url: new URL(path, baseUrl).href,
      changeFrequency: path === '/' ? 'weekly' : 'monthly',
      priority: path === '/' ? 1 : 0.7,
      ...(pageImages[path]?.length ? { images: [...new Set(pageImages[path])] } : {}),
    }));
  if (sitePathEnabled(site, '/updates')) {
    for (const entry of entries.filter(entry => entry.status === 'published')) {
      pages.push({ url: `${baseUrl}/updates/${entry.id}`, lastModified: entry.updatedAt, changeFrequency: 'monthly', priority: 0.6 });
    }
  }
  return pages;
}
