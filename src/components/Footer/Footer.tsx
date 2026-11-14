'use client';
import Link from 'next/link';
import {useSiteFooter} from '@/components/SiteFeatures';
import styles from './Footer.module.css';
export default function Footer(){const footer=useSiteFooter();return footer.enabled?<footer className={styles.footer}>{footer.text}<div className={styles.links}><Link href="/privacy">Privacy</Link></div></footer>:null;}
