import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      &copy; 2026 Arpit Agarwala. Engineered with{' '}
      <span className={styles.heart}>&#10084;&#65039;</span>
    </footer>
  );
}
