'use client';

import { useState, useEffect } from 'react';
import type { PanchangResult } from '@/lib/panchang';
import styles from './MonthCalendar.module.css';

const WEEK_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface Props {
  lat: number;
  lon: number;
  onSelectDay?: (result: PanchangResult, date: Date) => void;
}

function dayVariant(p: PanchangResult): string {
  if (p.tithi.name === 'Purnima')   return styles.purnima;
  if (p.tithi.name === 'Amavasya')  return styles.amavasya;
  if (p.tithi.name === 'Ekadashi')  return styles.ekadashi;
  if (p.tithi.name === 'Ashtami')   return styles.ashtami;
  if (p.tithi.paksha === 'Shukla Paksha') return styles.shukla;
  return styles.krishna;
}

function getSpecialIcon(p: PanchangResult): React.ReactNode {
  if (p.tithi.name === 'Purnima')   return <i className="ri-moon-fill" style={{ color: '#fde68a', fontSize: '0.75rem' }} />;
  if (p.tithi.name === 'Amavasya')  return <i className="ri-moon-line" style={{ color: '#94a3b8', fontSize: '0.75rem' }} />;
  if (p.tithi.name === 'Ekadashi')  return <i className="ri-star-fill" style={{ color: '#34d399', fontSize: '0.75rem' }} />;
  if (p.tithi.name === 'Ashtami')   return <i className="ri-award-fill" style={{ color: '#f472b6', fontSize: '0.75rem' }} />;
  return null;
}

export default function MonthCalendar({ lat, lon, onSelectDay }: Props) {
  const today = new Date();
  const [year, setYear]     = useState(today.getFullYear());
  const [month, setMonth]   = useState(today.getMonth() + 1);
  const [days, setDays]     = useState<(PanchangResult | null)[]>([]);
  const [loading, setLoading] = useState(true);
  const [selDay, setSelDay] = useState<number | null>(null);
  const [detailDay, setDetailDay] = useState<{ day: number; data: PanchangResult } | null>(null);

  useEffect(() => {
    setLoading(true);
    setSelDay(null);
    setDetailDay(null);
    fetch(`/api/panchang-month?lat=${lat}&lon=${lon}&year=${year}&month=${month}`)
      .then(r => r.json())
      .then((d: (PanchangResult | null)[]) => { setDays(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [lat, lon, year, month]);

  const firstDow = new Date(year, month - 1, 1).getDay(); // 0=Sun
  const isToday = (d: number) =>
    year === today.getFullYear() && month === today.getMonth() + 1 && d === today.getDate();

  const prevMonth = () => month === 1 ? (setYear(y => y - 1), setMonth(12)) : setMonth(m => m - 1);
  const nextMonth = () => month === 12 ? (setYear(y => y + 1), setMonth(1)) : setMonth(m => m + 1);
  const jumpToday = () => { setYear(today.getFullYear()); setMonth(today.getMonth() + 1); };

  const handleClick = (i: number, p: PanchangResult) => {
    const dayNum = i + 1;
    setSelDay(dayNum);
    setDetailDay({ day: dayNum, data: p });
  };

  const openFull = () => {
    if (!detailDay) return;
    onSelectDay?.(detailDay.data, new Date(year, month - 1, detailDay.day));
  };

  return (
    <div className={styles.wrap}>
      {/* Month navigation */}
      <div className={styles.navBar}>
        <button onClick={prevMonth} className={styles.navArrow}><i className="ri-arrow-left-s-line" /></button>
        <div className={styles.monthDisplay}>
          <h3 className={styles.monthName}>{MONTH_NAMES[month - 1]}</h3>
          <span className={styles.yearBadge}>{year}</span>
        </div>
        <button onClick={nextMonth} className={styles.navArrow}><i className="ri-arrow-right-s-line" /></button>
        <button onClick={jumpToday} className={styles.todayJump}>Today</button>
      </div>

      {/* Weekday headers */}
      <div className={styles.weekRow}>
        {WEEK_LABELS.map((d, i) => (
          <div key={d} className={`${styles.weekHead} ${i === 0 ? styles.sunday : ''}`}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      {loading ? (
        <div className={styles.loadState}>
          <div className={styles.spinner} />
          <span>Computing panchang for {MONTH_NAMES[month - 1]}…</span>
        </div>
      ) : (
        <div className={styles.grid}>
          {/* Leading empty cells */}
          {Array.from({ length: firstDow }, (_, i) => (
            <div key={`empty-${i}`} className={styles.emptyCell} />
          ))}

          {/* Day cells */}
          {days.map((p, i) => {
            const dayNum = i + 1;
            if (!p) return <div key={dayNum} className={styles.emptyCell} />;
            const specialIcon = getSpecialIcon(p);
            const today = isToday(dayNum);
            const selected = selDay === dayNum;
            return (
              <button
                key={dayNum}
                onClick={() => handleClick(i, p)}
                className={[
                  styles.dayCell,
                  dayVariant(p),
                  today    ? styles.todayCell    : '',
                  selected ? styles.selectedCell : '',
                ].join(' ')}
                title={`${p.tithi.name} · ${p.nakshatra.name}`}
              >
                <span className={styles.dayNum}>{dayNum}</span>
                {specialIcon && <span className={styles.dayEmoji}>{specialIcon}</span>}
                <span className={styles.dayTithi}>
                  {p.tithi.name.length > 9 ? p.tithi.name.slice(0, 8) + '…' : p.tithi.name}
                </span>
                <span className={styles.dayNak}>
                  {p.nakshatra.name.length > 8 ? p.nakshatra.name.slice(0, 7) + '…' : p.nakshatra.name}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Detail panel: shown when a day is selected */}
      {detailDay && (
        <div className={styles.detailPanel}>
          <div className={styles.detailHeader}>
            <span className={styles.detailDate}>
              {new Date(year, month - 1, detailDay.day).toLocaleDateString('en-IN', {
                weekday: 'long', day: 'numeric', month: 'long',
              })}
            </span>
            <button onClick={() => setDetailDay(null)} className={styles.detailClose}>
              <i className="ri-close-line" />
            </button>
          </div>
          <div className={styles.detailGrid}>
            {[
              ['Tithi',     `${detailDay.data.tithi.name} (${detailDay.data.tithi.paksha.replace(' Paksha', '')})`],
              ['Nakshatra', detailDay.data.nakshatra.name],
              ['Yoga',      detailDay.data.yoga.name],
              ['Karana',    detailDay.data.karana.name],
              ['Vara',      detailDay.data.vara.english],
            ].map(([label, value]) => (
              <div key={label} className={styles.detailItem}>
                <span className={styles.detailLabel}>{label}</span>
                <span className={styles.detailValue}>{value}</span>
              </div>
            ))}
          </div>
          <button onClick={openFull} className={styles.detailFull}>
            View Full Panchang <i className="ri-arrow-right-line" />
          </button>
        </div>
      )}

      {/* Legend */}
      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: '#f59e0b' }} /> Shukla
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: '#818cf8' }} /> Krishna
        </span>
        <span className={styles.legendItem}>
          <i className="ri-moon-fill" style={{ color: '#fde68a', fontSize: '0.8rem' }} /> Purnima
        </span>
        <span className={styles.legendItem}>
          <i className="ri-moon-line" style={{ color: '#94a3b8', fontSize: '0.8rem' }} /> Amavasya
        </span>
        <span className={styles.legendItem}>
          <i className="ri-star-fill" style={{ color: '#34d399', fontSize: '0.8rem' }} /> Ekadashi
        </span>
        <span className={styles.legendItem}>
          <i className="ri-award-fill" style={{ color: '#f472b6', fontSize: '0.8rem' }} /> Ashtami
        </span>
      </div>
    </div>
  );
}
