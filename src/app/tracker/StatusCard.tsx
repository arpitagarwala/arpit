'use client';

import styles from './tracker.module.css';
import type { TrackingResult } from '@/app/api/track/route';
import { CourierInfo } from '@/lib/courierDetection';

interface Props {
  result: TrackingResult;
  courier: CourierInfo | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  delivered:        { label: 'Delivered',          color: '#22d3ee', bg: 'rgba(34,211,238,0.1)',  icon: 'ri-checkbox-circle-fill' },
  out_for_delivery: { label: 'Out for Delivery',   color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: 'ri-bike-fill' },
  in_transit:       { label: 'In Transit',          color: '#818cf8', bg: 'rgba(129,140,248,0.1)', icon: 'ri-truck-fill' },
  exception:        { label: 'Exception / Delay',  color: '#f87171', bg: 'rgba(248,113,113,0.1)', icon: 'ri-error-warning-fill' },
  pending:          { label: 'Pending / Pickup',   color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', icon: 'ri-time-fill' },
};

function getStatusConfig(status: string) {
  const key = status?.toLowerCase().replace(/\s+/g, '_');
  return STATUS_CONFIG[key] ?? STATUS_CONFIG.pending;
}

function formatDate(raw?: string) {
  if (!raw) return null;
  try {
    return new Date(raw).toLocaleDateString('en-IN', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch {
    return raw;
  }
}

export default function StatusCard({ result, courier }: Props) {
  const statusCfg = getStatusConfig(result.status);
  const lastEvent = result.events?.[0];

  return (
    <div className={styles.statusCard}>
      {/* Top row: courier name + status pill */}
      <div className={styles.statusTop}>
        <div className={styles.statusCourierName}>
          {courier ? (
            <span className={styles.statusCourierEmoji}>{courier.emoji}</span>
          ) : null}
          <span>{result.courier || courier?.name || 'Unknown Courier'}</span>
        </div>

        <span
          className={styles.statusPill}
          style={{ background: statusCfg.bg, color: statusCfg.color }}
        >
          <i className={statusCfg.icon} />
          {statusCfg.label}
        </span>
      </div>

      {/* Tracking number */}
      <p className={styles.statusTrackingNo}>
        <i className="ri-barcode-line" />
        {result.trackingNumber}
      </p>

      {/* Stats row */}
      <div className={styles.statusStats}>
        {result.estimatedDelivery && (
          <div className={styles.statusStat}>
            <span className={styles.statLabel}>Est. Delivery</span>
            <span className={styles.statValue}>{formatDate(result.estimatedDelivery)}</span>
          </div>
        )}
        {result.origin && (
          <div className={styles.statusStat}>
            <span className={styles.statLabel}>Origin</span>
            <span className={styles.statValue}>{result.origin}</span>
          </div>
        )}
        {result.destination && (
          <div className={styles.statusStat}>
            <span className={styles.statLabel}>Destination</span>
            <span className={styles.statValue}>{result.destination}</span>
          </div>
        )}
        {lastEvent && (
          <div className={styles.statusStat}>
            <span className={styles.statLabel}>Last Update</span>
            <span className={styles.statValue}>{formatDate(lastEvent.timestamp)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
