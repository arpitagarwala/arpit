import BackButton from '../components/BackButton';
import SEOHead from '../components/SEOHead';
import Footer from '../components/Footer';

export default function ComingSoonPage() {
  return (
    <>
      <SEOHead title="Coming Soon – Arpit Agarwala" />
      <BackButton to="/" />
      <div className="page-wrap">
        <div className="page-content">
          <div className="card" style={{ padding: '2rem', marginBottom: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚧</div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>Coming Soon</h1>
            <p style={{ color: '#94a3b8' }}>Something exciting is being built here.</p>
          </div>
          <Footer />
        </div>
      </div>
    </>
  );
}
