import 'server-only';
import {cache} from 'react';
import {backendConfig} from './admin-server';
import {normalizeSite,siteDefaults} from './site-config';
export const getSite=cache(async()=>{let url:string;try{url=backendConfig().url;}catch{return siteDefaults();}const r=await fetch(`${url}/public/site`,{next:{revalidate:30,tags:['site-settings']},signal:AbortSignal.timeout(10000)});if(!r.ok)throw new Error('Website settings are temporarily unavailable.');const value=await r.json();return normalizeSite(value.config);});
