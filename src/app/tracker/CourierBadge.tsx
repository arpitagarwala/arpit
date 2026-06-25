'use client';

import styles from './tracker.module.css';
import { CourierInfo } from '@/lib/courierDetection';

interface Props {
  courier: CourierInfo;
}

export default function CourierBadge({ courier }: Props) {
  return (
    <div
      className={styles.courierBadge}
      style={{
        background: `${courier.color}18`,
        border: `1px solid ${courier.color}40`,
      }}
    >
      <span className={styles.courierEmoji}>{courier.emoji}</span>
      <div>
        <span className={styles.courierBadgeName}>{courier.name}</span>
        <span className={styles.courierBadgeSub}>Auto-detected</span>
      </div>
      <span className={styles.courierCheck} style={{ color: courier.color }}>
        <i className="ri-checkbox-circle-fill" />
      </span>
    </div>
  );
}
