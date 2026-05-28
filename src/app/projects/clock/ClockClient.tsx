'use client';

import React, { useState, useEffect, useRef } from 'react';
import BackButton from '@/components/BackButton/BackButton';
import styles from './clock.module.css';

export default function ClockClient() {
  const [isClient, setIsClient] = useState(false);
  const [now, setNow] = useState(new Date());

  // Settings state
  const [showSettings, setShowSettings] = useState(false);
  const [isAnalog, setIsAnalog] = useState(false);
  const [is12h, setIs12h] = useState(true);
  const [showSeconds, setShowSeconds] = useState(true);
  const [nightIndicator, setNightIndicator] = useState(true);
  const [showWorldClocks, setShowWorldClocks] = useState(false);
  const [timezoneName, setTimezoneName] = useState('Detecting...');

  const settingsPanelRef = useRef<HTMLDivElement>(null);
  const settingsBtnRef = useRef<HTMLButtonElement>(null);

  // Load and mount
  useEffect(() => {
    setIsClient(true);
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezoneName(tz.replace(/_/g, ' '));
    
    // Timer loop
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    // Outside click handler for settings
    const handleClickOutside = (event: MouseEvent) => {
      if (
        settingsPanelRef.current && 
        !settingsPanelRef.current.contains(event.target as Node) &&
        settingsBtnRef.current &&
        !settingsBtnRef.current.contains(event.target as Node)
      ) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      clearInterval(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Time calculations
  const h = now.getHours();
  const m = now.getMinutes();
  const s = now.getSeconds();
  
  const h12 = h % 12 || 12;
  const hDisp = is12h ? String(h12).padStart(2, '0') : String(h).padStart(2, '0');
  const mDisp = String(m).padStart(2, '0');
  const sDisp = String(s).padStart(2, '0');
  const isNight = h < 6 || h >= 19;
  const ampm = h < 12 ? 'AM' : 'PM';

  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  const secDeg = s * 6;
  const minDeg = m * 6 + s * 0.1;
  const hourDeg = (h % 12) * 30 + m * 0.5;

  const worldTime = (tz: string) => {
    return now.toLocaleTimeString('en-US', {
      timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: is12h
    });
  };

  // Build analog ticks
  const ticks: React.ReactNode[] = [];
  const nums: React.ReactNode[] = [];
  const cx = 140, cy = 140, r = 136;
  
  if (isClient && isAnalog) {
    for (let i = 0; i < 60; i++) {
      const isHour = i % 5 === 0;
      const angleRad = (i * 6 - 90) * Math.PI / 180;
      const outerR = r - 6;
      const innerR = isHour ? outerR - 14 : outerR - 7;
      const x1 = cx + Math.cos(angleRad) * outerR;
      const y1 = cy + Math.sin(angleRad) * outerR;
      const x2 = cx + Math.cos(angleRad) * innerR;
      const y2 = cy + Math.sin(angleRad) * innerR;
      ticks.push(
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={isHour ? "2.5" : "1"} strokeLinecap="round" className={isHour ? styles.tickHour : styles.tickMin} />
      );
    }
    
    const clockNums = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    clockNums.forEach((num, i) => {
      const angleRad = (i * 30 - 90) * Math.PI / 180;
      const numR = r - 32;
      const x = cx + Math.cos(angleRad) * numR;
      const y = cy + Math.sin(angleRad) * numR;
      nums.push(
        <text key={`n${num}`} x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize="11" fontWeight="600" fontFamily="Inter, sans-serif" className={styles.numLabel}>
          {num}
        </text>
      );
    });
  }

  if (!isClient) return <div className="min-h-screen bg-slate-900"></div>;

  return (
    <div className={`min-h-screen transition-colors duration-300 flex flex-col bg-slate-900 text-slate-100 ${styles.clockWrapper}`}>
      <BackButton />

      {/* Settings Button */}
      <div className="fixed top-4 right-4 z-50">
        <button 
          ref={settingsBtnRef}
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-full shadow-md border hover:shadow-lg transition-all duration-100 bg-slate-700 text-slate-200 border-slate-600 hover:border-cyan-400"
        >
          <i className="ri-settings-3-line text-xl"></i>
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-20 gap-5">
        
        {/* Date */}
        <div className={`${styles.fadeUp} text-xs font-semibold uppercase tracking-[0.2em] text-slate-400`}>
          {dateStr}
        </div>

        {/* Digital Clock */}
        {!isAnalog && (
          <div className={`${styles.fadeUp} text-center`}>
            <div className={`flex items-baseline justify-center gap-0 select-none ${styles.digitalTime}`}>
              <span className="text-[13vw] sm:text-[10vw] md:text-[8rem] font-bold tabular-nums leading-none text-slate-100">
                {hDisp}:{mDisp}
              </span>
              {showSeconds && (
                <>
                  <span className={`${styles.colonPulse} text-[13vw] sm:text-[10vw] md:text-[8rem] font-bold leading-none text-cyan-400`}>:</span>
                  <span className="text-[7vw] sm:text-[5vw] md:text-[4.5rem] font-bold tabular-nums leading-none self-end mb-2 text-slate-400">
                    {sDisp}
                  </span>
                </>
              )}
            </div>
            
            <div className="flex items-center justify-center gap-3 mt-3">
              {is12h && (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/25 tracking-wider text-cyan-300">
                  {ampm}
                </span>
              )}
              {nightIndicator && isNight && (
                <span className="text-xs font-medium text-indigo-300">🌙 Night time</span>
              )}
            </div>
            <div className="mt-2 text-xs tracking-wide text-slate-500">
              Timezone: {timezoneName}
            </div>
          </div>
        )}

        {/* Analog Clock */}
        {isAnalog && (
          <div className={`${styles.fadeUp}`}>
            <svg width="280" height="280" viewBox="0 0 280 280" className="drop-shadow-[0_10px_40px_rgba(0,0,0,0.4)]">
              <circle className={styles.clockFaceRing} cx="140" cy="140" r="137" fill="none" strokeWidth="2"/>
              <circle className={styles.clockFaceBg} cx="140" cy="140" r="136"/>
              <g>{ticks}</g>
              <g>{nums}</g>
              <line className={styles.svgSec} x1="140" y1="160" x2="140" y2="40" strokeWidth="1.5" strokeLinecap="round" transform={`rotate(${secDeg}, 140, 140)`} style={{ display: showSeconds ? 'block' : 'none' }}/>
              <line className={styles.svgMin} x1="140" y1="140" x2="140" y2="52" strokeWidth="3.5" strokeLinecap="round" transform={`rotate(${minDeg}, 140, 140)`}/>
              <line className={styles.svgHour} x1="140" y1="140" x2="140" y2="78" strokeWidth="5.5" strokeLinecap="round" transform={`rotate(${hourDeg}, 140, 140)`}/>
              <circle className={styles.svgCapOuter} cx="140" cy="140" r="7"/>
              <circle className={styles.svgCapInner} cx="140" cy="140" r="3.5"/>
            </svg>
            <div className="text-center mt-3 text-xs tracking-wide text-slate-500">
              Timezone: {timezoneName}
            </div>
          </div>
        )}

        {/* World Clocks */}
        {showWorldClocks && (
          <div className={`${styles.fadeUpDelay2} grid grid-cols-3 gap-3 w-full max-w-xs mt-4`}>
            <div className="rounded-xl p-3 text-center border shadow-sm bg-slate-800 border-slate-700/50">
              <p className="text-xs mb-1 text-slate-400">🗽 New York</p>
              <p className={`${styles.wcTime} text-sm font-bold tabular-nums text-cyan-400`}>{worldTime('America/New_York')}</p>
            </div>
            <div className="rounded-xl p-3 text-center border shadow-sm bg-slate-800 border-slate-700/50">
              <p className="text-xs mb-1 text-slate-400">🇬🇧 London</p>
              <p className={`${styles.wcTime} text-sm font-bold tabular-nums text-cyan-400`}>{worldTime('Europe/London')}</p>
            </div>
            <div className="rounded-xl p-3 text-center border shadow-sm bg-slate-800 border-slate-700/50">
              <p className="text-xs mb-1 text-slate-400">🇯🇵 Tokyo</p>
              <p className={`${styles.wcTime} text-sm font-bold tabular-nums text-cyan-400`}>{worldTime('Asia/Tokyo')}</p>
            </div>
          </div>
        )}

      </div>

      {/* Settings Panel */}
      <div 
        ref={settingsPanelRef}
        className={`fixed top-16 right-4 border rounded-2xl p-5 w-72 shadow-2xl z-50 bg-slate-800 border-slate-700/50 ${styles.settingsPanel} ${!showSettings ? styles.panelClosed : ''}`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold flex items-center gap-2 text-slate-100">
            <i className="ri-settings-3-line text-cyan-400"></i> Clock Settings
          </h2>
          <button onClick={() => setShowSettings(false)} className="transition-colors text-slate-400 hover:text-slate-200">
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>
        <div className="rounded-xl p-3 mb-4 bg-slate-700/60">
          <p className="text-xs font-semibold uppercase tracking-wider mb-1 text-slate-400">📍 Your Timezone</p>
          <p className="text-sm font-medium text-slate-200">{timezoneName}</p>
        </div>
        <div className="space-y-3">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-slate-300">Analog Clock</span>
            <input type="checkbox" checked={isAnalog} onChange={e => setIsAnalog(e.target.checked)} className="w-4 h-4 accent-cyan-400 cursor-pointer" />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-slate-300">12-hour Format</span>
            <input type="checkbox" checked={is12h} onChange={e => setIs12h(e.target.checked)} className="w-4 h-4 accent-cyan-400 cursor-pointer" />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-slate-300">Show Seconds</span>
            <input type="checkbox" checked={showSeconds} onChange={e => setShowSeconds(e.target.checked)} className="w-4 h-4 accent-cyan-400 cursor-pointer" />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-slate-300">Night Indicator</span>
            <input type="checkbox" checked={nightIndicator} onChange={e => setNightIndicator(e.target.checked)} className="w-4 h-4 accent-cyan-400 cursor-pointer" />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-slate-300">World Clocks</span>
            <input type="checkbox" checked={showWorldClocks} onChange={e => setShowWorldClocks(e.target.checked)} className="w-4 h-4 accent-cyan-400 cursor-pointer" />
          </label>
        </div>
      </div>
    </div>
  );
}
