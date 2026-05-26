import BackButton from '../components/BackButton';
import SEOHead from '../components/SEOHead';
import Footer from '../components/Footer';

export default function AchievementsPage() {
  return (
    <>
      <SEOHead title="Achievements – Arpit Agarwala" />
      <BackButton to="/" />
      <div className="page-wrap">
        <div className="page-content">
          <div className="card" style={{ padding: '2rem', marginBottom: '1rem' }}>
            <p className="label-caps" style={{ marginBottom: '0.5rem' }}>Portfolio</p>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>Achievements</h1>
            <p style={{ marginTop: '1.5rem', color: '#94a3b8' }}>Migration in progress.</p>
          </div>
          <Footer />
        </div>
      </div>
    </>
  );
}
