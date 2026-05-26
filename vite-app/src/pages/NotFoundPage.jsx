import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';

export default function NotFoundPage() {
  return (
    <>
      <SEOHead title="404 – Page Not Found" />
      <div className="page-wrap" style={{ alignItems: 'center', minHeight: '100dvh' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '5rem', fontWeight: 900, color: 'rgba(6,182,212,0.2)', lineHeight: 1, fontFamily: 'monospace' }}>404</p>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>Page not found</h1>
          <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>This page doesn't exist or was moved.</p>
          <Link
            to="/"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.625rem 1.25rem', borderRadius: '0.5rem', background: '#06b6d4', color: '#fff', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}
          >
            <i className="ri-home-line" /> Back home
          </Link>
        </div>
      </div>
    </>
  );
}
