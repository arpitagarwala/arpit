'use client';

import Link from 'next/link';
import {useState} from 'react';
import {accountConfigured} from '@/lib/account-config';
import {useAccount} from './AccountProvider';

export function AccountLink({className}: {className?: string}) {
  const account = useAccount();
  const [error, setError] = useState(false);
  if (!accountConfigured) return null;
  if (!account?.user) return <Link href="/account" className={className}>Sign in</Link>;

  async function signOut() {
    setError(false);
    try {
      await account?.signOut();
    } catch {
      setError(true);
    }
  }

  return <>
    <Link href="/account" className={className}>Your account</Link>
    <button type="button" className={className} disabled={account.signingOut} onClick={() => void signOut()}>
      {account.signingOut ? 'Signing out…' : 'Sign out'}
    </button>
    {error && <span role="alert">Could not sign out. Please try again.</span>}
  </>;
}
