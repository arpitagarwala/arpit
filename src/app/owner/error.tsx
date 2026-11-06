'use client';
import Link from 'next/link';
import s from '@/components/admin/admin.module.css';
export default function AdminError({reset}:{reset:()=>void}){return <main className={s.page}><section className={`${s.card} ${s.article}`}><p className={s.eyebrow}>OWNER WORKSPACE</p><h1 className={s.heading}>The workspace is unavailable.</h1><p className={s.lead}>Your published content and saved drafts remain in storage. Try again, or return to sign in.</p><div className={s.actions}><button className={s.primary} onClick={reset}>Try again</button><Link href="/login" className={s.button}>Sign in</Link></div></section></main>;}
