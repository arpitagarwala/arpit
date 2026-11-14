import {PUZZLES} from '../data/puzzles';

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
    localStorage.setItem(scoped, value);
    if (activeAccount) window.dispatchEvent(new CustomEvent(ACCOUNT_STORAGE_CHANGE, {detail: key}));
  },
  removeItem(key: string) {
    const scoped = scopedKey(key);
    if (localStorage.getItem(scoped) === null) return;
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

export function writeDataset(uid: string, values: DatasetValues) {
  const previous = Object.fromEntries(Object.keys(values).map(key => {
    const scoped = accountKey(uid, key);
    return [scoped, localStorage.getItem(scoped)];
  }));
  function write(key: string, value: string | null) {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  }
  try {
    // Remove the old values first so a replacement can use the same available space.
    Object.keys(previous).forEach(key => localStorage.removeItem(key));
    Object.entries(values).forEach(([key, value]) => write(accountKey(uid, key), value));
  } catch (error) {
    Object.keys(previous).forEach(key => localStorage.removeItem(key));
    Object.entries(previous).forEach(([key, value]) => write(key, value));
    throw error;
  }
  window.dispatchEvent(new CustomEvent(ACCOUNT_DATA_RESTORED, {detail: values}));
}
