import SEOHead from '../components/SEOHead'
import { Link } from 'react-router-dom'

export default function AboutPage() {
  return (
    <>
      <SEOHead title="About" description="Learn more about Arpit Agarwala — BCom student, CA aspirant, and web developer from Kolkata." canonical="/about" />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" />
      <div className="section-page">
        <div className="container">
          <Link to="/" className="btn btn-ghost" style={{ marginBottom: '2rem', display: 'inline-flex' }}>
            <i className="ri-arrow-left-line" /> Back
          </Link>
          {/* Content will be migrated in Phase 2 */}
          <p style={{ color: 'var(--text-muted)' }}>About page — migration in progress.</p>
        </div>
      </div>
    </>
  )
}
