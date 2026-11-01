import 'server-only';
import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {createHmac,randomUUID} from 'node:crypto';
import {sessionDigest} from './admin-crypto';
import type {ContentEntry} from './publishing';
export const OWNER_COOKIE='arpit_owner_session';
export class AdminError extends Error{constructor(message:string,public status=400){super(message);}}
export function backendConfig(){const url=process.env.ADMIN_BACKEND_URL,secret=process.env.ADMIN_SERVICE_SECRET;if(!url||!secret||secret.length<32)throw new AdminError('Owner publishing is not configured on this server yet.',503);const parsed=new URL(url);if(parsed.protocol!=='https:'&&!(parsed.protocol==='http:'&&['localhost','127.0.0.1'].includes(parsed.hostname)))throw new AdminError('Invalid publishing backend configuration.',503);return{url:parsed.origin,secret};}
export async function adminCall<T>(payload:Record<string,unknown>):Promise<T>{const {url,secret}=backendConfig(),body=JSON.stringify(payload),time=String(Date.now()),nonce=randomUUID(),hash=sessionDigest(body),signature=createHmac('sha256',secret).update(`${time}\n${nonce}\n/internal\n${hash}`).digest('hex');const response=await fetch(`${url}/internal`,{method:'POST',headers:{'Content-Type':'application/json','x-admin-time':time,'x-admin-nonce':nonce,'x-admin-signature':signature},body,cache:'no-store',signal:AbortSignal.timeout(20000)});const result=await response.json();if(!response.ok)throw new AdminError(result.error??'Publishing service unavailable.',response.status);return result as T;}
export async function currentOwner(){const token=(await cookies()).get(OWNER_COOKIE)?.value;if(!token||!/^[a-f0-9]{64}$/.test(token))return null;try{const result=await adminCall<{owner:{email:string}}>({action:'auth.session',session:sessionDigest(token)});return result.owner;}catch(e){if(e instanceof AdminError&&e.status===401)return null;throw e;}}
export async function requireOwner(){const owner=await currentOwner();if(!owner)redirect('/login');return owner;}
export async function ownerSession(){const token=(await cookies()).get(OWNER_COOKIE)?.value;if(!token||!/^[a-f0-9]{64}$/.test(token))throw new AdminError('Sign in to continue.',401);const session=sessionDigest(token);await adminCall({action:'auth.session',session});return session;}
export async function publicEntries(){const {url}=backendConfig();const r=await fetch(`${url}/public/entries`,{cache:'no-store',signal:AbortSignal.timeout(15000)});if(!r.ok)throw new AdminError('Published updates are temporarily unavailable.',503);return(await r.json()).entries as ContentEntry[];}
export async function publicEntry(id:string){const {url}=backendConfig();const r=await fetch(`${url}/public/entries/${encodeURIComponent(id)}`,{cache:'no-store',signal:AbortSignal.timeout(15000)});if(r.status===404)return null;if(!r.ok)throw new AdminError('This update is temporarily unavailable.',503);return(await r.json()).entry as ContentEntry;}
