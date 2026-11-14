'use client';

import Link from 'next/link';
import {accountConfigured} from '@/lib/account-config';

export function AccountLink({className}: {className?: string}) {
  if (!accountConfigured) return null;
  return <Link href="/account" className={className}>
    Sign in
  </Link>;
}
