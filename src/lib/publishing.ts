export const CONTENT_KINDS=['update','project','trade-note'] as const;
export type ContentKind=typeof CONTENT_KINDS[number];
export type ContentStatus='draft'|'published'|'archived';
export type ContentEntry={id:string;title:string;summary:string;body:string;kind:ContentKind;status:ContentStatus;tags:string[];coverId:string|null;revision:number;createdAt:string;updatedAt:string;publishedAt:string|null};
export type ContentInput=Pick<ContentEntry,'title'|'summary'|'body'|'kind'|'status'|'tags'|'coverId'>&{revision:number};
export const KIND_LABELS:Record<ContentKind,string>={update:'Update',project:'Project note','trade-note':'Trade note'};
export const validContentId=(id:string)=>/^[a-f0-9-]{36}$/.test(id);
export function contentInput(value:unknown):ContentInput{
  if(!value||typeof value!=='object')throw new Error('Enter the content details.');const v=value as Record<string,unknown>;
  const text=(key:string,max:number)=>{if(typeof v[key]!=='string'||(v[key] as string).length>max)throw new Error(`${key}: maximum ${max.toLocaleString()} characters.`);return(v[key] as string).trim();};
  const title=text('title',140),summary=text('summary',280),body=text('body',20000);if(!title)throw new Error('Add a title before saving.');if(!CONTENT_KINDS.includes(v.kind as ContentKind))throw new Error('Choose a content type.');if(!['draft','published','archived'].includes(v.status as string))throw new Error('Choose a valid publishing status.');if(v.status==='published'&&(!body||!summary))throw new Error('Add a summary and body before publishing.');
  if(!Array.isArray(v.tags)||v.tags.length>5||v.tags.some(t=>typeof t!=='string'||!t.trim()||t.length>30))throw new Error('Use up to five tags, each under 30 characters.');if(v.coverId!==null&&(typeof v.coverId!=='string'||!validContentId(v.coverId)))throw new Error('Choose a valid cover image.');if(!Number.isInteger(v.revision)||(v.revision as number)<0)throw new Error('Reload this content before saving.');
  return{title,summary,body,kind:v.kind as ContentKind,status:v.status as ContentStatus,tags:[...new Set((v.tags as string[]).map(t=>t.trim()))],coverId:v.coverId as string|null,revision:v.revision as number};
}
export function imageType(bytes:Uint8Array){if(bytes.length>1024*1024||bytes.length<12)throw new Error('Choose a PNG, JPEG or WebP image up to 1 MB.');if(bytes[0]===0x89&&bytes[1]===0x50&&bytes[2]===0x4e&&bytes[3]===0x47&&bytes[4]===13&&bytes[5]===10&&bytes[6]===26&&bytes[7]===10)return'image/png';if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return'image/jpeg';if(String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP')return'image/webp';throw new Error('This file is not a supported image. SVG and document uploads are not supported.');}
