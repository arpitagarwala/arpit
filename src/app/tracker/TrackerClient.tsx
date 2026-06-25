'use client';

import { useState, useCallback } from 'react';
import styles from './tracker.module.css';
import { detectCourier, CourierInfo, COURIERS } from '@/lib/courierDetection';
import type { TrackingResult } from '@/app/api/track/route';
import SearchBar from './SearchBar';
import CourierBadge from './CourierBadge';
import TrackingTimeline from './TrackingTimeline';
import StatusCard from './StatusCard';

// ─── Realistic demo data ───────────────────────────────────────────
const DEMO_RESULT: TrackingResult = {
  trackingNumber: 'DTDC8849201347',
  courier: 'dtdc',
  status: 'in_transit',
  statusLabel: 'In Transit',
  estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
  origin: 'Mumbai',
  destination: 'Kolkata',
  events: [
    {
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      location: 'Howrah Hub, West Bengal',
      description: 'Shipment arrived at destination hub',
      status: 'in_transit',
    },
    {
      timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
      location: 'Bhubaneswar Transit Centre, Odisha',
      description: 'In transit – departed from transit facility',
      status: 'in_transit',
    },
    {
      timestamp: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
      location: 'Visakhapatnam Hub, Andhra Pradesh',
      description: 'Shipment processed at hub',
      status: 'in_transit',
    },
    {
      timestamp: new Date(Date.now() - 42 * 60 * 60 * 1000).toISOString(),
      location: 'Chennai Gateway, Tamil Nadu',
      description: 'Departed from regional gateway',
      status: 'in_transit',
    },
    {
      timestamp: new Date(Date.now() - 52 * 60 * 60 * 1000).toISOString(),
      location: 'Mumbai Sorting Facility, Maharashtra',
      description: 'Shipment sorted and dispatched',
      status: 'in_transit',
    },
    {
      timestamp: new Date(Date.now() - 56 * 60 * 60 * 1000).toISOString(),
      location: 'Andheri West, Mumbai',
      description: 'Picked up from sender',
      status: 'pending',
    },
    {
      timestamp: new Date(Date.now() - 58 * 60 * 60 * 1000).toISOString(),
      location: 'Andheri West, Mumbai',
      description: 'Shipment information received – label created',
      status: 'pending',
    },
  ],
};

const DEMO_COURIER = COURIERS['dtdc'];
const DEMO_TRACKING_ID = 'DTDC8849201347';
// ──────────────────────────────────────────────────────────────────

export default function TrackerClient() {
  const [query, setQuery] = useState('');
  const [detected, setDetected] = useState<CourierInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  const handleInputChange = useCallback((value: string) => {
    setQuery(value);
    setDetected(detectCourier(value));
    setIsDemo(false);
    if (!value) {
      setResult(null);
      setError(null);
      setSearched(false);
    }
  }, []);

  const handleSearch = useCallback(async () => {
    const cleaned = query.trim();
    if (!cleaned || cleaned.length < 5) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setSearched(true);
    setIsDemo(false);

    try {
      const params = new URLSearchParams({ id: cleaned });
      if (detected) params.set('courier', detected.tcSlug ?? detected.id);

      const res = await fetch(`/api/track?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'An unknown error occurred.');
      } else {
        setResult(data);
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [query, detected]);

  const handleDemo = useCallback(() => {
    setQuery(DEMO_TRACKING_ID);
    setDetected(DEMO_COURIER);
    setResult(DEMO_RESULT);
    setError(null);
    setSearched(true);
    setIsDemo(true);
    setLoading(false);
  }, []);

  const handleReset = useCallback(() => {
    setQuery('');
    setDetected(null);
    setResult(null);
    setError(null);
    setSearched(false);
    setIsDemo(false);
  }, []);

  return (
    <main className={styles.main}>
      <div className={`${styles.blob} ${styles.blob1}`} />
      <div className={`${styles.blob} ${styles.blob2}`} />
      <div className={`${styles.blob} ${styles.blob3}`} />

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          Universal Parcel Tracker
        </div>

        <h1 className={styles.title}>
          Track Any Shipment,{' '}
          <span className={styles.gradientText}>Anywhere</span>
        </h1>

        <p className={styles.subtitle}>
          Enter your tracking number below. We automatically detect your courier
          — from DTDC to FedEx, DHL to Delhivery — and fetch real-time updates.
        </p>

        <SearchBar
          value={query}
          detected={detected}
          loading={loading}
          onChange={handleInputChange}
          onSearch={handleSearch}
        />

        {/* Demo / Reset row */}
        <div className={styles.demoRow}>
          {!isDemo ? (
            <button
              id="demo-button"
              className={styles.demoBtn}
              onClick={handleDemo}
              aria-label="Try demo tracking"
            >
              <i className="ri-play-circle-line" />
              Try a live demo
            </button>
          ) : (
            <button
              id="reset-button"
              className={styles.resetBtn}
              onClick={handleReset}
              aria-label="Reset tracker"
            >
              <i className="ri-restart-line" />
              Reset
            </button>
          )}
        </div>

        {/* Auto-detected courier badge */}
        {detected && !loading && (
          <div className={styles.detectedWrap}>
            <CourierBadge courier={detected} />
          </div>
        )}
      </section>

      {/* Results */}
      {(loading || result || error) && (
        <section className={styles.results}>
          {/* Demo banner */}
          {isDemo && (
            <div className={styles.demoBanner}>
              <i className="ri-sparkle-line" />
              <span>
                <strong>Demo preview</strong> — this is a simulated DTDC shipment.
                Enter your own tracking number above to track a real parcel.
              </span>
            </div>
          )}

          {loading && <LoadingSkeleton />}

          {!loading && error && (
            <div className={styles.errorCard}>
              <span className={styles.errorIcon}>⚠️</span>
              <div>
                <p className={styles.errorTitle}>Could not fetch tracking data</p>
                <p className={styles.errorMsg}>{error}</p>
                {error.includes('API key') && (
                  <a
                    href="https://trackcourier.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.errorLink}
                  >
                    Get a free TrackCourier.io key →
                  </a>
                )}
              </div>
            </div>
          )}

          {!loading && result && (
            <>
              <StatusCard result={result} courier={detected} />
              <TrackingTimeline events={result.events} />
            </>
          )}
        </section>
      )}

      {/* Supported couriers strip */}
      {!searched && (
        <section className={styles.supportedSection}>
          <p className={styles.supportedLabel}>Supports 19+ major carriers</p>
          <div className={styles.courierStrip}>
            {COURIER_NAMES.map((name) => (
              <span key={name} className={styles.courierPill}>{name}</span>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function LoadingSkeleton() {
  return (
    <div className={styles.skeleton}>
      <div className={styles.skeletonCard}>
        <div className={`${styles.skeletonLine} ${styles.skeletonLineShort}`} />
        <div className={`${styles.skeletonLine} ${styles.skeletonLineLong}`} />
        <div className={styles.skeletonRow}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.skeletonStat} />
          ))}
        </div>
      </div>
      <div className={styles.skeletonTimeline}>
        {[1, 2, 3].map((i) => (
          <div key={i} className={styles.skeletonEvent}>
            <div className={styles.skeletonDot} />
            <div className={styles.skeletonContent}>
              <div className={`${styles.skeletonLine} ${styles.skeletonLineShort}`} />
              <div className={`${styles.skeletonLine} ${styles.skeletonLineMed}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const COURIER_NAMES = [
  'FedEx', 'DHL', 'UPS', 'DTDC', 'Blue Dart', 'Delhivery',
  'Aramex', 'Ekart', 'Ecom Express', 'XpressBees', 'Shadowfax',
  'India Post', 'Amazon Logistics', 'Shiprocket', 'USPS',
  'Tirupati', 'Professional Courier', 'Gati', 'Trackon',
];
