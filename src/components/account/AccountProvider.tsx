'use client';

import {createContext, Fragment, useContext, useEffect, useRef, useState, type ReactNode} from 'react';
import {usePathname} from 'next/navigation';
import {ACCOUNT_STORAGE_CHANGE, setStorageAccount} from '@/lib/account-storage';
import {accountConfigured} from '@/lib/account-config';
import type {Conflict, syncAccount} from '@/lib/account-sync';
import type {User} from 'firebase/auth';

type Sync = typeof syncAccount;
type Job = Exclude<Parameters<Sync>[2], 'upload'>;
type Resolution = Parameters<Sync>[4];
type Account = {
  user: User | null;
  busy: boolean;
  status: string;
  conflicts: Conflict[];
  run: (mode: Job, resolution?: Resolution) => Promise<void>;
};

const AccountContext = createContext<Account | null>(null);
export const useAccount = () => useContext(AccountContext);
export default function AccountProvider({children}: {children: ReactNode}) {
  return accountConfigured ? <ConnectedAccount>{children}</ConnectedAccount> : children;
}

function ConnectedAccount({children}: {children: ReactNode}) {
  const path = usePathname();
  const needsAccountState = /^\/(account|games|productivity|projects)(\/|$)/.test(path);
  const accountPage = useRef(path === '/account');
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const runJob = useRef<(mode: Parameters<Sync>[2], resolution?: Resolution) => Promise<void>>(async () => {});

  useEffect(() => {
    accountPage.current = path === '/account';
  }, [path]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let uploadTimer: ReturnType<typeof setTimeout> | undefined;
    let gameTimeTimer: ReturnType<typeof setTimeout> | undefined;
    let periodic: ReturnType<typeof setInterval> | undefined;
    let stopped = false;
    let syncing = false;
    const lifetime = new AbortController();

    function scheduleUpload() {
      if (uploadTimer) return;
      uploadTimer = setTimeout(() => {
        uploadTimer = undefined;
        if (syncing) scheduleUpload();
        else void runJob.current('upload');
      }, 12_000);
    }
    function handleStorage(event: StorageEvent) {
      if (event.key?.endsWith(':logic-screen-time-v1')) scheduleGameTime();
      else if (event.key?.startsWith('arpit.account:') && !event.key.includes(':sync:')) scheduleUpload();
    }
    function onToolChange(event: Event) {
      if ((event as CustomEvent<string>).detail === 'logic-screen-time-v1') scheduleGameTime();
      else scheduleUpload();
    }
    function scheduleGameTime() {
      if (!gameTimeTimer) {
        gameTimeTimer = setTimeout(() => {
          gameTimeTimer = undefined;
          scheduleUpload();
        }, 48_000);
      }
    }
    function onReturn() {
      if (document.visibilityState === 'visible') {
        void runJob.current(accountPage.current ? 'download' : 'upload');
      }
    }
    function onConnectivity() {
      if (navigator.onLine) onReturn();
      else if (!stopped) setStatus('You’re offline. Changes are saved on this device.');
    }
    window.addEventListener(ACCOUNT_STORAGE_CHANGE, onToolChange);
    window.addEventListener('storage', handleStorage);
    window.addEventListener('online', onConnectivity);
    window.addEventListener('offline', onConnectivity);
    document.addEventListener('visibilitychange', onReturn);

    async function connect() {
      try {
        const [{accountFirebase}, {onAuthStateChanged}, {syncAccount}] = await Promise.all([
          import('@/lib/account-firebase'), import('firebase/auth'), import('@/lib/account-sync'),
        ]);
        if (stopped) return;
        const {auth, db} = accountFirebase();
        let initialized = false;
        let previousUid: string | undefined;
        unsubscribe = onAuthStateChanged(auth, async current => {
          if (stopped) return;
          if (initialized) {
            // Existing tool instances may still hold the previous profile in memory.
            if (current?.uid !== previousUid) window.location.reload();
            return;
          }
          initialized = true;
          previousUid = current?.uid;
          setUser(current);
          if (current) {
            const uid = current.uid;
            let openingAccount = true;
            setStorageAccount(uid);
            runJob.current = async (mode, resolution) => {
              if (syncing || stopped || auth.currentUser?.uid !== uid) return;
              if (!navigator.onLine) {
                setStatus('You’re offline. Changes are saved on this device.');
                return;
              }
              syncing = true;
              if (mode !== 'upload') setBusy(true);
              const timeout = AbortSignal.timeout(readyTimeout(mode));
              const signal = AbortSignal.any([lifetime.signal, timeout]);
              const job = () => syncAccount(db, uid, mode, signal, resolution, () =>
                openingAccount || window.location.pathname === '/account');
              try {
                const result = navigator.locks
                  ? await navigator.locks.request(`arpit-sync:${uid}`, {signal}, job)
                  : await job();
                if (signal.aborted) return;
                setConflicts(existing => {
                  const retained = existing.filter(item => {
                    if (result.errors.includes(item.dataset)) return true;
                    if (resolution) return item.dataset !== resolution.dataset;
                    if (mode === 'upload') return true;
                    return item.source !== (mode === 'import' ? 'browser' : 'device');
                  });
                  return [...retained, ...result.conflicts.filter(item =>
                    !retained.some(old => old.dataset === item.dataset && old.source === item.source))];
                });
                if (result.pending) scheduleUpload();
                setStatus(result.errors.length
                  ? 'Some changes could not sync. Your local data is available. Try syncing again.'
                  : result.conflicts.length
                    ? 'Review the versions below to finish syncing.'
                    : result.pending ? 'Waiting for your latest changes…' : 'Your saved changes are synced.');
              } catch {
                if (!stopped) setStatus('Could not reach sync. Your saved changes are available on this device.');
              } finally {
                syncing = false;
                if (!stopped) setBusy(false);
              }
            };
            // A slow connection should not block the locally cached tools.
            let initialWait: ReturnType<typeof setTimeout> | undefined;
            await Promise.race([
              runJob.current('download'),
              new Promise<void>(resolve => { initialWait = setTimeout(resolve, 8_000); }),
            ]);
            clearTimeout(initialWait);
            openingAccount = false;
            if (stopped) return;
            periodic = setInterval(onReturn, 60_000);
          }
          setReady(true);
        }, () => {
          if (!stopped) {
            setStatus('Account sign-in could not load. Try refreshing.');
            setReady(true);
          }
        });
      } catch {
        if (!stopped) {
          setStatus('Account sign-in could not load. Try refreshing.');
          setReady(true);
        }
      }
    }

    void connect();
    return () => {
      stopped = true;
      lifetime.abort();
      unsubscribe?.();
      clearTimeout(uploadTimer);
      clearTimeout(gameTimeTimer);
      clearInterval(periodic);
      window.removeEventListener(ACCOUNT_STORAGE_CHANGE, onToolChange);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('online', onConnectivity);
      window.removeEventListener('offline', onConnectivity);
      document.removeEventListener('visibilitychange', onReturn);
    };
  }, []);

  return <AccountContext.Provider value={{
    user, busy, status, conflicts, run: (mode, resolution) => runJob.current(mode, resolution),
  }}>
    {ready || !needsAccountState
      ? <Fragment key={ready ? user?.uid ?? 'guest' : 'guest'}>{children}</Fragment>
      : <p role="status" style={{padding: '5rem 1.5rem', textAlign: 'center'}}>Loading your tools…</p>}
  </AccountContext.Provider>;
}

function readyTimeout(mode: Parameters<Sync>[2]) {
  return mode === 'upload' ? 20_000 : 8_000;
}
