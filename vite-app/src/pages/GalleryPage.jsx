import SEOHead from '../components/SEOHead'
import { Link } from 'react-router-dom'

export default function GalleryPage() {
  return (
    <>
      <SEOHead title="Gallery" description="Moments and memories from Arpit Agarwala's life." canonical="/gallery" />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" />
      <div className="section-page">
        <div className="container">
          <Link to="/" className="btn btn-ghost" style={{ marginBottom: '2rem', display: 'inline-flex' }}>
            <i className="ri-arrow-left-line" /> Back
          </Link>
          <p style={{ color: 'var(--text-muted)' }}>Gallery page — migration in progress.</p>
        </div>
      </div>
    </>
  )
}
