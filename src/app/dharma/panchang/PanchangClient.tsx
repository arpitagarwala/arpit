'use client';

import { useEffect, useState, useRef } from 'react';
import type { PanchangResult } from '@/lib/panchang';
import SunArc from './SunArc';
import MonthCalendar from './MonthCalendar';
import styles from './page.module.css';

const DEFAULT_LAT = 22.5726; // Kolkata
const DEFAULT_LON = 88.3639;

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEK_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function fmtTime(iso: string | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function fmtDate(d: Date): string {
  const dayName = WEEK_DAYS[d.getDay()];
  const day = d.getDate();
  const monthName = MONTH_NAMES[d.getMonth()];
  const year = d.getFullYear();
  return `${dayName}, ${day} ${monthName} ${year}`;
}

function isActive(startIso: string, endIso: string): boolean {
  const now = Date.now();
  return now >= new Date(startIso).getTime() && now <= new Date(endIso).getTime();
}

function isSameDay(d1: Date, d2: Date) {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function AngaCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div className={styles.angaCard} style={{ borderColor: `${color}25`, background: `${color}07` }}>
      <span className={styles.angaLabel}>{label}</span>
      <span className={styles.angaValue} style={{ color }}>{value}</span>
      {sub && <span className={styles.angaSub}>{sub}</span>}
    </div>
  );
}

function TimeSlot({
  label, start, end, icon, danger, good,
}: {
  label: string; start: string; end: string; icon: string; danger?: boolean; good?: boolean;
}) {
  const active = isActive(start, end);
  return (
    <div className={`${styles.timeSlot} ${active ? (danger ? styles.slotActiveDanger : styles.slotActiveGood) : ''}`}>
      <i className={`${icon} ${styles.slotIcon}`} style={{ color: danger ? '#ef4444' : good ? '#22c55e' : '#f59e0b' }} />
      <div className={styles.slotBody}>
        <p className={styles.slotLabel}>
          {label}
          {active && <span className={styles.nowBadge}>Now</span>}
        </p>
        <p className={styles.slotTime}>{fmtTime(start)} – {fmtTime(end)}</p>
      </div>
      {danger && <i className="ri-close-circle-line" style={{ color: '#ef4444', opacity: 0.4 }} />}
      {good  && <i className="ri-check-circle-line" style={{ color: '#22c55e', opacity: 0.4 }} />}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function PanchangClient() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly'>('daily');
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(12, 0, 0, 0); // Noon to avoid DST/date shifting issues
    return d;
  });

  const [lat, setLat] = useState(DEFAULT_LAT);
  const [lon, setLon] = useState(DEFAULT_LON);
  const [locName, setLocName] = useState('Kolkata, WB');

  const [data, setData] = useState<PanchangResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [time, setTime] = useState(new Date());

  // Location search states
  const [showLocPanel, setShowLocPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  // Custom date picker popup state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Mounted status check
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close custom date picker if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live clock ticker
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // 1. Initial Load from localStorage + background GPS fetch on mount
  useEffect(() => {
    const cachedLat = localStorage.getItem('panchang_lat');
    const cachedLon = localStorage.getItem('panchang_lon');
    const cachedLoc = localStorage.getItem('panchang_locName');

    let currentLat = DEFAULT_LAT;
    let currentLon = DEFAULT_LON;
    let currentLoc = 'Kolkata, WB';

    if (cachedLat && cachedLon && cachedLoc) {
      currentLat = parseFloat(cachedLat);
      currentLon = parseFloat(cachedLon);
      currentLoc = cachedLoc;
      setLat(currentLat);
      setLon(currentLon);
      setLocName(currentLoc);
    }

    // Silent background GPS refresh
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const gpsLat = pos.coords.latitude;
          const gpsLon = pos.coords.longitude;
          localStorage.setItem('panchang_lat', gpsLat.toString());
          localStorage.setItem('panchang_lon', gpsLon.toString());
          localStorage.setItem('panchang_locName', 'Your Location');
          setLat(gpsLat);
          setLon(gpsLon);
          setLocName('Your Location');
        },
        (err) => {
          console.log('[Panchang GPS]', err);
        },
        { timeout: 8000 }
      );
    }
  }, []);

  // 2. Fetch daily panchang when lat, lon, or selectedDate changes
  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const dateStr = selectedDate.toISOString().split('T')[0];
        const res = await fetch(`/api/panchang?lat=${lat}&lon=${lon}&date=${dateStr}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: PanchangResult = await res.json();
        setData(json);
      } catch (e) {
        console.error(e);
        setError('Could not compute panchang. Please check your network.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [lat, lon, selectedDate]);

  // 3. Debounced location search using Nominatim
  useEffect(() => {
    if (searchQuery.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchQuery
          )}&addressdetails=1&limit=5`
        );
        if (res.ok) {
          const json = await res.json();
          setSearchResults(json);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setSearching(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Location selection handlers
  const handleSelectResult = (item: any) => {
    let name = item.display_name;
    if (item.address) {
      const city = item.address.city || item.address.town || item.address.village || item.address.suburb;
      const state = item.address.state || item.address.country;
      if (city && state) {
        name = `${city}, ${state}`;
      } else if (city) {
        name = city;
      } else if (item.address.country) {
        name = `${item.address.road || item.address.suburb || ''}, ${item.address.country}`.replace(/^,\s*/, '');
      }
    }
    if (name.length > 25) {
      name = name.substring(0, 22) + '...';
    }

    const newLat = parseFloat(item.lat);
    const newLon = parseFloat(item.lon);

    localStorage.setItem('panchang_lat', newLat.toString());
    localStorage.setItem('panchang_lon', newLon.toString());
    localStorage.setItem('panchang_locName', name);

    setLat(newLat);
    setLon(newLon);
    setLocName(name);

    setShowLocPanel(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleUseGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const gpsLat = pos.coords.latitude;
          const gpsLon = pos.coords.longitude;
          localStorage.setItem('panchang_lat', gpsLat.toString());
          localStorage.setItem('panchang_lon', gpsLon.toString());
          localStorage.setItem('panchang_locName', 'Your Location');
          setLat(gpsLat);
          setLon(gpsLon);
          setLocName('Your Location');
          setShowLocPanel(false);
        },
        (err) => {
          alert('Failed to get location. Please check your browser permissions.');
        }
      );
    }
  };

  // Custom Date selection handlers
  const shiftDay = (amount: number) => {
    setSelectedDate(curr => {
      const next = new Date(curr);
      next.setDate(next.getDate() + amount);
      return next;
    });
  };

  const handleSelectDateFromPicker = (d: number, m: number, y: number) => {
    const next = new Date(y, m, d, 12, 0, 0, 0);
    setSelectedDate(next);
  };

  const jumpToToday = () => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    setSelectedDate(d);
  };

  const handleSelectDayFromCalendar = (result: PanchangResult, date: Date) => {
    setSelectedDate(date);
    setData(result);
    setActiveTab('daily');
  };

  const isSelectedToday = isSameDay(selectedDate, new Date());
  const maxDays = getDaysInMonth(selectedDate.getFullYear(), selectedDate.getMonth());

  if (!mounted) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.spinner} />
        <p>Computing today's Panchang…</p>
      </div>
    );
  }

  return (
    <div className={styles.panchangWrap}>
      {/* ─── TABS ─── */}
      <div className={styles.tabs}>
        <button
          onClick={() => setActiveTab('daily')}
          className={`${styles.tabBtn} ${activeTab === 'daily' ? styles.tabActive : ''}`}
        >
          <i className="ri-calendar-todo-line" /> Daily View
        </button>
        <button
          onClick={() => setActiveTab('monthly')}
          className={`${styles.tabBtn} ${activeTab === 'monthly' ? styles.tabActive : ''}`}
        >
          <i className="ri-calendar-2-line" /> Monthly Calendar
        </button>
      </div>

      {/* ─── LOCATION BAR ─── */}
      <div className={styles.locationContainer}>
        <div className={styles.locLeft}>
          <i className="ri-map-pin-2-fill" style={{ color: '#f59e0b' }} />
          <span className={styles.locMain}>{locName}</span>
          <span className={styles.locCoords}>({lat.toFixed(4)}° N, {lon.toFixed(4)}° E)</span>
        </div>
        <button onClick={() => setShowLocPanel(!showLocPanel)} className={styles.changeLocBtn}>
          <i className="ri-edit-line" /> Change
        </button>
      </div>

      {/* ─── LOCATION SEARCH PANEL (INLINE) ─── */}
      {showLocPanel && (
        <div className={styles.searchPanel}>
          <div className={styles.searchInputRow}>
            <div className={styles.searchFieldWrap}>
              <i className="ri-search-line styles.searchFieldIcon" />
              <input
                type="text"
                placeholder="Search city (e.g. Delhi, London)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <button onClick={handleUseGPS} className={styles.gpsBtn} title="Detect Current GPS Location">
              <i className="ri-gps-fill" /> GPS
            </button>
          </div>

          {searching && <div className={styles.searchLoading}>Searching cities...</div>}

          {searchResults.length > 0 && (
            <div className={styles.searchResults}>
              {searchResults.map((item) => (
                <button
                  key={item.place_id}
                  onClick={() => handleSelectResult(item)}
                  className={styles.searchResultItem}
                >
                  <i className="ri-map-pin-line" />
                  <span>{item.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'daily' ? (
        <>
          {/* ─── CUSTOM DATE SELECTOR (Replacing native HTML date picker) ─── */}
          <div className={styles.dateSelector}>
            <button onClick={() => shiftDay(-1)} className={styles.dateNavBtn}>
              <i className="ri-arrow-left-s-line" />
            </button>

            <div
              className={styles.dateDisplay}
              onClick={() => setShowDatePicker(!showDatePicker)}
              title="Click to select custom date"
            >
              <i className="ri-calendar-event-line" style={{ color: '#fb923c' }} />
              <span className={styles.dateText}>{fmtDate(selectedDate)}</span>
              <i className={`ri-arrow-${showDatePicker ? 'up' : 'down'}-s-line`} />
            </div>

            <button onClick={() => shiftDay(1)} className={styles.dateNavBtn}>
              <i className="ri-arrow-right-s-line" />
            </button>

            {!isSelectedToday && (
              <button onClick={jumpToToday} className={styles.todayShortcut}>
                Today
              </button>
            )}

            {/* Custom styled date picker dropdown */}
            {showDatePicker && (
              <div className={styles.dateDropdown} ref={datePickerRef}>
                <div className={styles.datePickerGrids}>
                  {/* Day Selection */}
                  <div className={styles.dateSelectField}>
                    <label>Day</label>
                    <select
                      value={selectedDate.getDate()}
                      onChange={(e) => handleSelectDateFromPicker(Number(e.target.value), selectedDate.getMonth(), selectedDate.getFullYear())}
                      className={styles.dateSelect}
                    >
                      {Array.from({ length: maxDays }, (_, i) => i + 1).map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  {/* Month Selection */}
                  <div className={styles.dateSelectField}>
                    <label>Month</label>
                    <select
                      value={selectedDate.getMonth()}
                      onChange={(e) => {
                        const newMonth = Number(e.target.value);
                        // clamp day if the new month has fewer days
                        const maxDaysNewMonth = getDaysInMonth(selectedDate.getFullYear(), newMonth);
                        const currDay = Math.min(selectedDate.getDate(), maxDaysNewMonth);
                        handleSelectDateFromPicker(currDay, newMonth, selectedDate.getFullYear());
                      }}
                      className={styles.dateSelect}
                    >
                      {MONTH_NAMES.map((m, idx) => (
                        <option key={m} value={idx}>{m}</option>
                      ))}
                    </select>
                  </div>

                  {/* Year Selection */}
                  <div className={styles.dateSelectField}>
                    <label>Year</label>
                    <select
                      value={selectedDate.getFullYear()}
                      onChange={(e) => {
                        const newYear = Number(e.target.value);
                        const maxDaysNewYear = getDaysInMonth(newYear, selectedDate.getMonth());
                        const currDay = Math.min(selectedDate.getDate(), maxDaysNewYear);
                        handleSelectDateFromPicker(currDay, selectedDate.getMonth(), newYear);
                      }}
                      className={styles.dateSelect}
                    >
                      {Array.from({ length: 25 }, (_, i) => 2015 + i).map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button onClick={() => setShowDatePicker(false)} className={styles.dateApplyBtn}>
                  Apply Date
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className={styles.loadingWrap}>
              <div className={styles.spinner} />
              <p>Computing Panchang details...</p>
            </div>
          ) : error || !data ? (
            <div className={styles.loadingWrap}>
              <p style={{ color: '#ef4444' }}>{error || 'Failed to load.'}</p>
            </div>
          ) : (
            <>
              {/* Greg / Hindu dates overview */}
              <div className={styles.clockCard}>
                <div className={styles.clockInner}>
                  <div>
                    {isSelectedToday ? (
                      <p className={styles.liveClock}>
                        {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                      </p>
                    ) : (
                      <p className={styles.liveClock} style={{ color: '#94a3b8' }}>
                        Panchang Record
                      </p>
                    )}
                    <p className={styles.dateGreg}>{fmtDate(selectedDate)}</p>
                    <p className={styles.dateHindu}>
                      {data.tithi.paksha} &middot; {data.hinduMonth.name} &middot; {data.hinduMonth.samvat} VS
                    </p>
                  </div>
                  <div className={styles.locTag}>
                    <i className="ri-map-pin-2-line" />
                    <span>{locName}</span>
                  </div>
                </div>
              </div>

              {/* ─── SUN PATH (SVG Visual) ─── */}
              <SunArc sunrise={data.sunrise} sunset={data.sunset} isToday={isSelectedToday} />

              {/* ─── PANCHA ANGA (Five Limbs) ─── */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <i className="ri-moon-line" /> Pancha Aṅga
                  <span className={styles.sectionSub}>Five Limbs of Panchang</span>
                </h2>
                <div className={styles.angasGrid}>
                  <AngaCard label="Vara · Day"     value={data.vara.english}      sub={data.vara.sanskrit}                       color="#f59e0b" />
                  <AngaCard label="Tithi · Lunar Day" value={data.tithi.name}     sub={`${data.tithi.paksha} · #${data.tithi.index}`} color="#fb923c" />
                  <AngaCard label="Nakshatra"      value={data.nakshatra.name}    sub={`#${data.nakshatra.index} of 27`}          color="#a78bfa" />
                  <AngaCard label="Yoga"           value={data.yoga.name}         sub={`#${data.yoga.index} of 27`}               color="#60a5fa" />
                  <AngaCard label="Karana"         value={data.karana.name}       sub="Half-Tithi period"                         color="#34d399" />
                </div>
              </section>

              {/* ─── AUSPICIOUS MUHURTAS ─── */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <i className="ri-check-double-line" /> Auspicious Muhurtas
                  <span className={styles.sectionSub}>Best times to begin important work</span>
                </h2>
                <div className={styles.timeList}>
                  <TimeSlot label="Brahma Muhurta"  start={data.brahmaMuhurta.start}  end={data.brahmaMuhurta.end}  icon="ri-star-line"    good />
                  <TimeSlot label="Abhijit Muhurta" start={data.abhijitMuhurta.start} end={data.abhijitMuhurta.end} icon="ri-sun-line"     good />
                </div>
              </section>

              {/* ─── INAUSPICIOUS PERIODS ─── */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <i className="ri-time-line" /> Inauspicious Periods
                  <span className={styles.sectionSub}>Avoid starting new work during these times</span>
                </h2>
                <div className={styles.timeList}>
                  <TimeSlot label="Rahu Kalam"   start={data.rahuKalam.start}   end={data.rahuKalam.end}   icon="ri-close-circle-line" danger />
                  <TimeSlot label="Yamagandam"   start={data.yamagandam.start}  end={data.yamagandam.end}  icon="ri-close-circle-line" danger />
                  <TimeSlot label="Gulika Kalam" start={data.gulikaKalam.start} end={data.gulikaKalam.end} icon="ri-close-circle-line" danger />
                </div>
              </section>

              {/* ─── DISCLAIMER (Simple & clean, no consultation warning) ─── */}
              <div className={styles.disclaimer}>
                <i className="ri-information-line" />
                <span>
                  Computed using Drik Ganita (astronomical / Swiss Ephemeris-based) method for{' '}
                  <strong>{locName}</strong>.
                </span>
              </div>
            </>
          )}
        </>
      ) : (
        <MonthCalendar lat={lat} lon={lon} onSelectDay={handleSelectDayFromCalendar} />
      )}
    </div>
  );
}
