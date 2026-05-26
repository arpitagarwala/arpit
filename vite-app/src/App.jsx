import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import ProjectsPage from './pages/ProjectsPage'
import AchievementsPage from './pages/AchievementsPage'
import ArticlesPage from './pages/ArticlesPage'
import GalleryPage from './pages/GalleryPage'
import GamesPage from './pages/GamesPage'
import ComingSoonPage from './pages/ComingSoonPage'
import NotFoundPage from './pages/NotFoundPage'
import ScrollToTop from './components/ScrollToTop'
import Navbar from './components/Navbar'

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/achievements" element={<AchievementsPage />} />
        <Route path="/articles" element={<ArticlesPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/games" element={<GamesPage />} />
        <Route path="/coming-soon" element={<ComingSoonPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}
