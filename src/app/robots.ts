import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/coming-soon', '/api/', '/admin', '/owner', '/login', '/games/progress', '/productivity/analysis'],
      },
      {
        userAgent: [
          'Googlebot',
          'Bingbot',
          'Applebot',
          'Applebot-Extended',
          'DuckDuckBot',
          'Slurp',
          'GPTBot',
          'ChatGPT-User',
          'OAI-SearchBot',
          'PerplexityBot',
          'ClaudeBot',
          'Claude-Web',
          'Google-Extended',
          'Amazonbot',
          'FacebookBot',
        ],
        allow: '/',
        disallow: ['/coming-soon', '/api/', '/admin', '/owner', '/login', '/games/progress', '/productivity/analysis'],
      },
    ],
    sitemap: 'https://arpitagarwala.com/sitemap.xml',
    host: 'https://arpitagarwala.com',
  };
}
