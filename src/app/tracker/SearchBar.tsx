'use client';

import { useRef, useEffect, KeyboardEvent } from 'react';
import styles from './tracker.module.css';
import { CourierInfo } from '@/lib/courierDetection';

interface Props {
  value: string;
  detected: CourierInfo | null;
  loading: boolean;
  onChange: (val: string) => void;
  onSearch: () => void;
}

export default function SearchBar({ value, detected, loading, onChange, onSearch }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') onSearch();
  };

  return (
    <div className={styles.searchWrapper}>
      <div
        className={`${styles.searchBox} ${detected ? styles.searchBoxDetected : ''}`}
        style={detected ? { borderColor: detected.color + '60' } : undefined}
      >
        <span className={styles.searchIcon}>
          {detected ? detected.emoji : '🔍'}
        </span>

        <input
          ref={inputRef}
          id="tracking-number-input"
          type="text"
          className={styles.searchInput}
          placeholder="Enter tracking number (e.g. 1Z999AA10123456784)"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKey}
          autoComplete="off"
          spellCheck={false}
          aria-label="Tracking number"
        />

        {value && (
          <button
            className={styles.clearBtn}
            onClick={() => onChange('')}
            aria-label="Clear input"
            title="Clear"
          >
            <i className="ri-close-line" />
          </button>
        )}

        <button
          id="track-button"
          className={styles.trackBtn}
          onClick={onSearch}
          disabled={loading || value.trim().length < 5}
          aria-label="Track shipment"
          style={detected ? { background: detected.color } : undefined}
        >
          {loading ? (
            <span className={styles.spinner} />
          ) : (
            <>
              <span className={styles.trackBtnText}>Track</span>
              <i className="ri-arrow-right-line" />
            </>
          )}
        </button>
      </div>

      <p className={styles.searchHint}>
        {detected
          ? `✓ Detected: ${detected.name}`
          : value.length > 0 && value.length < 5
          ? 'Keep typing — we\'ll auto-detect your courier'
          : 'We support FedEx, DHL, UPS, DTDC, Delhivery, Blue Dart, Aramex & more'}
      </p>
    </div>
  );
}
