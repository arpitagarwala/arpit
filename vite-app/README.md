# Arpit Agarwala – Portfolio (Vite + React)

This is the modern rebuild of [arpitagarwala.online](https://arpitagarwala.online) using **Vite 5 + React 18**.

## Stack
- **Build tool:** Vite 5
- **Framework:** React 18
- **Routing:** React Router v6
- **Styling:** Plain CSS (design tokens in `src/index.css`)
- **Icons:** RemixIcon via CDN
- **Fonts:** Satoshi (Fontshare) + Instrument Serif (Google Fonts)

## Getting Started

```bash
cd vite-app
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Build for Production

```bash
npm run build
npm run preview
```

Output goes to `vite-app/dist/`. Deploy that folder to GitHub Pages or your hosting.

## Migration Progress

| Page | Status |
|------|--------|
| `/` Home | ✅ Complete |
| `/articles` Articles | ✅ Complete (full filter + modal) |
| `/about` About | 🔄 Scaffold ready |
| `/projects` Projects | 🔄 Scaffold ready |
| `/achievements` Achievements | 🔄 Scaffold ready |
| `/gallery` Gallery | 🔄 Scaffold ready |
| `/games` Games | 🔄 Scaffold ready |
| `/coming-soon` Coming Soon | ✅ Complete |
| `404` Not Found | ✅ Complete |

## Deployment (GitHub Pages)

```bash
npm run build
npx gh-pages -d dist
```

Make sure `vite.config.js` `base` is set correctly:
- Custom domain (`arpitagarwala.online`): `base: '/'`
- GitHub Pages subdirectory: `base: '/arpit/'`
