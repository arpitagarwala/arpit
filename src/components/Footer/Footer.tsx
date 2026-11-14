'use client';
import {useSiteFooter} from '@/components/SiteFeatures';
import styles from './Footer.module.css';
export default function Footer(){const footer=useSiteFooter();return footer.enabled?<footer className={styles.footer}>{footer.text}</footer>:null;}
