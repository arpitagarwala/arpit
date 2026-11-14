'use client';

import Link from 'next/link';
import {useAccount} from './AccountProvider';
import {accountConfigured} from '@/lib/account-config';

export function AccountLink({className}: {className?: string}) {
  const account = useAccount();
  if (!accountConfigured) return null;
  return <Link href="/account" className={className}>
    {account?.user ? 'Your account' : 'Sign in to sync'}
    {Boolean(account?.conflicts.length) && ' · Review sync'}
  </Link>;
}
