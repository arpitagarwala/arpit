'use client';

import Link from 'next/link';
import {useAccount} from './AccountProvider';
import {accountConfigured} from '@/lib/account-config';

export function AccountLink({className}: {className?: string}) {
  const account = useAccount();
  if (!accountConfigured) return null;
  return <Link href="/account" className={className}>
    {account?.user ? 'Manage synced data across devices' : 'Sign in to sync data across devices'}
    {Boolean(account?.conflicts.length) && ' · Review sync'}
  </Link>;
}
