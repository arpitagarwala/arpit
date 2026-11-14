import {
  Bytes, collection, doc, getDocsFromServer, runTransaction, serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import {
  accountKey, datasetNames, decodeDataset, readDataset, writeDataset,
  type Dataset, type DatasetValues,
} from './account-storage';

const chunkSize = 500_000;
const maxChunks = 20;
const encoder = new TextEncoder();
const empty = (values: DatasetValues) => Object.values(values).every(value => value === null);

type Manifest = {revision: string; count: number};
type Baseline = {revision: string | null; hash: string};
export type Conflict = {dataset: Dataset; source: 'device' | 'browser'; revision: string | null};
type SyncMode = 'download' | 'upload' | 'import';
type Resolution = Omit<Conflict, 'source'> & {source: Conflict['source'] | 'cloud'};
type Result = {conflicts: Conflict[]; errors: Dataset[]; pending: boolean};

async function digest(raw: string) {
  const bytes = await crypto.subtle.digest('SHA-256', encoder.encode(raw));
  return Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, '0')).join('');
}

function split(raw: string) {
  const bytes = encoder.encode(raw);
  const chunks: Uint8Array[] = [];
  for (let start = 0; start < bytes.length; start += chunkSize) {
    chunks.push(bytes.subarray(start, start + chunkSize));
  }
  if (chunks.length > maxChunks) throw new Error('This tool exceeds the account sync size limit.');
  return chunks;
}

class RemoteChanged extends Error {}
class LocalChanged extends Error {}

export async function syncAccount(
  db: Firestore, uid: string, mode: SyncMode, signal: AbortSignal,
  resolution?: Resolution, canReplaceDevice = () => true,
): Promise<Result> {
  const tools = collection(db, 'accounts', uid, 'tools');
  // Uploads only check dirty tools to keep daily reads low.
  const list = mode === 'upload' ? null : await getDocsFromServer(tools);
  signal.throwIfAborted();
  const result: Result = {conflicts: [], errors: [], pending: false};

  for (const dataset of resolution ? [resolution.dataset] : datasetNames) {
    const metadataKey = accountKey(uid, `sync:${dataset}`);
    const manifestRef = doc(tools, dataset);
    const chunkRef = (index: number) => doc(manifestRef, 'chunks', String(index));
    const cloud = (list?.docs.find(item => item.id === dataset)?.data() ?? null) as Manifest | null;

    async function download(expected: Manifest | null) {
      const raw = await runTransaction(db, async transaction => {
        signal.throwIfAborted();
        const current = (await transaction.get(manifestRef)).data() as Manifest | undefined;
        if ((current?.revision ?? null) !== (expected?.revision ?? null)) throw new RemoteChanged();
        if (!current) return JSON.stringify(Object.fromEntries(Object.keys(deviceValues).map(key => [key, null])));
        if (!Number.isInteger(current.count) || current.count < 1 || current.count > maxChunks) {
          throw new Error('Invalid synced chunk count.');
        }
        const data = await Promise.all(Array.from({length: current.count}, (_, index) => transaction.get(chunkRef(index))));
        const decoder = new TextDecoder('utf-8', {fatal: true});
        return data.map(item => decoder.decode(item.data()!.payload.toUint8Array(), {stream: true})).join('') + decoder.decode();
      });
      const values = decodeDataset(dataset, raw);
      const hash = await digest(JSON.stringify(values));
      signal.throwIfAborted();
      if (!canReplaceDevice() || JSON.stringify(readDataset(uid, dataset)) !== deviceRaw) throw new LocalChanged();
      writeDataset(uid, values);
      saveBaseline(expected?.revision ?? null, hash);
    }

    async function upload(raw: string, expected: string | null) {
      const chunks = split(raw);
      const revision = crypto.randomUUID();
      await runTransaction(db, async transaction => {
        signal.throwIfAborted();
        const current = (await transaction.get(manifestRef)).data() as Manifest | undefined;
        if ((current?.revision ?? null) !== expected) throw new RemoteChanged();
        signal.throwIfAborted();
        chunks.forEach((payload, index) => transaction.set(chunkRef(index), {payload: Bytes.fromUint8Array(payload)}));
        for (let index = chunks.length; index < (current?.count ?? 0); index++) transaction.delete(chunkRef(index));
        transaction.set(manifestRef, {revision, count: chunks.length, updatedAt: serverTimestamp()});
      });
      signal.throwIfAborted();
      return revision;
    }

    function saveBaseline(revision: string | null, hash: string) {
      localStorage.setItem(metadataKey, JSON.stringify({revision, hash}));
    }

    const deviceValues = readDataset(uid, dataset);
    const deviceRaw = JSON.stringify(deviceValues);
    let source: Conflict['source'] = 'device';
    let observedRevision = cloud?.revision ?? null;
    try {
      signal.throwIfAborted();
      if (resolution && resolution.revision !== (cloud?.revision ?? null)) {
        result.conflicts.push({dataset, source: resolution.source === 'browser' ? 'browser' : 'device', revision: cloud?.revision ?? null});
        continue;
      }
      const baseline = JSON.parse(localStorage.getItem(metadataKey) ?? 'null') as Baseline | null;
      const hash = await digest(deviceRaw);
      const deviceChanged = baseline ? baseline.hash !== hash : !empty(deviceValues);
      const cloudChanged = (cloud?.revision ?? null) !== (baseline?.revision ?? null);

      if (resolution?.source === 'cloud') {
        await download(cloud);
      } else if (mode === 'import' || resolution?.source === 'browser') {
        source = 'browser';
        const browserValues = readDataset(null, dataset);
        if (empty(browserValues)) continue;
        const browserRaw = JSON.stringify(browserValues);
        if (!resolution && (cloud || !empty(deviceValues)) && browserRaw !== deviceRaw) {
          result.conflicts.push({dataset, source, revision: cloud?.revision ?? null});
          continue;
        }
        if (browserRaw === deviceRaw && !resolution) continue;
        if (!canReplaceDevice() || JSON.stringify(readDataset(uid, dataset)) !== deviceRaw) throw new LocalChanged();
        const browserHash = await digest(browserRaw);
        const revision = await upload(browserRaw, cloud?.revision ?? null);
        if (!canReplaceDevice() || JSON.stringify(readDataset(uid, dataset)) !== deviceRaw) throw new LocalChanged();
        writeDataset(uid, browserValues);
        saveBaseline(revision, browserHash);
      } else if (resolution?.source === 'device') {
        saveBaseline(await upload(deviceRaw, cloud?.revision ?? null), hash);
      } else if (deviceChanged) {
        if (mode !== 'upload' && cloudChanged) result.conflicts.push({dataset, source, revision: observedRevision});
        else {
          observedRevision = mode === 'upload' ? baseline?.revision ?? null : observedRevision;
          saveBaseline(await upload(deviceRaw, baseline?.revision ?? null), hash);
        }
      } else if (mode !== 'upload' && cloudChanged) {
        await download(cloud);
      }
    } catch (error) {
      signal.throwIfAborted();
      if (error instanceof RemoteChanged) result.conflicts.push({dataset, source, revision: observedRevision});
      else if (error instanceof LocalChanged) result.pending = true;
      else result.errors.push(dataset);
    }
  }
  return result;
}
