'use client';

import {useEffect, useState} from 'react';
import Link from 'next/link';
import {useAccount} from './AccountProvider';
import {accountConfigured} from '@/lib/account-config';
import {datasets} from '@/lib/account-storage';
import styles from '@/app/account/account.module.css';

export default function AccountPanel() {
  const account = useAccount();
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const user = account?.user;

  useEffect(() => {
    if (user) void account?.run('download');
    // Refresh from the server when arriving at this screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function authAction() {
    setWorking(true);
    setError('');
    try {
      const [{accountFirebase}, {GoogleAuthProvider, signInWithPopup, signOut}] = await Promise.all([
        import('@/lib/account-firebase'), import('firebase/auth'),
      ]);
      const {auth} = accountFirebase();
      if (user) {
        // Attempt to flush local changes before releasing the account session.
        await account?.run('download');
        await signOut(auth);
      } else {
        await signInWithPopup(auth, new GoogleAuthProvider());
      }
    } catch (failure) {
      const code = (failure as {code?: string})?.code;
      setError(code === 'auth/popup-blocked'
        ? 'Allow pop-ups for this site and try signing in again.'
        : code === 'auth/popup-closed-by-user'
          ? 'The Google sign-in window was closed. Try again when you’re ready.'
          : 'The account action did not complete. Please try again.');
    } finally {
      setWorking(false);
    }
  }

  if (!accountConfigured) return <p>Account sync is currently unavailable. You can keep using the tools on this device.</p>;
  const busy = Boolean(account?.busy || working);
  return <>
    {user ? <p>Signed in as <strong>{user.email ?? user.displayName ?? 'Google user'}</strong>.</p>
      : <p>Sign in to use your saved tasks, game progress and tool data on your other devices.</p>}
    <div className={styles.actions}>
      {user && <button type="button" className={styles.primary} disabled={busy} onClick={() => void account?.run('download')}>Sync now</button>}
      <button type="button" className={user ? undefined : styles.primary} disabled={busy} onClick={() => void authAction()}>
        {working ? 'Please wait…' : user ? 'Sign out' : 'Continue with Google'}
      </button>
    </div>
    {(user || account?.status || error) && <p className={styles.status} role="status">
      {error || (account?.busy ? 'Syncing your tools…' : account?.conflicts.length
        ? 'Review the versions below to finish syncing.' : account?.status)}
    </p>}
    {user && <>
      <section className={styles.section}>
        <h2>Bring your browser data</h2>
        <p>Copy data saved before you signed in to this account. If two versions differ, you choose which one to keep.</p>
        <div className={styles.actions}>
          <button type="button" disabled={busy} onClick={() => void account?.run('import')}>Import this browser’s data</button>
        </div>
      </section>
      {Boolean(account?.conflicts.length) && <section className={styles.section} aria-label="Sync conflicts">
        <h2>Choose which version to keep</h2>
        {account?.conflicts.map(({dataset, source, revision}) =>
          <div className={styles.conflict} key={dataset + source}>
            <h3>{datasets[dataset].label}</h3>
            <p>{source === 'browser' ? 'Your signed-out browser data differs from your account.' : 'This device and your account have separate changes.'}</p>
            <div className={styles.actions}>
              <button type="button" disabled={busy} onClick={() => void account.run('download', {dataset, source, revision})}>
                {source === 'browser' ? 'Use browser version' : 'Use this device’s version'}
              </button>
              <button type="button" disabled={busy} onClick={() => void account.run('download', {dataset, source: 'cloud', revision})}>
                Use cloud version
              </button>
            </div>
          </div>
        )}
      </section>}
    </>}
    <section className={styles.section}>
      <h2>What syncs</h2>
      <p>Tasks, focus history, Quiet Space settings, saved games and records, trade journal entries, expenses, calculator history, clock settings and README drafts. Trade screenshots are stored on the device. <Link href="/privacy">Privacy details</Link></p>
    </section>
  </>;
}
