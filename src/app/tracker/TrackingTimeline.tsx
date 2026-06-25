'use client';

import styles from './tracker.module.css';
import type { TrackingEvent } from '@/app/api/track/route';

interface Props {
  events: TrackingEvent[];
}

const EVENT_STYLE: Record<
  TrackingEvent['status'],
  { dot: string; line: string; icon: string }
> = {
  delivered:        { dot: '#22d3ee', line: '#22d3ee40', icon: 'ri-checkbox-circle-fill' },
  out_for_delivery: { dot: '#f59e0b', line: '#f59e0b40', icon: 'ri-bike-fill' },
  in_transit:       { dot: '#818cf8', line: '#818cf840', icon: 'ri-truck-fill' },
  exception:        { dot: '#f87171', line: '#f8717140', icon: 'ri-error-warning-fill' },
  pending:          { dot: '#475569', line: '#47556940', icon: 'ri-time-line' },
};

function formatTimestamp(raw: string) {
  if (!raw) return { date: '', time: '' };
  try {
    const d = new Date(raw);
    return {
      date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };
  } catch {
    return { date: raw, time: '' };
  }
}

export default function TrackingTimeline({ events }: Props) {
  if (!events || events.length === 0) {
    return (
      <div className={styles.emptyTimeline}>
        <i className="ri-route-line" style={{ fontSize: '2rem', opacity: 0.3 }} />
        <p>No tracking events available yet.</p>
      </div>
    );
  }

  return (
    <div className={styles.timeline}>
      <h2 className={styles.timelineTitle}>
        <i className="ri-route-line" /> Shipment Journey
      </h2>

      <div className={styles.timelineList}>
        {events.map((event, idx) => {
          const style = EVENT_STYLE[event.status] ?? EVENT_STYLE.pending;
          const { date, time } = formatTimestamp(event.timestamp);
          const isFirst = idx === 0;

          return (
            <div
              key={idx}
              className={`${styles.timelineItem} ${isFirst ? styles.timelineItemFirst : ''}`}
              style={{ '--delay': `${idx * 80}ms` } as React.CSSProperties}
            >
              {/* Line connector */}
              {idx < events.length - 1 && (
                <div
                  className={styles.timelineLine}
                  style={{ background: style.line }}
                />
              )}

              {/* Dot */}
              <div
                className={`${styles.timelineDot} ${isFirst ? styles.timelineDotActive : ''}`}
                style={{
                  background: isFirst ? style.dot : 'transparent',
                  borderColor: style.dot,
                  boxShadow: isFirst ? `0 0 12px ${style.dot}80` : 'none',
                }}
              >
                {isFirst && (
                  <i
                    className={style.icon}
                    style={{ color: '#000', fontSize: '0.6rem' }}
                  />
                )}
              </div>

              {/* Content */}
              <div className={styles.timelineContent}>
                <div className={styles.timelineHeader}>
                  <span
                    className={styles.timelineDesc}
                    style={{ color: isFirst ? style.dot : undefined }}
                  >
                    {event.description || 'Status update'}
                  </span>
                  <div className={styles.timelineMeta}>
                    {date && <span className={styles.timelineDate}>{date}</span>}
                    {time && <span className={styles.timelineTime}>{time}</span>}
                  </div>
                </div>

                {event.location && (
                  <p className={styles.timelineLoc}>
                    <i className="ri-map-pin-2-line" />
                    {event.location}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
