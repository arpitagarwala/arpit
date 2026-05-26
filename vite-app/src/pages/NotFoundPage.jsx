import SEOHead from '../components/SEOHead'
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <>
      <SEOHead title="404 – Not Found" description="Page not found." />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" />
      <div className="section-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 900, color: 'var(--accent)', marginBottom: '0.5rem' }}>404</p>
          <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>Page not found</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>This page doesn't exist or was moved.</p>
          <Link to="/" className="btn btn-primary"><i className="ri-home-line" /> Back Home</Link>
        </div>
      </div>
    </>
  )
}
