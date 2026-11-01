'use client';

import type {MouseEvent} from 'react';
import styles from './page.module.css';

export default function SectionNavigation({sections}:{sections:{id:string;title:string;icon:string}[]}) {
 function scrollToSection(event:MouseEvent<HTMLAnchorElement>,id:string) {
  if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const section=document.getElementById('about-'+id);
  if(!section)return;
  event.preventDefault();
  // These are shortcuts within one page, not navigation steps in browser history.
  section.focus({preventScroll:true});
  section.scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 }
 return <nav className={styles.sectionNav} aria-label="About sections">{sections.map(section=><a key={section.id} href={'#about-'+section.id} onClick={event=>scrollToSection(event,section.id)}><i className={section.icon} aria-hidden="true"/>{section.title}</a>)}</nav>;
}
