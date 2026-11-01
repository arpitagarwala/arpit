'use client';

import { useRouter } from 'next/navigation';
import { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import styles from './BackButton.module.css';
import {useSuiteNavigation} from '@/components/productivity/SuiteNavigation';

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

export default function BackButton() {
  const router = useRouter();
  const suite = useSuiteNavigation();
  const mounted = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);

  if (!mounted) return null;

  // Keep viewport positioning independent of page transforms and content containers.
  return createPortal(
    <div className={styles.wrap}>
      <button
        type="button"
        onClick={() => {
          if (suite?.backToOverview()) return;
          if (window.history.length > 1) router.back();
          else router.replace('/');
        }}
        className={styles.btn} 
        aria-label="Go back"
        title="Go back"
      >
        <i className="ri-arrow-left-line" aria-hidden="true" />
      </button>
    </div>,
    document.body
  );
}
