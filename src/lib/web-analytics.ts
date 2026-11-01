export const ANALYTICS_ACTIONS = ['focus-start','focus-pause','sound-play','sound-pause','break-start','break-pause','task-add','trade-save','export','puzzle-start','external-link'] as const;
export const ANALYTICS_ERRORS = ['script-error','resource-error','unhandled-rejection'] as const;
export const FEEDBACK_REASONS = ['','confusing','bug','missing-feature','slow','other'] as const;
export const ANALYTICS_RETENTION_DAYS = 90;
export const NETWORK_RETENTION_DAYS = 7;
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const publicPage = /^\/(?:$|about$|projects(?:\/(?:ai-assistant|expense-splitter|calculator|clock|github-readme-maker|typing|finance\/(?:sip|goal-planner|emi|fixed-deposit|position-size|trade-journal|methodology)))?$|games(?:\/[a-z0-9-]+)?$|productivity(?:\/(?:todo|pomodoro|rain))?$|gallery$|achievements$|newsletter$|tracker$|updates(?:\/[a-f0-9-]{36})?$)/;
export function analyticsPath(value: unknown): string | null {
  return typeof value === 'string' && value.length <= 160 && publicPage.test(value) && value !== '/games/progress' ? value : null;
}
export function analyticsSection(value: unknown) {
  return typeof value === 'string' && /^[a-z][a-z0-9-]{0,47}(?:\/[a-z][a-z0-9-]{0,47})?$/.test(value) ? value : 'page';
}
export function networkMask(ip: string): string {
  if(ip.toLowerCase().startsWith('::ffff:'))return networkMask(ip.slice(7));
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(ip) && ip.split('.').every(n => +n <= 255)) return ip.split('.').slice(0,3).join('.')+'.0/24';
  if (/^[a-f\d:]+$/i.test(ip) && ip.includes(':')) {const parts=ip.split('::');if(parts.length>2)return'';const left=parts[0]?parts[0].split(':'):[],right=parts[1]?parts[1].split(':'):[];if([...left,...right].some(v=>!v||v.length>4))return'';const missing=8-left.length-right.length;if(parts.length===1&&missing!==0||parts.length===2&&missing<1)return'';const groups=[...left,...Array(missing).fill('0'),...right];return groups.slice(0,3).map(v=>parseInt(v,16).toString(16)).join(':')+'::/48';}
  return '';
}
export function safeDomain(value: unknown): string {
  if (typeof value !== 'string' || !value) return '';
  try { const u = new URL(value.includes('://') ? value : 'https://'+value); return /^https?:$/.test(u.protocol) && !u.username && !u.password && /^[a-z0-9.-]{1,120}$/i.test(u.hostname) ? u.hostname.toLowerCase() : ''; } catch { return ''; }
}
export type AnalyticsEvent = {id:string;kind:'action'|'error';name:string;target:string};
export type AnalyticsPayload = {visitor:string;session:string;page:string;path:string;seq:number;started:number;active:number;scroll:number;sections:Record<string,number>;referrer:string;events:AnalyticsEvent[];feedback?:{value:'helpful'|'needs-work';reason:string}};
export function analyticsPayload(value: unknown, now=Date.now()): AnalyticsPayload {
  if (!value || typeof value!=='object') throw Error('Invalid analytics payload.');
  const v=value as Record<string,unknown>;
  for(const key of ['visitor','session','page'])if(typeof v[key]!=='string'||!uuid.test(v[key] as string))throw Error('Invalid analytics identifier.');
  const path=analyticsPath(v.path);if(!path)throw Error('Page is not tracked.');
  const integer=(key:string,max:number,min=0)=>{const n=v[key];if(typeof n!=='number'||!Number.isSafeInteger(n)||n<min||n>max)throw Error('Invalid '+key);return n;};
  const started=integer('started',now+60_000,now-86_400_000),active=integer('active',86_400_000),scroll=integer('scroll',100),seq=integer('seq',10000,1);
  if(active>now-started+60_000)throw Error('Active time exceeds elapsed time.');
  if(!v.sections||typeof v.sections!=='object'||Array.isArray(v.sections)||Object.keys(v.sections).length>32)throw Error('Invalid sections.');
  const sections:Record<string,number>={};let total=0;
  for(const [name,n]of Object.entries(v.sections)){if(analyticsSection(name)!==name||typeof n!=='number'||!Number.isSafeInteger(n)||n<0||n>active)throw Error('Invalid section time.');sections[name]=n;total+=n;}
  if(total>active+100)throw Error('Section time exceeds page time.');
  if(!Array.isArray(v.events)||v.events.length>12)throw Error('Too many events.');
  const events:AnalyticsEvent[]=v.events.map(event=>{
    if(!event||typeof event!=='object'||!uuid.test(event.id))throw Error('Invalid event.');
    const names=event.kind==='action'?ANALYTICS_ACTIONS:event.kind==='error'?ANALYTICS_ERRORS:[];
    if(!(names as readonly string[]).includes(event.name))throw Error('Unknown event.');
    return{id:event.id,kind:event.kind,name:event.name,target:event.name==='external-link'?safeDomain(event.target):''};
  });
  let feedback:AnalyticsPayload['feedback'];if(v.feedback){const f=v.feedback as Record<string,unknown>;if(!['helpful','needs-work'].includes(String(f.value))||!(FEEDBACK_REASONS as readonly unknown[]).includes(f.reason))throw Error('Invalid feedback.');feedback={value:f.value as 'helpful'|'needs-work',reason:f.reason as string};}
  return{visitor:v.visitor as string,session:v.session as string,page:v.page as string,path,seq,started,active,scroll,sections,referrer:safeDomain(v.referrer),events,...feedback&&{feedback}};
}
export function analyticsRange(from:unknown,to:unknown,now=Date.now()) {
  const day=(v:unknown)=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(Date.parse(v+'T00:00:00+05:30'))&&new Date(v+'T00:00:00Z').toISOString().slice(0,10)===v;
  if(!day(from)||!day(to))throw Error('Choose valid report dates.');
  const start=Date.parse(from+'T00:00:00+05:30'),end=Date.parse(to+'T00:00:00+05:30')+86_400_000;
  const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata'}).format(new Date(now));
  if(start>end-86_400_000||end-start>31*86_400_000||(to as string)>today||start<now-90*86_400_000)throw Error('Choose up to 31 days within the last 90 days, ending no later than today.');
  return{start,end,previousStart:start-(end-start),previousEnd:start,from:from as string,to:to as string};
}
export function analyticsCsv(tables:{title:string;columns:string[];rows:unknown[][]}[]) {
  const cell=(v:unknown)=>'"'+String(v??'').replace(/^([\s]*[=+@-])/,'\'$1').replaceAll('"','""')+'"';
  return '\ufeff'+tables.map(t=>[t.title,t.columns.map(cell).join(','),...t.rows.map(r=>r.map(cell).join(','))].join('\r\n')).join('\r\n\r\n');
}
