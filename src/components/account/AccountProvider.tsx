'use client';

import {createContext, Fragment, useContext, useEffect, useRef, useState, type ReactNode} from 'react';
import {usePathname} from 'next/navigation';
import {ACCOUNT_STORAGE_CHANGE, accountKey, datasetNames, setStorageAccount, type Dataset} from '@/lib/account-storage';
import {accountConfigured} from '@/lib/account-config';
import type {Conflict, syncAccount} from '@/lib/account-sync';
import type {User} from 'firebase/auth';

type Sync = typeof syncAccount;
type Mode = Parameters<Sync>[2];
type Resolution = Parameters<Sync>[4];
type Manifests = NonNullable<Parameters<Sync>[6]>;
type Account = {
  user: User | null;
  busy: boolean;
  signingOut: boolean;
  status: string;
  conflicts: Conflict[];
  run: (mode: Mode, resolution?: Resolution) => Promise<void>;
  signOut: () => Promise<void>;
};

const syncDelay = 5_000;
const AccountContext = createContext<Account | null>(null);
export const useAccount = () => useContext(AccountContext);

export default function AccountProvider({children}: {children: ReactNode}) {
  return accountConfigured ? <ConnectedAccount>{children}</ConnectedAccount> : children;
}

// These tools keep a board or editable draft in memory. Restore remote saves after leaving them.
const protectedRoutes: Partial<Record<Dataset, string>> = {
  game2048: '/games/2048',
  sudoku: '/games/sudoku',
  memory: '/games/memory',
  expenses: '/projects/expense-splitter',
  calculator: '/projects/calculator',
  clock: '/projects/clock',
  readme: '/projects/github-readme-maker',
};

function routeForDataset(dataset: Dataset) {
  if (dataset.startsWith('puzzle-')) return '/games/' + dataset.slice('puzzle-'.length);
  return protectedRoutes[dataset];
}

function isOpen(dataset: Dataset, path: string) {
  if (dataset === 'journal') return path.startsWith('/projects/finance');
  return routeForDataset(dataset) === path;
}

function activeToolLock(uid: string, dataset: Dataset) {
  return 'arpit-active-tool:' + uid + ':' + dataset;
}

function ConnectedAccount({children}: {children: ReactNode}) {
  const path = usePathname();
  const needsAccountState = /^\/(account|games|productivity|projects)(\/|$)/.test(path);
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [busy, setBusy] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [status, setStatus] = useState('');
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const runJob = useRef<Account['run']>(async () => {});
  const signOutJob = useRef<Account['signOut']>(async () => {});
  const checkDeferred = useRef(() => {});

  useEffect(() => {
    checkDeferred.current();
    if (!user || !navigator.locks) return;
    const dataset = datasetNames.find(name => isOpen(name, path));
    if (!dataset) return;
    const controller = new AbortController();
    let release: () => void = () => {};
    const closed = new Promise<void>(resolve => { release = resolve; });
    void navigator.locks.request(activeToolLock(user.uid, dataset), {
      mode: 'shared', signal: controller.signal,
    }, () => closed).catch(() => {});
    return () => {
      release();
      controller.abort();
    };
  }, [path, user]);

  useEffect(() => {
    let unsubscribeAuth: (() => void) | undefined;
    let unsubscribeCloud: (() => void) | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let uid: string | undefined;
    let cloud: Manifests | undefined;
    let deferred = false;
    let exiting = false;
    let automaticQueued = false;
    let queue = Promise.resolve();
    const lifetime = new AbortController();

    function schedule(delay = syncDelay) {
      if (!uid || timer || exiting || lifetime.signal.aborted || !navigator.onLine) return;
      timer = setTimeout(() => {
        timer = undefined;
        enqueue('download', undefined, true);
      }, delay);
    }

    let execute: (mode: Mode, resolution?: Resolution, automatic?: boolean) => Promise<void>;
    function enqueue(mode: Mode, resolution?: Resolution, automatic = false) {
      if (automatic && automaticQueued) return queue;
      if (automatic) automaticQueued = true;
      queue = queue.then(() => {
        if (automatic) automaticQueued = false;
        if (!lifetime.signal.aborted && (!exiting || !automatic)) return execute(mode, resolution, automatic);
      });
      return queue;
    }

    const localChange = () => schedule();
    const storageChange = (event: StorageEvent) => {
      if (uid && event.key?.startsWith(accountKey(uid, '')) && !event.key.startsWith(accountKey(uid, 'sync:'))) schedule();
    };
    const online = () => {
      clearTimeout(timer);
      timer = undefined;
      schedule(0);
    };
    const offline = () => { if (uid) setStatus('You’re offline. Changes are saved on this device.'); };
    const visible = () => { if (document.visibilityState === 'visible') online(); };
    window.addEventListener(ACCOUNT_STORAGE_CHANGE, localChange);
    window.addEventListener('storage', storageChange);
    window.addEventListener('online', online);
    window.addEventListener('offline', offline);
    document.addEventListener('visibilitychange', visible);
    checkDeferred.current = () => { if (deferred) schedule(0); };

    async function connect() {
      try {
        const [{accountFirebase}, {onAuthStateChanged, signOut}, {syncAccount, watchAccount}] = await Promise.all([
          import('@/lib/account-firebase'), import('firebase/auth'), import('@/lib/account-sync'),
        ]);
        if (lifetime.signal.aborted) return;
        const {auth, db} = accountFirebase();
        let initialized = false;
        unsubscribeAuth = onAuthStateChanged(auth, async current => {
          if (lifetime.signal.aborted) return;
          if (initialized) {
            if (current?.uid !== uid) {
              lifetime.abort();
              unsubscribeCloud?.();
              window.location.reload();
            }
            return;
          }
          initialized = true;
          uid = current?.uid;
          const accountUid = uid;
          setStorageAccount(accountUid ?? null);
          if (!accountUid) {
            setReady(true);
            return;
          }

          let opening = true;
          const canRestore = async (dataset: Dataset) => {
            if (!opening && isOpen(dataset, window.location.pathname)) return false;
            if (!navigator.locks || (!routeForDataset(dataset) && dataset !== 'journal')) return true;
            const name = activeToolLock(accountUid, dataset);
            const {held, pending} = await navigator.locks.query();
            return ![...(held ?? []), ...(pending ?? [])].some(lock => lock.name === name) &&
              (opening || !isOpen(dataset, window.location.pathname));
          };

          execute = async (mode, resolution, automatic) => {
            if (auth.currentUser?.uid !== accountUid) return;
            if (!navigator.onLine) {
              offline();
              return;
            }
            if (!automatic) setBusy(true);
            const signal = AbortSignal.any([lifetime.signal, AbortSignal.timeout(12_000)]);
            const job = () => syncAccount(db, accountUid, mode, signal, resolution,
              canRestore, automatic ? cloud : undefined);
            try {
              const result = navigator.locks
                ? await navigator.locks.request('arpit-sync:' + accountUid, {signal}, job)
                : await job();
              if (signal.aborted) return;
              if (!resolution && mode === 'download') deferred = result.deferred;
              setConflicts(existing => {
                const source = mode === 'import' ? 'browser' : 'device';
                const retained = existing.filter(item => {
                  if (result.conflicts.some(next => item.dataset === next.dataset && item.source === next.source)) return false;
                  if (result.errors.includes(item.dataset)) return true;
                  if (resolution) return result.deferred || result.pending || item.dataset !== resolution.dataset;
                  return item.source !== source;
                });
                return [...retained, ...result.conflicts];
              });
              if (result.pending) schedule();
              setStatus(result.errors.length ? 'Some changes could not sync. Your local data is available.'
                : result.conflicts.length ? 'Review the versions below to finish syncing.'
                : result.deferred ? 'This tool is open. Close it or leave the page to load the saved changes.'
                : result.pending ? 'Waiting for your latest changes…' : 'Your saved changes are synced.');
            } catch {
              if (lifetime.signal.aborted) return;
              setStatus('Could not reach sync. Your saved changes are available on this device.');
              if (automatic) schedule(30_000);
            } finally {
              if (!automatic && !lifetime.signal.aborted) setBusy(false);
            }
          };

          runJob.current = (mode, resolution) => enqueue(mode, resolution);
          signOutJob.current = async () => {
            if (exiting || lifetime.signal.aborted) return;
            exiting = true;
            setSigningOut(true);
            clearTimeout(timer);
            timer = undefined;
            try {
              await enqueue('download');
              await signOut(auth);
            } catch (error) {
              exiting = false;
              setSigningOut(false);
              schedule();
              throw error;
            }
          };

          let initialWait: ReturnType<typeof setTimeout> | undefined;
          await Promise.race([
            enqueue('download'),
            new Promise<void>(resolve => { initialWait = setTimeout(resolve, 8_000); }),
          ]);
          clearTimeout(initialWait);
          opening = false;
          if (lifetime.signal.aborted) return;
          setUser(current);
          setReady(true);
          unsubscribeCloud = watchAccount(db, accountUid, next => {
            const changed = !cloud || next.size !== cloud.size ||
              [...next].some(([name, manifest]) => cloud?.get(name)?.revision !== manifest.revision);
            cloud = next;
            if (changed) schedule(0);
          }, () => {
            cloud = undefined;
            setStatus('Live updates are unavailable. Use Sync now to retry.');
          });
        }, () => {
          if (lifetime.signal.aborted) return;
          setStatus('Account sign-in could not load. Try refreshing.');
          setReady(true);
        });
      } catch {
        if (lifetime.signal.aborted) return;
        setStatus('Account sign-in could not load. Try refreshing.');
        setReady(true);
      }
    }

    void connect();
    return () => {
      lifetime.abort();
      unsubscribeAuth?.();
      unsubscribeCloud?.();
      clearTimeout(timer);
      checkDeferred.current = () => {};
      window.removeEventListener(ACCOUNT_STORAGE_CHANGE, localChange);
      window.removeEventListener('storage', storageChange);
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offline);
      document.removeEventListener('visibilitychange', visible);
    };
  }, []);

  return <AccountContext.Provider value={{
    user, busy, signingOut, status, conflicts,
    run: (mode, resolution) => runJob.current(mode, resolution),
    signOut: () => signOutJob.current(),
  }}>
    {ready || !needsAccountState
      ? <Fragment key={ready ? user?.uid ?? 'guest' : 'guest'}>{children}</Fragment>
      : <p role="status" style={{padding: '5rem 1.5rem', textAlign: 'center'}}>Loading your tools…</p>}
  </AccountContext.Provider>;
}
