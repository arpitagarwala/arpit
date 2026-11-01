import {pageMetadata} from '@/lib/page-metadata';
/* eslint-disable @next/next/no-img-element -- Uploaded cover served by permission-aware media route. */
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {currentOwner,publicEntry} from '@/lib/admin-server';
import {KIND_LABELS,validContentId} from '@/lib/publishing';
import type {Metadata} from 'next';
import s from '@/components/admin/admin.module.css';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{id:string}>}):Promise<Metadata>{const {id}=await params;if(!validContentId(id))return{title:'Update not found',robots:{index:false}};const e=await publicEntry(id).catch(()=>null);return e?pageMetadata(`/updates/${id}`,{title:e.title,description:e.summary}):{title:'Update not found',robots:{index:false}};}
export default async function Note({params}:{params:Promise<{id:string}>}){const {id}=await params;if(!validContentId(id))notFound();const e=await publicEntry(id);if(!e)notFound();const owner=await currentOwner().catch(()=>null);return <main className={s.page}><div className={s.shell}><header className={s.header}><Link className={s.brand} href="/"><span className={s.mark}>AA</span><span>Arpit Agarwala<small>Notes from my desk</small></span></Link>{owner&&<Link className={s.back} href="/admin">Manage content ↗</Link>}</header><article className={s.article}><Link className={s.back} href="/updates">← All updates</Link><p className={s.eyebrow} style={{marginTop:28}}>{KIND_LABELS[e.kind]}</p><h1 className={s.heading}>{e.title}</h1><p className={s.lead}>{e.summary}</p><p className={s.fine}>Arpit Agarwala · {e.publishedAt?new Intl.DateTimeFormat('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'long'}).format(new Date(e.publishedAt)):''}</p>{e.coverId&&<img className={s.articleCover} src={`/api/content-media/${e.coverId}`} alt=""/>}<div className={s.divider}/><div className={s.body}>{e.body}</div><div className={s.tags} style={{marginTop:32}}>{e.tags.map(t=><span key={t}>{t}</span>)}</div></article></div></main>;}
