import type {Metadata} from 'next';
import BackButton from '@/components/BackButton/BackButton';
import AccountPanel from '@/components/account/AccountPanel';
import styles from './account.module.css';

export const metadata: Metadata = {title: 'Your account', robots: {index: false, follow: false}};

export default function AccountPage() {
  return <main className={styles.page}>
    <BackButton/>
    <div className={styles.shell}>
      <h1>Your account</h1>
      <AccountPanel/>
    </div>
  </main>;
}
