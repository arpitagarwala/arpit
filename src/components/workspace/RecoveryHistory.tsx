'use client';
import {useEffect, useState} from 'react';
import {
  datasets,
  restoreVersion,
  toolStorageNamespace,
  type Dataset,
} from '@/lib/account-storage';
import {
  clearRecovery,
  recoveryEntries,
  RECOVERY_CHANGE,
  type RecoveryEntry,
} from '@/lib/recovery-store';
import s from './widgets.module.css';

export default function RecoveryHistory() {
  const [entries, setEntries] = useState<RecoveryEntry[]>([]);
  const [chosen, setChosen] = useState<RecoveryEntry | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let live = true;
    const load = () => {
      void recoveryEntries(toolStorageNamespace() ?? 'guest')
        .then((items) => {
          if (live) setEntries(items);
        })
        .catch(() => {
          if (live)
            setMessage('Recovery history is unavailable in this browser.');
        });
    };
    load();
    window.addEventListener(RECOVERY_CHANGE, load);
    return () => {
      live = false;
      window.removeEventListener(RECOVERY_CHANGE, load);
    };
  }, []);

  async function restore() {
    if (!chosen || busy) return;
    setBusy(true);
    try {
      await restoreVersion(
        chosen.dataset as Dataset,
        JSON.stringify(chosen.values),
        chosen.time,
      );
      setChosen(null);
      setMessage(
        'Version restored. Your previous version is also in recovery history.',
      );
    } catch (failure) {
      setMessage(
        failure instanceof Error
          ? failure.message
          : 'The version could not be restored.',
      );
    } finally {
      setBusy(false);
    }
  }
  async function clear() {
    setBusy(true);
    try {
      await clearRecovery(toolStorageNamespace() ?? 'guest');
      setChosen(null);
      setMessage('Recovery history cleared for this profile.');
    } catch {
      setMessage('History could not be cleared.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <details className={s.settings}>
      <summary>
        Recovery history{' '}
        <span>
          · {entries.length} saved version{entries.length === 1 ? '' : 's'}
        </span>
      </summary>
      <p>
        Earlier versions from this device. Up to eight per tool are kept within
        the browser’s storage limits. Restoring a version replaces that tool’s
        saved data and then syncs it if you’re signed in.
      </p>
      <div className={s.choices}>
        {entries.map((entry) => (
          <button
            key={entry.id}
            onClick={() => {
              setChosen(entry);
              setMessage('');
            }}
            aria-pressed={chosen?.id === entry.id}
          >
            <span>
              {datasets[entry.dataset as Dataset]?.label ?? entry.dataset}
              <small style={{display: 'block', marginTop: 4}}>
                {new Date(entry.time).toLocaleString()} ·{' '}
                {entry.reason === 'cloud'
                  ? 'Before sync'
                  : entry.reason === 'restore'
                    ? 'Before restore'
                    : 'Before edit'}
              </small>
            </span>
          </button>
        ))}
      </div>
      {!entries.length && (
        <p>Earlier saves will appear here as you edit your tools.</p>
      )}
      {chosen && (
        <div>
          <p>
            Restore {datasets[chosen.dataset as Dataset]?.label} from{' '}
            {new Date(chosen.time).toLocaleString()}?
          </p>
          <pre
            style={{
              maxHeight: 200,
              overflow: 'auto',
              fontSize: 11,
              whiteSpace: 'pre-wrap',
              overflowWrap: 'anywhere',
            }}
          >
            {Object.entries(chosen.values)
              .map(([key, value]) => key + '\n' + (value ?? 'Empty'))
              .join('\n\n')
              .slice(0, 4000)}
          </pre>
          <div className={s.actions}>
            <button
              className={s.primary}
              disabled={busy}
              onClick={() => void restore()}
            >
              Restore this version
            </button>
            <button
              className={s.secondary}
              disabled={busy}
              onClick={() => setChosen(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {Boolean(entries.length) && (
        <div className={s.actions}>
          <button
            className={s.secondary}
            disabled={busy}
            onClick={() => void clear()}
          >
            Clear recovery history
          </button>
        </div>
      )}
      <p role="status">{message}</p>
    </details>
  );
}
