export type RecoveryEntry = {
  id: string;
  profile: string;
  dataset: string;
  time: number;
  reason: string;
  values: Record<string, string | null>;
};
const database = 'arpit-recovery';
export const RECOVERY_CHANGE = 'recovery-history-change';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(database, 1);
    request.onupgradeneeded = () => {
      request.result
        .createObjectStore('versions', {keyPath: 'id'})
        .createIndex('profile', 'profile');
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function recoveryEntries(
  profile: string,
): Promise<RecoveryEntry[]> {
  const db = await openDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const request = db
        .transaction('versions')
        .objectStore('versions')
        .index('profile')
        .getAll(profile);
      request.onsuccess = () =>
        resolve(
          (request.result as RecoveryEntry[]).sort((a, b) => b.time - a.time),
        );
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}

export async function rememberVersion(
  profile: string,
  dataset: string,
  values: RecoveryEntry['values'],
  reason: string,
) {
  if (Object.values(values).every((value) => value === null)) return;
  const raw = JSON.stringify(values);
  if (raw.length > 5_000_000) return;
  const db = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction('versions', 'readwrite');
      const store = transaction.objectStore('versions');
      const request = store.index('profile').getAll(profile);
      request.onsuccess = () => {
        const entries = (request.result as RecoveryEntry[]).sort(
          (a, b) => b.time - a.time,
        );
        const previous = entries.find((entry) => entry.dataset === dataset);
        if (
          previous &&
          (JSON.stringify(previous.values) === raw ||
            (reason === 'edit' && Date.now() - previous.time < 60_000))
        )
          return;
        const entry = {
          id: crypto.randomUUID(),
          profile,
          dataset,
          values,
          reason,
          time: Date.now(),
        };
        store.put(entry);
        const counts = new Map<string, number>();
        let bytes = raw.length * 2;
        for (const [index, old] of entries.entries()) {
          const count =
            (counts.get(old.dataset) ?? (old.dataset === dataset ? 1 : 0)) + 1;
          counts.set(old.dataset, count);
          bytes += JSON.stringify(old.values).length * 2;
          if (index >= 39 || count > 8 || bytes > 10_000_000)
            store.delete(old.id);
        }
      };
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
    window.dispatchEvent(new Event(RECOVERY_CHANGE));
  } finally {
    db.close();
  }
}

export async function clearRecovery(profile: string) {
  const db = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction('versions', 'readwrite');
      const store = transaction.objectStore('versions');
      const request = store.index('profile').openCursor(profile);
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
    window.dispatchEvent(new Event(RECOVERY_CHANGE));
  } finally {
    db.close();
  }
}
