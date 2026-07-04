import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://arpitagarwala.online';
  const now = new Date();

  // Core pages
  const corePages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/projects`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/achievements`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/gallery`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/dharma`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/dharma/gita`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/dharma/panchang`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/tracker`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/weather`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/newsletter`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/games`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/coming-soon`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ];

  // 18 Chapters of Bhagavad Gita
  const gitaChapters: MetadataRoute.Sitemap = Array.from({ length: 18 }, (_, i) => ({
    url: `${baseUrl}/dharma/gita/${i + 1}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  // Projects
  const projectSlugs = [
    'ai-assistant',
    'calculator',
    'clock',
    'expense-splitter',
    'github-readme-maker',
    'network',
    'notepad',
    'pathfinder',
    'pomodoro',
    'sip',
    'typing',
  ];
  const projectPages: MetadataRoute.Sitemap = projectSlugs.map((slug) => ({
    url: `${baseUrl}/projects/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // Games
  const gameSlugs = [
    '2048',
    'asmr-rain',
    'asteroids',
    'city-builder',
    'clicker',
    'flappy',
    'market-sim',
    'memory',
    'pong',
    'snake',
    'sudoku',
    'tictactoe',
  ];
  const gamePages: MetadataRoute.Sitemap = gameSlugs.map((slug) => ({
    url: `${baseUrl}/games/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...corePages, ...gitaChapters, ...projectPages, ...gamePages];
}
