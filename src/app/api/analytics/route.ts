import {createHmac} from 'node:crypto';
import {cookies} from 'next/headers';
import {adminCall,backendConfig,OWNER_COOKIE} from '@/lib/admin-server';
import {analyticsPayload,networkMask} from '@/lib/web-analytics';
export const runtime='nodejs';
export async function POST(request:Request){
  // Local development, component previews and local production tests never become live traffic.
  if(!['arpitagarwala.com','www.arpitagarwala.com','www.arpitagarwala.online','arpitagarwala.online'].includes(new URL(request.url).hostname))return new Response(null,{status:204});
  const origin=new URL(request.url).origin;
  if(request.headers.get('origin')!==origin)return new Response(null,{status:403});
  if(!request.headers.get('content-type')?.includes('application/json'))return new Response(null,{status:415});
  if(Number(request.headers.get('content-length'))>18000)return new Response(null,{status:413});
  try{
    const raw=await request.text();if(raw.length>18000)return new Response(null,{status:413});
    const input=JSON.parse(raw);
    const {secret}=backendConfig(),ip=request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()??'';
    const rate=(purpose:string)=>createHmac('sha256',secret).update('analytics-'+purpose+':'+Math.floor(Date.now()/86400000)+':'+(ip||'unknown')).digest('hex');
    if(input.forget){if(typeof input.visitor!=='string'||!/^[a-f0-9-]{36}$/i.test(input.visitor))return new Response(null,{status:400});await adminCall({action:'analytics.forget',visitor:input.visitor,rate:rate('erase')});return new Response(null,{status:204});}
    if(input.consent!=='optional-analytics-v1')return new Response(null,{status:400});
    if(request.headers.get('sec-gpc')==='1'||request.headers.get('dnt')==='1'||(await cookies()).has(OWNER_COOKIE)||/bot|crawler|spider|headless|preview|lighthouse/i.test(request.headers.get('user-agent')??''))return new Response(null,{status:204});
    const payload=analyticsPayload(input);
    const ua=request.headers.get('user-agent')??'';
    const browser=/Edg\//.test(ua)?'Edge':/Firefox\//.test(ua)?'Firefox':/Chrome\//.test(ua)?'Chrome':/Safari\//.test(ua)?'Safari':'Other';
    const device=/iPad|Tablet/i.test(ua)?'Tablet':/Mobi|Android/i.test(ua)?'Mobile':'Desktop';
    let city='';try{city=decodeURIComponent(request.headers.get('x-vercel-ip-city')??'').slice(0,80);}catch{}
    const country=request.headers.get('x-vercel-ip-country')??'';
    const network={rate:rate('collect'),mask:networkMask(ip),city,country:/^[A-Z]{2}$/.test(country)?country:'',device,browser};
    const result=await adminCall<{limited?:boolean}>({action:'analytics.ingest',payload,network});
    return new Response(null,{status:result.limited?429:204,headers:{'Cache-Control':'no-store'}});
  }catch{return new Response(null,{status:400,headers:{'Cache-Control':'no-store'}});}
}
