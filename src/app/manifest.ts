import type {MetadataRoute} from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Arpit Agarwala',
    short_name: 'Arpit Agarwala',
    description: 'Arpit Agarwala’s portfolio, productivity workspace, finance tools and logic games.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#0f172a',
    shortcuts: [
      {name: 'Productivity', url: '/productivity', icons: [{src:'/app-icons/brand-192.png',sizes:'192x192'}]},
      {name: 'Focus timer', url: '/productivity/pomodoro', icons: [{src:'/app-icons/brand-192.png',sizes:'192x192'}]},
      {name: 'Calculator', url: '/projects/calculator', icons: [{src:'/app-icons/brand-192.png',sizes:'192x192'}]},
      {name: 'Games', url: '/games', icons: [{src:'/app-icons/brand-192.png',sizes:'192x192'}]},
    ],
    icons: [
      {src: '/app-icons/brand-192.png', sizes: '192x192', type: 'image/png', purpose: 'any'},
      {src: '/app-icons/brand-512.png', sizes: '512x512', type: 'image/png', purpose: 'any'},
      {src: '/app-icons/brand-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable'},
    ],
  };
}
