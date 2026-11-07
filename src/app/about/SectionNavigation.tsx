import styles from './page.module.css';

export default function SectionNavigation({sections}:{sections:{id:string;title:string;icon:string}[]}) {
 return <nav className={styles.sectionNav} aria-label="About sections">{sections.map(section=><a key={section.id} href={'#about-'+section.id}><i className={section.icon} aria-hidden="true"/>{section.title}</a>)}</nav>;
}
