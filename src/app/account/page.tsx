import type {Metadata} from 'next';
import Link from 'next/link';
import BackButton from '@/components/BackButton/BackButton';
import AccountPanel from '@/components/account/AccountPanel';
import {getSite} from '@/lib/site-server';
import {siteDefaults} from '@/lib/site-config';
import styles from './account.module.css';

export const metadata: Metadata = {title: 'Your account', robots: {index: false, follow: false}};

export default async function AccountPage() {
  const site = await getSite().catch(siteDefaults);
  return <main className={styles.page}>
    <BackButton/>
    <div className={styles.shell}>
      <h1>Your account</h1>
      <AccountPanel/>
      <p className={styles.section}><Link href="/widgets">Open widgets and recovery history ↗</Link></p>
      <footer className={styles.section} aria-label="Support">
        <p><a href={'mailto:' + site.home.email}>Email support</a> · <a href="https://arpitagarwala.com">Website</a></p>
      </footer>
    </div>
  </main>;
}
