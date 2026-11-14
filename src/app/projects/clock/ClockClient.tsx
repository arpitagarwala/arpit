'use client';
import {toolStorage} from '@/lib/account-storage';
import { useEffect, useState } from 'react';
import BackButton from '@/components/BackButton/BackButton';
import styles from './clock.module.css';
const ZONES = [{ name: 'Kolkata', zone: 'Asia/Kolkata' }, { name: 'London', zone: 'Europe/London' }, { name: 'New York', zone: 'America/New_York' }, { name: 'Tokyo', zone: 'Asia/Tokyo' }, { name: 'Sydney', zone: 'Australia/Sydney' }, { name: 'Dubai', zone: 'Asia/Dubai' }];
type Preferences = { analog: boolean; hour12: boolean; seconds: boolean; zone: string };
const DEFAULTS: Preferences = { analog: false, hour12: true, seconds: true, zone: 'local' };
export default function ClockClient() {
  const [now, setNow] = useState<Date | null>(null);
  const [prefs, setPrefs] = useState(DEFAULTS);
  const [localZone, setLocalZone] = useState('UTC');
  const [settings, setSettings] = useState(false);
  const [zen, setZen] = useState(false);
  const [storageNote, setStorageNote] = useState('');
  useEffect(() => {
    const load = setTimeout(() => {
      setLocalZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
      try {
        const raw = JSON.parse(toolStorage.getItem('clock-preferences-v1') || 'null');
        if (raw && typeof raw === 'object') setPrefs({ analog: typeof raw.analog === 'boolean' ? raw.analog : false, hour12: typeof raw.hour12 === 'boolean' ? raw.hour12 : true, seconds: typeof raw.seconds === 'boolean' ? raw.seconds : true, zone: ZONES.some(z => z.zone === raw.zone) ? raw.zone : 'local' });
      } catch { /* Defaults remain available. */ }
      setNow(new Date());
    }, 0);
    const tick = () => setNow(new Date());
    const timer = setInterval(tick, 250);
    document.addEventListener('visibilitychange', tick);
    return () => { clearTimeout(load); clearInterval(timer); document.removeEventListener('visibilitychange', tick); };
  }, []);
  const update = (next: Preferences) => { setPrefs(next); try { toolStorage.setItem('clock-preferences-v1', JSON.stringify(next)); } catch { setStorageNote('Browser storage is unavailable. Settings last for this visit.'); } };
  const zone = prefs.zone === 'local' ? localZone : prefs.zone;
  if (!now) return <main className={styles.page}><p>Setting your clock…</p></main>;
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: zone, hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(now).map(p => [p.type, p.value]));
  const h = Number(parts.hour), m = Number(parts.minute), s = Number(parts.second);
  const date = new Intl.DateTimeFormat('en-US', { timeZone: zone, weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(now);
  const format = (tz: string) => new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: prefs.hour12 }).format(now);
  return <main className={`${styles.page} ${zen ? styles.zen : ''}`}><BackButton /><div className={styles.shell}>
    <header className={styles.header}><div><p className={styles.eyebrow}>A MOMENT, WELL SPENT</p><h1>Clock<span>.</span></h1></div><div className={styles.controls}><button onClick={() => setZen(!zen)}>{zen ? 'Show world clocks' : 'Quiet view'}</button><button aria-expanded={settings} aria-controls="clock-settings" onClick={() => setSettings(!settings)}>Settings</button></div></header>
    {settings && <section id="clock-settings" className={styles.settings} aria-label="Clock settings"><label>Display timezone<select value={prefs.zone} onChange={e => update({ ...prefs, zone: e.target.value })}><option value="local">Your timezone ({localZone.replace(/_/g, ' ')})</option>{ZONES.map(z => <option key={z.zone} value={z.zone}>{z.name}</option>)}</select></label><label><input type="checkbox" checked={prefs.analog} onChange={e => update({ ...prefs, analog: e.target.checked })} /> Analog display</label><label><input type="checkbox" checked={prefs.hour12} onChange={e => update({ ...prefs, hour12: e.target.checked })} /> 12-hour format</label><label><input type="checkbox" checked={prefs.seconds} onChange={e => update({ ...prefs, seconds: e.target.checked })} /> Show seconds</label></section>}
    <section className={styles.hero} aria-label="Current time"><p className={styles.date}>{date}</p>
      {prefs.analog ? <svg className={styles.analog} viewBox="0 0 300 300" role="img" aria-label={`Analog clock: ${format(zone)}`}><circle cx="150" cy="150" r="143" fill="#25221d" stroke="#574938" />{Array.from({ length: 60 }, (_, i) => <line key={i} x1="150" y1="17" x2="150" y2={i % 5 === 0 ? 29 : 22} stroke={i % 5 === 0 ? '#ecddc8' : '#6d5c46'} strokeWidth={i % 5 === 0 ? 3 : 1} transform={`rotate(${i * 6} 150 150)`} />)}{[12, 3, 6, 9].map((n, i) => <text key={n} x={150 + Math.sin(i * Math.PI / 2) * 105} y={155 - Math.cos(i * Math.PI / 2) * 105} textAnchor="middle" fill="#d9b990" fontSize="15">{n}</text>)}<line x1="150" y1="150" x2="150" y2="78" stroke="#faf6f0" strokeWidth="6" strokeLinecap="round" transform={`rotate(${h % 12 * 30 + m * .5 + s / 120} 150 150)`} /><line x1="150" y1="150" x2="150" y2="46" stroke="#d1ab7a" strokeWidth="4" strokeLinecap="round" transform={`rotate(${m * 6 + s * .1} 150 150)`} />{prefs.seconds && <line x1="150" y1="172" x2="150" y2="38" stroke="#e1c7a7" strokeWidth="2" transform={`rotate(${s * 6} 150 150)`} />}<circle cx="150" cy="150" r="6" fill="#e1c7a7" /></svg> : <div className={styles.digital} role="timer" aria-label={format(zone)}><span>{String(prefs.hour12 ? h % 12 || 12 : h).padStart(2, '0')}</span><span className={styles.colon}>:</span><span>{parts.minute}</span>{prefs.seconds && <span className={styles.seconds}>{parts.second}</span>}</div>}
      <div className={styles.meta}>{prefs.hour12 && <span className={styles.badge}>{h < 12 ? 'AM' : 'PM'}</span>}<span>{zone.replace(/_/g, ' ')}</span><span>{h >= 6 && h < 19 ? 'Daytime' : 'After hours'}</span></div>
    </section>
    <section className={styles.world} aria-label="World clocks"><div className={styles.worldHeading}><h2>Same moment. Different places.</h2><p>Live time around the world</p></div><div className={styles.grid}>{ZONES.map(z => { const hour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: z.zone, hour: '2-digit', hourCycle: 'h23' }).format(now)); return <button key={z.zone} aria-pressed={prefs.zone === z.zone} onClick={() => update({ ...prefs, zone: z.zone })}><div><h3>{z.name}</h3><span>{hour >= 6 && hour < 19 ? '☀ Day' : '☾ Night'}</span></div><strong>{format(z.zone)}</strong><small>{new Intl.DateTimeFormat('en-US', { timeZone: z.zone, weekday: 'short', month: 'short', day: 'numeric' }).format(now)}</small></button>; })}</div></section>
    <p className={styles.footer}>{storageNote || 'Synced to your device clock · Preferences saved on this browser'}</p>
  </div></main>;
}

