import {randomBytes,scrypt as derive,timingSafeEqual,createHash} from 'node:crypto';
const scrypt=(password:string,salt:string)=>new Promise<Buffer>((resolve,reject)=>derive(password,salt,64,{N:131072,r:8,p:1,maxmem:256*1024*1024},(error,key)=>error?reject(error):resolve(key)));
export const sessionDigest=(token:string)=>createHash('sha256').update(token).digest('hex');
export const sessionToken=()=>randomBytes(32).toString('hex');
export function safeEqual(a:string,b:string){const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y);}
export function passwordError(password:unknown){return typeof password!=='string'||password.length<14||password.length>128?'Use a password or passphrase between 14 and 128 characters.':null;}
export async function hashPassword(password:string){const error=passwordError(password);if(error)throw new Error(error);const salt=randomBytes(16).toString('hex'),hash=await scrypt(password,salt);return `scrypt$131072$8$1$${salt}$${hash.toString('hex')}`;}
export async function verifyPassword(password:string,encoded:string){if(passwordError(password))return false;const [algorithm,n,r,p,salt,hash]=encoded.split('$');if(algorithm!=='scrypt'||n!=='131072'||r!=='8'||p!=='1'||!/^[a-f0-9]{32}$/.test(salt)||!/^[a-f0-9]{128}$/.test(hash))return false;const candidate=await scrypt(password,salt);return timingSafeEqual(candidate,Buffer.from(hash,'hex'));}
