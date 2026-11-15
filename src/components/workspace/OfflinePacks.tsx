'use client';
import {useEffect, useState, useSyncExternalStore} from 'react';
import s from './widgets.module.css';

type Pack = {id: string; title: string; description: string};
const packs: Pack[] = [
  {
    id: 'essentials',
    title: 'Everyday essentials',
    description: 'Widgets, Focus Room, Study Planner and Calculator.',
  },
  {
    id: 'games',
    title: 'Classic games',
    description: '2048, Memory, Sudoku and Tic Tac Toe.',
  },
];

function subscribeController(update: () => void) {
  navigator.serviceWorker?.addEventListener('controllerchange', update);
  return () =>
    navigator.serviceWorker?.removeEventListener('controllerchange', update);
}
const controllerReady = () => Boolean(navigator.serviceWorker?.controller);

async function send(
  type: string,
  pack?: string,
  progress?: (message: string) => void,
): Promise<{installed?: string[]; error?: string}> {
  const registration = await navigator.serviceWorker.getRegistration('/');
  const worker = registration?.active;
  if (!worker)
    throw new Error(
      'Reload after installing the app to prepare offline tools.',
    );
  return new Promise((resolve, reject) => {
    const channel = new MessageChannel();
    const timeout = setTimeout(() => {
      channel.port1.close();
      reject(new Error('The download timed out. Please retry.'));
    }, 180_000);
    channel.port1.onmessage = (event) => {
      const value = event.data;
      if (value.progress) {
        progress?.(value.progress);
        return;
      }
      clearTimeout(timeout);
      channel.port1.close();
      if (value.error) reject(new Error(value.error));
      else resolve(value);
    };
    const resources = performance
      .getEntriesByType('resource')
      .map((entry) => entry.name);
    worker.postMessage({type, pack, resources}, [channel.port2]);
  });
}

export default function OfflinePacks() {
  const [installed, setInstalled] = useState<string[]>([]);
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');
  const available = useSyncExternalStore(
    subscribeController,
    controllerReady,
    () => false,
  );
  useEffect(() => {
    let live = true;
    if (!available) return;
    void send('PACK_STATUS')
      .then((value) => {
        if (live) setInstalled(value.installed ?? []);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [available]);
  async function change(pack: string, remove = false) {
    setBusy(pack);
    setMessage(remove ? 'Removing offline pack…' : 'Preparing offline pack…');
    try {
      const value = await send(
        remove ? 'REMOVE_PACK' : 'INSTALL_PACK',
        pack,
        setMessage,
      );
      setInstalled(value.installed ?? []);
      setMessage(
        remove
          ? 'Offline pack removed. Your saved tool data stays on this device.'
          : 'Offline pack is ready. Open each tool once while online to load your account and saved settings.',
      );
    } catch (failure) {
      setMessage(
        failure instanceof Error
          ? failure.message
          : 'The pack could not be downloaded.',
      );
    } finally {
      setBusy('');
    }
  }
  return (
    <section className={s.settings}>
      <h2>Ready when you’re offline</h2>
      <p>
        Download the tools you want to open without a connection. Saved edits
        sync when you reconnect. Storage can be reclaimed by your browser.
      </p>
      {!available && (
        <p>
          Install the app or reload this page once to enable offline downloads.
        </p>
      )}
      {packs.map((pack) => (
        <div
          key={pack.id}
          style={{
            borderTop: '1px solid #34443d',
            paddingTop: 16,
            marginTop: 16,
          }}
        >
          <strong style={{fontSize: 14}}>{pack.title}</strong>
          <p>{pack.description}</p>
          <div className={s.actions}>
            <button
              disabled={!available || Boolean(busy)}
              className={s.primary}
              onClick={() => void change(pack.id)}
            >
              {busy === pack.id
                ? 'Please wait…'
                : installed.includes(pack.id)
                  ? 'Refresh pack'
                  : 'Download pack'}
            </button>
            {installed.includes(pack.id) && (
              <button
                disabled={Boolean(busy)}
                className={s.secondary}
                onClick={() => void change(pack.id, true)}
              >
                Remove pack
              </button>
            )}
          </div>
        </div>
      ))}
      <p role="status">{message}</p>
    </section>
  );
}
