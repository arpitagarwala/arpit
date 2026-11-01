import BackButton from '@/components/BackButton/BackButton';
import Footer from '@/components/Footer/Footer';
import {pageMetadata} from '@/lib/page-metadata';
import DesignsGallery from './DesignsGallery';
import styles from './page.module.css';

export const metadata = pageMetadata('/designs', {
  title: 'Designs — UI/UX & Figma',
  description: 'Explore Arpit Agarwala’s UI/UX designs, mobile app screens and interactive Figma prototype.',
  keywords: ['Arpit Agarwala designs', 'UI UX design', 'Figma', 'mobile app design'],
});

export default function DesignsPage() {
  return <div className={styles.page}>
    <BackButton />
    <main className={styles.shell}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>UI / UX · FIGMA · SELECTED WORK</p>
        <div className={styles.intro}>
          <h1>Designs<span>From idea to interface.</span></h1>
          <p>Mobile apps, product screens and interactive prototypes. A collection of interfaces I’ve crafted in Figma.</p>
        </div>
      </header>
      <DesignsGallery />
      <Footer />
    </main>
  </div>;
}
