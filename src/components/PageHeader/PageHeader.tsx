import styles from './PageHeader.module.css';

interface PageHeaderProps {
  title: string;
  subtitle: string;
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className={`${styles.wrap} fade-up`}>
      <div className={styles.inner}>
        <div>
          <h1 className={styles.title}>{title}</h1>
          <div className={`${styles.underline} shimmer-underline`} />
        </div>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>
    </div>
  );
}
