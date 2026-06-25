'use client';

import { useEffect, useState } from 'react';
import styles from './SunArc.module.css';

interface SunArcProps {
  sunrise: string;
  sunset: string;
  isToday?: boolean;
}

export default function SunArc({ sunrise, sunset, isToday = false }: SunArcProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    if (!isToday) return;
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, [isToday]);

  const sr = new Date(sunrise);
  const ss = new Date(sunset);
  const srMs = sr.getTime();
  const ssMs = ss.getTime();
  const dayLen = ssMs - srMs;
  const currentMs = isToday ? now.getTime() : (srMs + ssMs) / 2;
  const rawT = (currentMs - srMs) / dayLen;
  const t = Math.max(0, Math.min(1, rawT));
  const phase: 'pre' | 'day' | 'post' = rawT < 0 ? 'pre' : rawT > 1 ? 'post' : 'day';

  // SVG layout
  const W = 500, H = 158;
  const lx = 58, rx = 442, bY = 118, pY = 20;
  const midX = (lx + rx) / 2;

  const qx = (s: number) => (1 - s) ** 2 * lx + 2 * (1 - s) * s * midX + s ** 2 * rx;
  const qy = (s: number) => (1 - s) ** 2 * bY + 2 * (1 - s) * s * pY + s ** 2 * bY;

  // Elapsed polyline (N segments 0 → t)
  const N = 60;
  const elapsedPts = Array.from({ length: N + 1 }, (_, i) => {
    const s = (i / N) * t;
    return `${qx(s).toFixed(1)},${qy(s).toFixed(1)}`;
  }).join(' ');

  // Full-arc polyline (for post-sunset highlight)
  const fullPts = Array.from({ length: N + 1 }, (_, i) => {
    const s = i / N;
    return `${qx(s).toFixed(1)},${qy(s).toFixed(1)}`;
  }).join(' ');

  const fmtTime = (d: Date) =>
    d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  const solarNoon = new Date((srMs + ssMs) / 2);
  const dayH = Math.floor(dayLen / 3_600_000);
  const dayM = Math.floor((dayLen % 3_600_000) / 60_000);
  const pct = Math.round(Math.max(0, Math.min(100, rawT * 100)));
  const minsTillSr = Math.max(0, Math.floor((srMs - currentMs) / 60_000));
  const minsAfterSs = Math.max(0, Math.floor((currentMs - ssMs) / 60_000));

  const fillPath = `M ${lx} ${bY} Q ${midX} ${pY} ${rx} ${bY} L ${rx} ${bY + 1} L ${lx} ${bY + 1} Z`;

  return (
    <div className={styles.wrap}>
      <div className={styles.topRow}>
        <span className={styles.title}>
          <i className="ri-sun-line" /> सूर्य मार्ग &middot; Surya Path
        </span>
        <span className={styles.dayLen}>
          <i className="ri-time-line" /> {dayH}h {dayM}m daylight
        </span>
      </div>

      <div className={styles.svgWrap}>
        <svg viewBox={`0 0 ${W} ${H}`} className={styles.svg} preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="sunHalo" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="rgba(253,230,138,0.55)" />
              <stop offset="45%"  stopColor="rgba(251,191,36,0.18)" />
              <stop offset="100%" stopColor="rgba(251,191,36,0)" />
            </radialGradient>
            <linearGradient id="arcFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="rgba(251,191,36,0.08)" />
              <stop offset="100%" stopColor="rgba(249,115,22,0.01)" />
            </linearGradient>
            <linearGradient id="horizGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="rgba(249,115,22,0)" />
              <stop offset="18%"  stopColor="rgba(249,115,22,0.55)" />
              <stop offset="82%"  stopColor="rgba(249,115,22,0.55)" />
              <stop offset="100%" stopColor="rgba(249,115,22,0)" />
            </linearGradient>
            <filter id="sunGlow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="6" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Sky fill under arc */}
          <path d={fillPath} fill="url(#arcFill)" />
          {/* Ground */}
          <rect x={0} y={bY} width={W} height={H - bY} fill="rgba(249,115,22,0.022)" />
          {/* Horizon line */}
          <line x1={8} y1={bY} x2={W - 8} y2={bY} stroke="url(#horizGrad)" strokeWidth="1.5" />

          {/* Full arc – dim dashed */}
          <polyline points={fullPts} fill="none" stroke="rgba(251,191,36,0.17)" strokeWidth="2" strokeDasharray="5 5" />

          {/* Elapsed arc – bright */}
          {phase === 'day' && t > 0.01 && (
            <polyline points={elapsedPts} fill="none" stroke="rgba(251,191,36,0.65)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          )}
          {phase === 'post' && (
            <polyline points={fullPts} fill="none" stroke="rgba(251,191,36,0.52)" strokeWidth="2.8" />
          )}

          {/* Solar noon dotted vertical */}
          <line x1={midX} y1={pY - 8} x2={midX} y2={bY} stroke="rgba(251,191,36,0.1)" strokeWidth="1" strokeDasharray="3 5" />
          <text x={midX} y={pY - 13} textAnchor="middle" fill="rgba(251,191,36,0.42)" fontSize="8" fontFamily="system-ui,sans-serif">
            ⊙ {fmtTime(solarNoon)}
          </text>

          {/* Sunrise dot */}
          <circle cx={lx} cy={bY} r="6.5" fill="none" stroke="rgba(249,115,22,0.65)" strokeWidth="1.5" />
          <circle cx={lx} cy={bY} r="3" fill="#f97316" />
          {/* Sunset dot */}
          <circle cx={rx} cy={bY} r="6.5" fill="none" stroke="rgba(249,115,22,0.65)" strokeWidth="1.5" />
          <circle cx={rx} cy={bY} r="3" fill="#f97316" />

          {/* ☀ Sun (daytime) */}
          {phase === 'day' && (
            <>
              <circle cx={qx(t)} cy={qy(t)} r="34" fill="url(#sunHalo)" />
              <circle cx={qx(t)} cy={qy(t)} r="14" fill="rgba(253,230,138,0.22)" />
              <circle cx={qx(t)} cy={qy(t)} r="9" fill="#fde68a" filter="url(#sunGlow)" />
              <circle cx={qx(t)} cy={qy(t)} r="6" fill="#fbbf24" />
            </>
          )}

          {/* Night labels */}
          {phase !== 'day' && (
            <text x={midX} y={bY - 20} textAnchor="middle" fill="#475569" fontSize="11" fontFamily="system-ui,sans-serif">
              {phase === 'pre'
                ? `Sunrise in ${minsTillSr < 60 ? `${minsTillSr}m` : `${Math.floor(minsTillSr / 60)}h ${minsTillSr % 60}m`}`
                : `Sun set ${minsAfterSs < 60 ? `${minsAfterSs}m ago` : `${Math.floor(minsAfterSs / 60)}h ago`}`}
            </text>
          )}

          {/* Sunrise label */}
          <text x={lx}  y={bY + 14} textAnchor="middle" fill="#fb923c" fontSize="9"   fontFamily="system-ui,sans-serif" fontWeight="700">{fmtTime(sr)}</text>
          <text x={lx}  y={bY + 25} textAnchor="middle" fill="#64748b" fontSize="7.5" fontFamily="system-ui,sans-serif">Sunrise</text>
          {/* Sunset label */}
          <text x={rx} y={bY + 14} textAnchor="middle" fill="#fb923c" fontSize="9"   fontFamily="system-ui,sans-serif" fontWeight="700">{fmtTime(ss)}</text>
          <text x={rx} y={bY + 25} textAnchor="middle" fill="#64748b" fontSize="7.5" fontFamily="system-ui,sans-serif">Sunset</text>
        </svg>
      </div>

      {/* Day progress bar — only for today's live view */}
      {isToday && phase === 'day' && (
        <div className={styles.progRow}>
          <div className={styles.progTrack}>
            <div className={styles.progFill} style={{ width: `${pct}%` }} />
            <div className={styles.progThumb} style={{ left: `calc(${pct}% - 8px)` }}>
              <i className="ri-sun-fill" style={{ color: '#fbbf24', fontSize: '0.85rem' }} />
            </div>
          </div>
          <span className={styles.pct}>{pct}%</span>
        </div>
      )}
    </div>
  );
}
