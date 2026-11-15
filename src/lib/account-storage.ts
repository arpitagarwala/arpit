import {PUZZLES} from '../data/puzzles';
import {rememberVersion} from './recovery-store';

const puzzleDatasets = Object.fromEntries(PUZZLES.map(({slug, title}) => [`puzzle-${slug}`, {
  label: title, keys: [`logic-room:${slug}:v1`, `logic-room:${slug}:v1:metrics`],
}])) as Record<`puzzle-${string}`, {label: string; keys: string[]}>;

export const datasets = {
  study: { label: 'Tasks and focus history', keys: ['study-room-v1'] },
  quiet: { label: 'Quiet Space settings', keys: ['quiet-space-v1'] },
  training: { label: 'Game training progress', keys: ['logic-training-v1'] },
  gameTime: { label: 'Game screen time', keys: ['logic-screen-time-v1'] },
  game2048: { label: '2048', keys: ['2048-save', '2048-best'] },
  sudoku: { label: 'Sudoku', keys: ['sudoku-session-v1', 'sudoku-best'] },
  memory: { label: 'Memory game records', keys: ['memBest_easy', 'memBest_medium', 'memBest_hard'] },
  journal: { label: 'Trade journal records', keys: ['arpit.trade-journal.v1'] },
  expenses: { label: 'Expense Splitter', keys: ['splitter-people', 'splitter-transactions'] },
  calculator: { label: 'Calculator history', keys: ['calcHistory'] },
  clock: { label: 'Clock settings', keys: ['clock-preferences-v1'] },
  readme: { label: 'README Studio drafts', keys: ['readme-studio:current', 'readme-studio:saved'] },
  ...puzzleDatasets,
} as const;

export type Dataset = keyof typeof datasets;
export type DatasetValues = Record<string, string | null>;
export const datasetNames = Object.keys(datasets) as Dataset[];
export const ACCOUNT_STORAGE_CHANGE = 'account-storage-change';
export const ACCOUNT_DATA_RESTORED = 'account-data-restored';
const syncedKeys = new Set<string>(Object.values(datasets).flatMap(({keys}) => [...keys]));
let activeAccount: string | null = null;

export function setStorageAccount(uid: string | null) {
  activeAccount = uid;
}

export function hasStorageAccount() {
  return activeAccount !== null;
}

export function toolStorageNamespace() {
  return activeAccount;
}

export function toolStorageKey(key: string) {
  return scopedKey(key);
}

export function accountKey(uid: string, key: string) {
  return `arpit.account:${uid}:${key}`;
}

function scopedKey(key: string) {
  if (!syncedKeys.has(key)) throw new Error('Unknown tool storage key.');
  return activeAccount ? accountKey(activeAccount, key) : key;
}

export const toolStorage = {
  getItem(key: string) {
    return localStorage.getItem(scopedKey(key));
  },
  setItem(key: string, value: string) {
    const scoped = scopedKey(key);
    if (localStorage.getItem(scoped) === value) return;
    checkpoint(key, 'edit');
    localStorage.setItem(scoped, value);
    if (activeAccount) window.dispatchEvent(new CustomEvent(ACCOUNT_STORAGE_CHANGE, {detail: key}));
  },
  removeItem(key: string) {
    const scoped = scopedKey(key);
    if (localStorage.getItem(scoped) === null) return;
    checkpoint(key, 'edit');
    localStorage.removeItem(scoped);
    if (activeAccount) window.dispatchEvent(new CustomEvent(ACCOUNT_STORAGE_CHANGE, {detail: key}));
  },
};

export function readDataset(uid: string | null, dataset: Dataset): DatasetValues {
  return Object.fromEntries(datasets[dataset].keys.map(key => [
    key, localStorage.getItem(uid ? accountKey(uid, key) : key),
  ]));
}

export function decodeDataset(dataset: Dataset, raw: string): DatasetValues {
  const data: unknown = JSON.parse(raw);
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid synced data.');
  const values = data as Record<string, unknown>;
  const keys = datasets[dataset].keys;
  if (Object.keys(values).length !== keys.length ||
      keys.some(key => values[key] !== null && typeof values[key] !== 'string')) {
    throw new Error('Invalid synced tool values.');
  }
  return Object.fromEntries(keys.map(key => [key, values[key] as string | null]));
}

export function writeDataset(uid: string | null, values: DatasetValues) {
  const first = Object.keys(values)[0];
  if (first) checkpoint(first, 'cloud');
  const previous = Object.fromEntries(Object.keys(values).map(key => {
    const scoped = uid ? accountKey(uid, key) : key;
    return [scoped, localStorage.getItem(scoped)];
  }));
  function write(key: string, value: string | null) {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  }
  try {
    // Remove the old values first so a replacement can use the same available space.
    Object.keys(previous).forEach(key => localStorage.removeItem(key));
    Object.entries(values).forEach(([key, value]) => write(uid ? accountKey(uid, key) : key, value));
  } catch (error) {
    Object.keys(previous).forEach(key => localStorage.removeItem(key));
    Object.entries(previous).forEach(([key, value]) => write(key, value));
    throw error;
  }
  window.dispatchEvent(new CustomEvent(ACCOUNT_DATA_RESTORED, {detail: values}));
}

function checkpoint(key: string, reason: string) {
  const dataset = datasetNames.find(name => (datasets[name].keys as readonly string[]).includes(key));
  if (dataset === undefined || dataset === 'gameTime') return;
  void rememberVersion(activeAccount ?? 'guest', dataset, readDataset(activeAccount, dataset), reason).catch(() => {});
}

export async function restoreVersion(dataset: Dataset, raw: string, capturedAt = Date.now()) {
  const values = decodeDataset(dataset, raw);
  if (dataset === 'study' && values['study-room-v1']) {
    const current = JSON.parse(toolStorage.getItem('study-room-v1') ?? '{}');
    if (current.sessionId) throw new Error('End your current focus session before restoring study history.');
    const restored = JSON.parse(values['study-room-v1']);
    if (typeof restored.deadline === 'number') {
      restored.remaining = Math.max(0,Math.ceil((restored.deadline-capturedAt)/1000));
      restored.deadline = null;
      restored.startedAt = null;
      values['study-room-v1'] = JSON.stringify(restored);
    }
  }
  const profile = activeAccount;
  const restore = async () => {
    if (activeAccount !== profile) throw new Error('Your account changed. Reload before restoring.');
    if (dataset === 'study' && JSON.parse(toolStorage.getItem('study-room-v1') ?? '{}').sessionId) {
      throw new Error('End your current focus session before restoring study history.');
    }
    await rememberVersion(profile ?? 'guest', dataset, readDataset(profile, dataset), 'restore');
    if (activeAccount !== profile) throw new Error('Your account changed. Reload before restoring.');
    writeDataset(profile,values);
    window.dispatchEvent(new CustomEvent(ACCOUNT_STORAGE_CHANGE, {detail: datasets[dataset].keys[0]}));
  };
  const guardedRestore = () => dataset === 'study' && navigator.locks
    ? navigator.locks.request('study-room-v1',restore)
    : restore();
  if (!navigator.locks) return guardedRestore();
  return navigator.locks.request('arpit-active-tool:' + profile + ':' + dataset, {ifAvailable: true}, async lock => {
    if (!lock) throw new Error('Close this tool in your other tabs before restoring.');
    if (profile) return navigator.locks.request('arpit-sync:' + profile, guardedRestore);
    return guardedRestore();
  });
}
