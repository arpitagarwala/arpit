# Arpit Agarwala — Portfolio (Vite + React)

This is the migrated version of [arpitagarwala.online](https://arpitagarwala.online) built with **Vite 5 + React 18 + React Router v6**.

## Project Structure

```
vite-app/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx          # Entry point
    ├── App.jsx           # Router config
    ├── styles/
    │   └── global.css    # Design tokens + base styles
    ├── components/
    │   ├── SEOHead.jsx   # Dynamic meta tags
    │   ├── ScrollToTop.jsx
    │   └── Navbar.jsx    # Shared nav (all inner pages)
    └── pages/
        ├── HomePage.jsx        ✅ Done
        ├── AboutPage.jsx       ✅ Done
        ├── ProjectsPage.jsx    ✅ Done
        ├── AchievementsPage.jsx 🔄 In progress
        ├── ArticlesPage.jsx    🔄 In progress
        ├── GalleryPage.jsx     🔄 In progress
        ├── GamesPage.jsx       🔄 In progress
        ├── ComingSoonPage.jsx  🔄 In progress
        └── NotFoundPage.jsx    ✅ Done
```

## Getting Started

```bash
cd vite-app
npm install
npm run dev
```

## Build for Production

```bash
npm run build
# Outputs to ../dist/
```

## Deploy to GitHub Pages

Push to `vite-migration` branch — GitHub Actions will auto-build and deploy to `gh-pages-vite` branch (preview, won't affect live site).

## Migration Status

| Page | Status |
|------|--------|
| Home | ✅ Complete |
| About | ✅ Complete |
| Projects | ✅ Complete |
| Navbar (shared) | ✅ Complete |
| Achievements | 🔄 Next |
| Articles | 🔄 Pending |
| Gallery | 🔄 Pending |
| Games | 🔄 Pending |
| Coming Soon | ✅ Complete |
| 404 | ✅ Complete |
