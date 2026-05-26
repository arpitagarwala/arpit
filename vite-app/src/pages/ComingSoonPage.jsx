import SEOHead from '../components/SEOHead'
import { Link } from 'react-router-dom'

export default function ComingSoonPage() {
  return (
    <>
      <SEOHead title="Coming Soon" description="Something new is being built." canonical="/coming-soon" />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" />
      <div className="section-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 'var(--text-xl)', marginBottom: '1rem' }}>🚧</p>
          <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>Coming Soon</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Something exciting is being built here.</p>
          <Link to="/" className="btn btn-primary"><i className="ri-home-line" /> Go Home</Link>
        </div>
      </div>
    </>
  )
}
