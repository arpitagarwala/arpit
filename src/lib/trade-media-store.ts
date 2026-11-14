import { validateVisuals, type TradeVisuals } from './trade-visuals';
import { toolStorageNamespace } from './account-storage';
const practice=new Map<string,TradeVisuals>();
async function database():Promise<IDBDatabase>{const account=toolStorageNamespace();return new Promise((resolve,reject)=>{const request=indexedDB.open(account?'arpit.trade-visuals:'+account:'arpit.trade-visuals',1);request.onupgradeneeded=()=>request.result.createObjectStore('visuals',{keyPath:'id'});request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(new Error('Visual storage is unavailable. Your trade records are separate; try downloading a backup.'));});}
export async function readVisuals(id:string,sample=false):Promise<TradeVisuals>{
  if(sample)return practice.get(id)??{id,images:[]};const db=await database();
  try{return await new Promise((resolve,reject)=>{const tx=db.transaction('visuals','readonly'),r=tx.objectStore('visuals').get(id);r.onsuccess=()=>resolve(r.result?validateVisuals(r.result):{id,images:[]});r.onerror=()=>reject(new Error('Could not load this trade’s visuals.'));});}finally{db.close();}
}
export async function writeVisuals(value:TradeVisuals,sample=false,expected?:TradeVisuals):Promise<void>{
  const v=validateVisuals(value),same=(current:TradeVisuals|undefined)=>!expected||JSON.stringify(current?validateVisuals(current):{id:v.id,images:[]})===JSON.stringify(expected);
  if(sample){if(!same(practice.get(v.id)))throw new Error('Visuals changed in another view. Reload before editing.');practice.set(v.id,v);return;}const db=await database();
  try{await new Promise<void>((resolve,reject)=>{const tx=db.transaction('visuals','readwrite'),store=tx.objectStore('visuals');let conflict=false;const read=store.get(v.id);read.onsuccess=()=>{try{if(!same(read.result)){conflict=true;tx.abort();}else store.put(v);}catch{tx.abort();}};tx.oncomplete=()=>resolve();tx.onabort=tx.onerror=()=>reject(new Error(conflict?'Screenshots changed in another tab. Reload before editing; the other version was kept.':'Screenshots were not saved: browser storage is full or unavailable. Keep the original files and retry.'));});}finally{db.close();}
}
export async function removeVisuals(id:string,sample=false){if(sample){practice.delete(id);return;}const db=await database();try{await new Promise<void>((resolve,reject)=>{const tx=db.transaction('visuals','readwrite');tx.objectStore('visuals').delete(id);tx.oncomplete=()=>resolve();tx.onabort=tx.onerror=()=>reject(new Error('Could not remove visual files.'));});}finally{db.close();}}
