'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import BackButton from '@/components/BackButton/BackButton';
import styles from './city.module.css';

type CellType = 'empty' | 'road' | 'res' | 'com' | 'shop' | 'park' | 'power';

interface Cell {
  type: CellType;
  lvl: number;
  age: number;
}

const CELL = 32;
const COSTS: Record<string, number> = { road: 50, res: 200, com: 500, shop: 350, park: 150, power: 1000 };
const COLORS: Record<string, string> = {
  empty: 'rgba(255,255,255,0)',
  road: '#334155', res: '#10b981', com: '#3b82f6',
  shop: '#f59e0b', park: '#22c55e', power: '#ef4444'
};
const ICONS: Record<string, string> = { res: '🏠', com: '🏢', shop: '🏪', park: '🌳', power: '⚡', road: '' };

const SAVE_KEY = 'city-builder-save';

export default function CityBuilderClient() {
  const cvsRef = useRef<HTMLCanvasElement>(null);

  const [tool, setTool] = useState<CellType | 'del'>('road');
  const [speed, setSpeed] = useState<number>(1);
  
  const [funds, setFunds] = useState<number>(10000);
  const [pop, setPop] = useState<number>(0);
  const [day, setDay] = useState<number>(1);
  const [income, setIncome] = useState<number>(0);
  const [happiness, setHappiness] = useState<number>(80);
  
  const [bldStats, setBldStats] = useState({ bld: 0, power: 0, green: 0 });
  const [events, setEvents] = useState<{ id: number; text: string }[]>([]);
  const [toast, setToast] = useState<{ msg: string; type: 'bad' | 'good' } | null>(null);

  const gameData = useRef({
    W: 0, H: 0, COLS: 0, ROWS: 0,
    map: [] as Cell[][],
    isDown: false,
    frameId: 0,
    eventIdCounter: 0
  });

  const showToast = useCallback((msg: string, type: 'bad' | 'good' = 'bad') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2000);
  }, []);

  const addEvent = useCallback((text: string) => {
    const id = ++gameData.current.eventIdCounter;
    setEvents(prev => [{ id, text }, ...prev].slice(0, 4));
    setTimeout(() => {
      setEvents(prev => prev.filter(e => e.id !== id));
    }, 4000);
  }, []);

  const updateStats = useCallback(() => {
    let p = 0, pwr = 0, grn = 0, bld = 0;
    const map = gameData.current.map;
    
    for (let x = 0; x < gameData.current.COLS; x++) {
      for (let y = 0; y < gameData.current.ROWS; y++) {
        const cell = map[x]?.[y];
        if (cell && cell.type !== 'empty') {
          if (cell.type !== 'road') bld++;
          if (cell.type === 'park') grn++;
          if (cell.type === 'power') pwr++;
          if (cell.type === 'res') p += Math.floor(cell.lvl * 4 * (happiness / 100)); // Roughly
        }
      }
    }
    setBldStats({ bld, power: pwr, green: grn });
  }, [happiness]);

  const newCity = useCallback(() => {
    const { COLS, ROWS } = gameData.current;
    setFunds(10000); setPop(0); setDay(1); setHappiness(80); setIncome(0);
    gameData.current.map = [];
    for (let x = 0; x < COLS; x++) {
      gameData.current.map[x] = [];
      for (let y = 0; y < ROWS; y++) {
        gameData.current.map[x][y] = { type: 'empty', lvl: 1, age: 0 };
      }
    }
    updateStats();
  }, [updateStats]);

  const tryLoad = useCallback(() => {
    const savedStr = localStorage.getItem(SAVE_KEY);
    if (savedStr) {
      try {
        const saved = JSON.parse(savedStr);
        if (saved && saved.map) {
          if (window.confirm('Continue your saved city?')) {
            setFunds(saved.funds || 10000);
            setPop(saved.pop || 0);
            setDay(saved.day || 1);
            gameData.current.map = saved.map;
            // Pad map if necessary
            const { COLS, ROWS } = gameData.current;
            for (let x = 0; x < COLS; x++) {
              if (!gameData.current.map[x]) gameData.current.map[x] = [];
              for (let y = 0; y < ROWS; y++) {
                if (!gameData.current.map[x][y]) {
                  gameData.current.map[x][y] = { type: 'empty', lvl: 1, age: 0 };
                }
              }
            }
            updateStats();
            return;
          }
        }
      } catch (e) {
        console.error("Save corrupted");
      }
    }
    newCity();
  }, [newCity, updateStats]);

  const resize = useCallback(() => {
    if (!cvsRef.current) return;
    const cvs = cvsRef.current;
    gameData.current.W = cvs.width = window.innerWidth;
    gameData.current.H = cvs.height = window.innerHeight;
    gameData.current.COLS = Math.ceil(gameData.current.W / CELL) + 1;
    gameData.current.ROWS = Math.ceil(gameData.current.H / CELL) + 1;
  }, []);

  // Initialization
  useEffect(() => {
    resize();
    window.addEventListener('resize', resize);
    tryLoad();
    return () => {
      window.removeEventListener('resize', resize);
      if (gameData.current.frameId) cancelAnimationFrame(gameData.current.frameId);
    };
  }, [resize, tryLoad]);

  const saveCity = useCallback(() => {
    const trimmed = gameData.current.map.map(col => col.map(cell => ({ type: cell.type, lvl: cell.lvl, age: cell.age })));
    localStorage.setItem(SAVE_KEY, JSON.stringify({ funds, pop, day, map: trimmed }));
    showToast('💾 City saved!', 'good');
  }, [funds, pop, day, showToast]);

  // Interaction
  const interact = useCallback((cx: number, cy: number, currentTool: CellType | 'del', currentFunds: number) => {
    if (cx < 0 || cx >= gameData.current.COLS || cy < 0 || cy >= gameData.current.ROWS) return currentFunds;
    
    const map = gameData.current.map;
    if (!map[cx] || !map[cx][cy]) return currentFunds;
    
    const cell = map[cx][cy];

    if (currentTool === 'del') {
      if (cell.type !== 'empty') {
        cell.type = 'empty'; cell.lvl = 1; cell.age = 0;
        updateStats();
      }
      return currentFunds;
    }
    
    if (cell.type !== 'empty') return currentFunds;
    
    const cost = COSTS[currentTool];
    if (!cost) return currentFunds;
    
    if (currentFunds < cost) {
      showToast(`Not enough funds! (Need $${cost})`);
      gameData.current.isDown = false; // Stop drag
      return currentFunds;
    }
    
    cell.type = currentTool as CellType;
    cell.lvl = 1;
    cell.age = 0;
    updateStats();
    
    return currentFunds - cost;
  }, [showToast, updateStats]);

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    // Only process if it's the canvas itself to avoid button drags
    if ((e.target as HTMLElement).tagName !== 'CANVAS') return;
    
    gameData.current.isDown = true;
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    
    const cx = Math.floor(clientX / CELL);
    const cy = Math.floor(clientY / CELL);
    
    setFunds(prev => interact(cx, cy, tool, prev));
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!gameData.current.isDown) return;
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    
    const cx = Math.floor(clientX / CELL);
    const cy = Math.floor(clientY / CELL);
    
    setFunds(prev => interact(cx, cy, tool, prev));
  };

  const handlePointerUp = () => {
    gameData.current.isDown = false;
  };

  useEffect(() => {
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchend', handlePointerUp);
    return () => {
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, []);

  // Simulation tick
  useEffect(() => {
    const tick = () => {
      setDay(d => d + 1);
      
      const map = gameData.current.map;
      let inc = 0;
      let newPop = 0;
      let parks = 0, pwr = 0, bld = 0;
      
      for (let x = 0; x < gameData.current.COLS; x++) {
        for (let y = 0; y < gameData.current.ROWS; y++) {
          if (map[x]?.[y]?.type === 'park') parks++;
          if (map[x]?.[y]?.type === 'power') pwr++;
        }
      }

      let h = 50 + parks * 5 + (pwr > 0 ? 10 : -20);
      h = Math.min(100, Math.max(0, h));
      setHappiness(h);

      for (let x = 0; x < gameData.current.COLS; x++) {
        for (let y = 0; y < gameData.current.ROWS; y++) {
          const cell = map[x]?.[y];
          if (!cell || cell.type === 'empty' || cell.type === 'road') continue;
          
          cell.age++;
          bld++;
          
          const neighbors = [
            map[x-1]?.[y], map[x+1]?.[y], map[x]?.[y-1], map[x]?.[y+1]
          ];
          const nearRoad = neighbors.some(c => c && c.type === 'road');
          
          if (cell.type === 'res') {
            const growth = nearRoad ? 0.01 : 0.002;
            if (Math.random() < growth * h / 100) cell.lvl = Math.min(cell.lvl + 0.1, 8);
            newPop += Math.floor(cell.lvl * 4 * (h / 100));
            inc += cell.lvl * 2;
          }
          if (cell.type === 'com') {
            // we use the previous pop for calculating com income to avoid complex circular ref
            setPop(prevPop => {
              inc += cell.lvl * 20 * (prevPop > 0 ? 1 : 0.2) * (nearRoad ? 1 : 0.3);
              return prevPop;
            });
            if (Math.random() < 0.005) cell.lvl = Math.min(cell.lvl + 0.1, 5);
          }
          if (cell.type === 'shop') {
            inc += cell.lvl * 10 * (nearRoad ? 1 : 0.4);
            if (Math.random() < 0.008) cell.lvl = Math.min(cell.lvl + 0.1, 5);
          }
        }
      }

      setPop(newPop);
      setIncome(Math.floor(inc / 10));
      setFunds(f => f + Math.floor(inc / 10));
      setBldStats({ bld, power: pwr, green: parks });

      // Random events
      setDay(currentDay => {
        if (currentDay % 10 === 0 && Math.random() < 0.3) {
          const evs = ['🏗 Construction boom! +$500', '🌧 Flood warning! -$200', '🎉 Festival! +pop boost', '📈 Tax revenue! +$300'];
          const ev = evs[Math.floor(Math.random() * evs.length)];
          if (ev.includes('+$500')) setFunds(f => f + 500);
          if (ev.includes('-$200')) setFunds(f => f - 200);
          if (ev.includes('+$300')) setFunds(f => f + 300);
          addEvent(ev);
        }
        return currentDay;
      });
    };

    const interval = setInterval(tick, Math.floor(2000 / speed));
    return () => clearInterval(interval);
  }, [speed, addEvent]);

  // Render loop
  const draw = useCallback(() => {
    const cvs = cvsRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    if (!ctx) return;
    
    const { W, H, COLS, ROWS, map } = gameData.current;

    ctx.fillStyle = '#0a0f1e';
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(34,211,238,0.04)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= COLS; x++) { ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, H); ctx.stroke(); }
    for (let y = 0; y <= ROWS; y++) { ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(W, y * CELL); ctx.stroke(); }

    for (let x = 0; x < COLS; x++) {
      for (let y = 0; y < ROWS; y++) {
        const cell = map[x]?.[y];
        if (!cell || cell.type === 'empty') continue;
        
        const px = x * CELL, py = y * CELL;

        if (cell.type === 'road') {
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(px + 1, py + 1, CELL - 2, CELL - 2);
          ctx.fillStyle = '#334155';
          ctx.fillRect(px + 6, py + 6, CELL - 12, CELL - 12);
        } else {
          const lvl = Math.min(cell.lvl, 8);
          const h = Math.min(CELL - 6, 4 + lvl * 3.2);
          
          ctx.shadowBlur = cell.type === 'power' ? 12 : 6;
          ctx.shadowColor = COLORS[cell.type];
          ctx.fillStyle = COLORS[cell.type];
          ctx.globalAlpha = 0.8 + lvl * 0.025;
          ctx.fillRect(px + 4, py + CELL - h - 2, CELL - 8, h);
          ctx.globalAlpha = 1; 
          ctx.shadowBlur = 0;

          ctx.font = `${Math.min(14, 8 + lvl)}px serif`;
          ctx.textAlign = 'center';
          ctx.fillStyle = '#fff';
          ctx.fillText(ICONS[cell.type] || '', px + CELL / 2, py + CELL - h - 4);
          ctx.textAlign = 'left';
        }
      }
    }
    
    gameData.current.frameId = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    gameData.current.frameId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(gameData.current.frameId);
  }, [draw]);

  return (
    <div className={styles.container}>
      <div className="fixed top-4 left-4 z-50 pointer-events-auto">
        <BackButton />
      </div>

      <div className={styles.hud}>
        <div style={{ width: '40px', flexShrink: 0 }}></div>
        <div className={styles.hudPill}>
          <div className={styles.hudLabel}>Funds</div>
          <div className={styles.hudVal}>${Math.floor(funds).toLocaleString()}</div>
        </div>
        <div className={styles.hudPill}>
          <div className={styles.hudLabel}>Population</div>
          <div className={styles.hudVal}>{Math.floor(pop).toLocaleString()}</div>
        </div>
        <div className={styles.hudPill}>
          <div className={styles.hudLabel}>Income/s</div>
          <div className={styles.hudVal}>${Math.floor(income).toLocaleString()}</div>
        </div>
        <div className={styles.hudPill}>
          <div className={styles.hudLabel}>Day</div>
          <div className={styles.hudVal}>{day}</div>
        </div>
        <div className={styles.legend}>
          <div className={styles.lg}><div className={styles.lgDot} style={{ background: '#475569' }}></div>Road</div>
          <div className={styles.lg}><div className={styles.lgDot} style={{ background: '#10b981' }}></div>Home</div>
          <div className={styles.lg}><div className={styles.lgDot} style={{ background: '#3b82f6' }}></div>Office</div>
          <div className={styles.lg}><div className={styles.lgDot} style={{ background: '#f59e0b' }}></div>Shop</div>
          <div className={styles.lg}><div className={styles.lgDot} style={{ background: '#22c55e' }}></div>Park</div>
          <div className={styles.lg}><div className={styles.lgDot} style={{ background: '#ef4444' }}></div>Power</div>
        </div>
      </div>

      <div className={styles.infoPanel}>
        <div className={styles.infoTitle}>City Stats</div>
        <div className={styles.infoRow}>
          <span className={styles.infoKey}>Happiness</span>
          <span className={styles.infoVal}>{happiness.toFixed(0)}%</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoKey}>Power Grid</span>
          <span className={styles.infoVal}>{bldStats.power > 0 ? `${bldStats.power} plant${bldStats.power > 1 ? 's' : ''}` : '⚠ None'}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoKey}>Green Space</span>
          <span className={styles.infoVal}>{bldStats.green > 0 ? `${bldStats.green} park${bldStats.green > 1 ? 's' : ''}` : 'Low'}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoKey}>Buildings</span>
          <span className={styles.infoVal}>{bldStats.bld}</span>
        </div>
        <div className={styles.infoRow} style={{ marginTop: '10px', borderTop: '1px solid rgba(34,211,238,0.08)', paddingTop: '10px' }}>
          <span className={styles.infoKey}>Save</span>
          <button onClick={saveCity} className={styles.saveBtn}>💾 Save</button>
        </div>
      </div>

      <canvas 
        ref={cvsRef} 
        className={styles.canvas} 
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
      />

      <div className={styles.toolbar}>
        <button className={`${styles.toolBtn} ${tool === 'road' ? styles.toolBtnActive : ''}`} onClick={() => setTool('road')}>
          <i className="ri-road-map-line"></i><span>Road $50</span>
        </button>
        <button className={`${styles.toolBtn} ${tool === 'res' ? styles.toolBtnActive : ''}`} onClick={() => setTool('res')}>
          <i className="ri-home-8-line"></i><span>Home $200</span>
        </button>
        <button className={`${styles.toolBtn} ${tool === 'com' ? styles.toolBtnActive : ''}`} onClick={() => setTool('com')}>
          <i className="ri-building-line"></i><span>Office $500</span>
        </button>
        <button className={`${styles.toolBtn} ${tool === 'shop' ? styles.toolBtnActive : ''}`} onClick={() => setTool('shop')}>
          <i className="ri-store-2-line"></i><span>Shop $350</span>
        </button>
        <button className={`${styles.toolBtn} ${tool === 'park' ? styles.toolBtnActive : ''}`} onClick={() => setTool('park')}>
          <i className="ri-plant-line"></i><span>Park $150</span>
        </button>
        <button className={`${styles.toolBtn} ${tool === 'power' ? styles.toolBtnActive : ''}`} onClick={() => setTool('power')}>
          <i className="ri-flashlight-line"></i><span>Power $1K</span>
        </button>
        <div className={styles.toolSep}></div>
        <button className={`${styles.toolBtn} ${tool === 'del' ? styles.toolBtnActive : ''}`} onClick={() => setTool('del')}>
          <i className="ri-eraser-line"></i><span>Demo</span>
        </button>
        <div className={styles.toolSep}></div>
        <button className={`${styles.speedBtn} ${speed === 1 ? styles.speedBtnActive : ''}`} onClick={() => setSpeed(1)}>1×</button>
        <button className={`${styles.speedBtn} ${speed === 2 ? styles.speedBtnActive : ''}`} onClick={() => setSpeed(2)}>2×</button>
        <button className={`${styles.speedBtn} ${speed === 4 ? styles.speedBtnActive : ''}`} onClick={() => setSpeed(4)}>4×</button>
      </div>

      <div className={styles.eventLog}>
        {events.map(ev => (
          <div key={ev.id} className={styles.eventItem}>
            {ev.text}
          </div>
        ))}
      </div>
      
      <div className={`${styles.toast} ${toast ? styles.toastShow : ''} ${toast?.type === 'good' ? styles.toastGood : ''}`}>
        {toast?.msg}
      </div>
    </div>
  );
}
