import { parseJournal, type Journal } from './trade-journal.ts';
export type TradeVisuals={id:string;images:{name:string;url:string}[]};
export function validateVisuals(value:unknown):TradeVisuals {
  if(!value||typeof value!=='object')throw new Error('Invalid screenshot record.');const v=value as TradeVisuals;
  if(typeof v.id!=='string'||!v.id||v.id.length>100||!Array.isArray(v.images)||v.images.length>3)throw new Error('Each trade supports up to 3 screenshots.');
  const images=v.images.map(img=>{if(!img||typeof img.name!=='string'||img.name.length>200||typeof img.url!=='string'||img.url.length>2800000||!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(img.url))throw new Error('Use PNG, JPEG or WebP screenshots up to 2 MB each.');return{name:img.name,url:img.url};});
  // Restore screenshots from old backups, ignoring retired chart metadata.
  return{id:v.id,images};
}
export function parseVisualBackup(raw:string):{journal:Journal;visuals:TradeVisuals[]}{
  if(raw.length>100000000)throw new Error('Backup exceeds 100 MB.');const obj=JSON.parse(raw);
  if(!obj||typeof obj!=='object')throw new Error('Invalid journal backup.');
  if(obj.format!=='trade-journal-with-visuals')return{journal:parseJournal(raw),visuals:[]};
  if(obj.version!==1||!Array.isArray(obj.visuals)||obj.visuals.length>2000)throw new Error('Invalid visual backup format.');
  const journal=parseJournal(JSON.stringify(obj.journal)),ids=new Set(journal.trades.map(t=>t.id)),seen=new Set<string>();
  const visuals=obj.visuals.map((v:unknown)=>{const item=validateVisuals(v);if(!ids.has(item.id)||seen.has(item.id))throw new Error('Screenshots must match unique trades in the backup.');seen.add(item.id);return item;});return{journal,visuals};
}
