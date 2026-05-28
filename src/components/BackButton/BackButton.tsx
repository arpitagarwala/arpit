'use client';

import { useRouter } from 'next/navigation';
import styles from './BackButton.module.css';

export default function BackButton() {
  const router = useRouter();

  return (
    <div className={styles.wrap}>
      <button 
        onClick={() => router.back()} 
        className={styles.btn} 
        aria-label="Go back"
      >
        <i className="ri-arrow-left-line" />
      </button>
    </div>
  );
}
