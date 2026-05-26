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
    │   └── ScrollToTop.jsx
    └── pages/
        ├── HomePage.jsx        ✅ Done
        ├── AboutPage.jsx       🔄 In progress
        ├── ProjectsPage.jsx    🔄 In progress
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

1. Set `base` in `vite.config.js` if deploying to a subpath.
2. Run `npm run build`.
3. Push `dist/` or use the `gh-pages` npm package.

## Migration Status

| Page | Status |
|------|--------|
| Home | ✅ Complete |
| About | 🔄 Next |
| Projects | 🔄 Pending |
| Achievements | 🔄 Pending |
| Articles | 🔄 Pending |
| Gallery | 🔄 Pending |
| Games | 🔄 Pending |
| Coming Soon | ✅ Complete |
| 404 | ✅ Complete |
