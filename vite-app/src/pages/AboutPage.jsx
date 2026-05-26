import BackButton from '../components/BackButton';
import SEOHead from '../components/SEOHead';
import Footer from '../components/Footer';

export default function AboutPage() {
  return (
    <>
      <SEOHead
        title="About – Arpit Agarwala"
        description="Learn about Arpit Agarwala — BCom student, CA aspirant, and web developer from Kolkata."
        canonical="https://arpitagarwala.online/about"
      />
      <BackButton to="/" />
      <div className="page-wrap">
        <div className="page-content">
          <div className="card" style={{ padding: '2rem', marginBottom: '1rem' }}>
            <p className="label-caps" style={{ marginBottom: '0.5rem' }}>Portfolio</p>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>About Me</h1>
            <p style={{ marginTop: '1.5rem', color: '#94a3b8', lineHeight: 1.8 }}>
              This page is being migrated. Content coming soon.
            </p>
          </div>
          <Footer />
        </div>
      </div>
    </>
  );
}
