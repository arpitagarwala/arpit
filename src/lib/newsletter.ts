export const NEWSLETTER_URL='https://fintechhorizon.substack.com';
export type NewsletterSort='newest'|'oldest'|'shortest';
export type NewsletterPost={title:string;subtitle:string;excerpt:string;link:string;publishedAt:number|null;dateLabel:string;isoDate:string|null;thumbnail:string|null;readingMinutes:number|null};

function plain(value:unknown,max=2000):string {
 if(typeof value!=='string')return '';
 return value.replace(/<[^>]*>/g,' ').replace(/&(?:amp|quot|apos|nbsp|lt|gt);/g,entity=>({'&amp;':'&','&quot;':'"','&apos;':"'",'&nbsp;':' ','&lt;':'<','&gt;':'>'}[entity]||entity)).replace(/\s+/g,' ').trim().slice(0,max);
}
function imageUrl(value:unknown):string|null {
 if(typeof value!=='string')return null;
 try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password?url.href:null;}catch{return null;}
}
export function parseNewsletterPosts(payload:unknown):NewsletterPost[] {
 if(!Array.isArray(payload))throw new Error('The publication feed is unavailable.');
 const seen=new Set<string>(),posts:NewsletterPost[]=[];
 for(const entry of payload){
  if(!entry||typeof entry!=='object')continue;
  const item=entry as Record<string,unknown>,title=plain(item.title,600);
  if(!title)continue;
  let link:string;
  try{const raw=typeof item.canonical_url==='string'?item.canonical_url:typeof item.slug==='string'?NEWSLETTER_URL+'/p/'+encodeURIComponent(item.slug):'';const url=new URL(raw);if(url.origin!==NEWSLETTER_URL||!/^\/p\/[^/]+\/?$/.test(url.pathname))continue;url.search='';url.hash='';url.pathname=url.pathname.replace(/\/$/,'');link=url.href;}catch{continue;}
  if(seen.has(link))continue;
  seen.add(link);
  const date=typeof item.post_date==='string'?Date.parse(item.post_date):NaN,publishedAt=Number.isFinite(date)?date:null;
  const subtitle=plain(item.subtitle,700),rawExcerpt=plain(item.truncated_body_text||item.description,2000);
  const words=typeof item.wordcount==='number'&&Number.isFinite(item.wordcount)&&item.wordcount>0?item.wordcount:null;
  const excerpt=rawExcerpt.length>220?rawExcerpt.slice(0,220).replace(/\s+\S*$/,'')+'…':rawExcerpt;
  posts.push({title,subtitle:subtitle.toLowerCase()===title.toLowerCase()?'':subtitle,excerpt:excerpt.toLowerCase()===title.toLowerCase()?'':excerpt,link,publishedAt,isoDate:publishedAt===null?null:new Date(publishedAt).toISOString(),dateLabel:publishedAt===null?'Date not listed':new Date(publishedAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric',timeZone:'Asia/Kolkata'}),thumbnail:imageUrl(item.cover_image),readingMinutes:words===null?null:Math.max(1,Math.ceil(words/200))});
 }
 if(payload.length&&!posts.length)throw new Error('The publication feed has no readable entries.');
 return selectNewsletterPosts(posts,'','newest');
}
export function selectNewsletterPosts(posts:NewsletterPost[],query:string,sort:NewsletterSort):NewsletterPost[]{
 const terms=query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
 return posts.filter(post=>{const text=(post.title+' '+post.subtitle+' '+post.excerpt).toLocaleLowerCase();return terms.every(term=>text.includes(term));}).sort((a,b)=>{
  if(sort==='shortest'){const time=(a.readingMinutes??Infinity)-(b.readingMinutes??Infinity);if(time&&!Number.isNaN(time))return time;}
  if(a.publishedAt===null)return b.publishedAt===null?0:1;
  if(b.publishedAt===null)return -1;
  return sort==='oldest'?a.publishedAt-b.publishedAt:b.publishedAt-a.publishedAt;
 });
}
