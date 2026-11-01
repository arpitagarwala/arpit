import type { ReactNode } from 'react';
import BgBlobs from '@/components/BgBlobs/BgBlobs';
import Footer from '@/components/Footer/Footer';
import BackButton from '@/components/BackButton/BackButton';
import styles from './finance.module.css';

export default function FinanceShell({ children }: { children: ReactNode }) {
  return <div className={styles.shell}>
    <BgBlobs color1="rgba(181,139,83,0.08)" color2="rgba(204,168,121,0.06)" />
    <a href="#finance-main" className={styles.skip}>Skip to content</a>
    <BackButton />
    <div className={styles.container}>
      <main id="finance-main" className={styles.main}>{children}</main>
      <Footer />
    </div>
  </div>;
}

