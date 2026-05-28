'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import BackButton from '@/components/BackButton/BackButton';
import styles from './clicker.module.css';

interface Building {
  id: string;
  name: string;
  icon: string;
  base: number;
  ps: number;
  click: number;
  desc: string;
}

const BUILDINGS: Building[] = [
  { id: 'intern', name: 'CA Intern', icon: '📚', base: 10, ps: 0.1, click: 0.5, desc: 'Grinding the basics' },
  { id: 'junior', name: 'Junior CA', icon: '🧾', base: 80, ps: 0.5, click: 1, desc: 'Audit & compliance' },
  { id: 'firm', name: 'CA Practice', icon: '🏢', base: 500, ps: 2, click: 3, desc: 'Your own practice' },
  { id: 'tax', name: 'Tax Consultant', icon: '📊', base: 2200, ps: 8, click: 8, desc: 'Tax planning maven' },
  { id: 'mca', name: 'MCA Filing Firm', icon: '🖥️', base: 8000, ps: 25, click: 15, desc: 'Corporate compliance' },
  { id: 'audit', name: 'Audit Partner', icon: '🔍', base: 28000, ps: 75, click: 40, desc: 'Big 4 calibre' },
  { id: 'invest', name: 'Investment Bank', icon: '📈', base: 100000, ps: 200, click: 100, desc: 'Finance powerhouse' },
  { id: 'empire', name: 'Finance Empire', icon: '🏦', base: 500000, ps: 800, click: 400, desc: 'Legend of the street' },
];

const MILESTONES = [
  { val: 100, label: 'First Century ₹' },
  { val: 1000, label: '₹1K Milestone' },
  { val: 10000, label: '₹10K Club' },
  { val: 100000, label: 'Lakhpati' },
  { val: 1000000, label: 'Crorepati' },
  { val: 10000000, label: 'Finance God' },
];

interface GameState {
  bal: number;
  total: number;
  prestige: number;
  owned: Record<string, number>;
  badges: string[];
}

interface FloatCoin {
  id: number;
  x: number;
  y: number;
  text: string;
}

export default function ClickerClient() {
  const [state, setState] = useState<GameState>({
    bal: 0,
    total: 0,
    prestige: 1,
    owned: {},
    badges: [],
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [floatCoins, setFloatCoins] = useState<FloatCoin[]>([]);
  const floatIdRef = useRef(0);

  useEffect(() => {
    const saved = localStorage.getItem('ca-clicker');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState({
          bal: parsed.bal || 0,
          total: parsed.total || 0,
          prestige: parsed.prestige || 1,
          owned: parsed.owned || {},
          badges: parsed.badges || [],
        });
      } catch (e) {
        console.error("Failed to parse clicker save data");
      }
    }
    setIsLoaded(true);
  }, []);

  const saveState = useCallback((newState: GameState) => {
    localStorage.setItem('ca-clicker', JSON.stringify(newState));
  }, []);

  const getPerClick = useCallback((s: GameState) => {
    let base = 1;
    BUILDINGS.forEach(b => base += (s.owned[b.id] || 0) * b.click);
    return Math.ceil(base * s.prestige);
  }, []);

  const getPerSec = useCallback((s: GameState) => {
    let ps = 0;
    BUILDINGS.forEach(b => ps += (s.owned[b.id] || 0) * b.ps);
    return ps * s.prestige;
  }, []);

  const getBuildingCost = (b: Building, s: GameState) => {
    return Math.ceil(b.base * Math.pow(1.15, s.owned[b.id] || 0));
  };

  const fmt = (n: number) => {
    if (n >= 1e7) return (n / 1e7).toFixed(1) + 'Cr';
    if (n >= 1e5) return (n / 1e5).toFixed(1) + 'L';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return Math.floor(n).toString();
  };

  // Passive income ticker
  useEffect(() => {
    if (!isLoaded) return;
    let lastTick = Date.now();
    
    const interval = setInterval(() => {
      const now = Date.now();
      const dt = (now - lastTick) / 1000;
      lastTick = now;
      
      setState(prev => {
        const ps = getPerSec(prev);
        const earn = ps * dt;
        if (earn <= 0) return prev;
        
        const nextState = {
          ...prev,
          bal: prev.bal + earn,
          total: prev.total + earn
        };
        
        // Check milestones
        let newBadges = [...nextState.badges];
        let badgesChanged = false;
        MILESTONES.forEach(m => {
          if (nextState.total >= m.val && !newBadges.includes(m.label)) {
            newBadges.push(m.label);
            badgesChanged = true;
          }
        });
        if (badgesChanged) nextState.badges = newBadges;
        
        saveState(nextState);
        return nextState;
      });
    }, 250);
    
    return () => clearInterval(interval);
  }, [isLoaded, getPerSec, saveState]);

  const handleMainClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (e.type === 'touchstart') e.preventDefault(); // Prevent double firing

    setState(prev => {
      const earn = getPerClick(prev);
      const nextState = {
        ...prev,
        bal: prev.bal + earn,
        total: prev.total + earn
      };
      
      // Check milestones
      let newBadges = [...nextState.badges];
      let badgesChanged = false;
      MILESTONES.forEach(m => {
        if (nextState.total >= m.val && !newBadges.includes(m.label)) {
          newBadges.push(m.label);
          badgesChanged = true;
        }
      });
      if (badgesChanged) nextState.badges = newBadges;
      
      saveState(nextState);
      
      // Spawn float text
      let clientX, clientY;
      if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = (e as React.MouseEvent).clientX;
        clientY = (e as React.MouseEvent).clientY;
      }

      const id = ++floatIdRef.current;
      setFloatCoins(fc => [...fc, { id, x: clientX, y: clientY, text: `+₹${fmt(earn)}` }]);
      setTimeout(() => {
        setFloatCoins(fc => fc.filter(f => f.id !== id));
      }, 900);
      
      return nextState;
    });
  };

  const buyBuilding = (b: Building) => {
    setState(prev => {
      const cost = getBuildingCost(b, prev);
      if (prev.bal < cost) return prev;
      
      const nextState = {
        ...prev,
        bal: prev.bal - cost,
        owned: {
          ...prev.owned,
          [b.id]: (prev.owned[b.id] || 0) + 1
        }
      };
      saveState(nextState);
      return nextState;
    });
  };

  const doPrestige = () => {
    setState(prev => {
      if (prev.total < 100000) return prev;
      const mult = Math.floor(prev.total / 100000) + 1;
      const nextState = {
        ...prev,
        prestige: mult,
        bal: 0,
        total: 0,
        owned: {}
      };
      saveState(nextState);
      return nextState;
    });
  };

  if (!isLoaded) return null; // Avoid hydration mismatch

  return (
    <div className={styles.app}>
      <div className="fixed top-4 left-4 z-50 pointer-events-auto">
        <BackButton />
      </div>

      {floatCoins.map(fc => (
        <div key={fc.id} className={styles.floatCoin} style={{ left: fc.x, top: fc.y }}>
          {fc.text}
        </div>
      ))}

      <div className={styles.header}>
        <h1>💼 CA Money Clicker</h1>
        <p>Build your Chartered Accountant empire. Click to earn. Invest to grow.</p>
      </div>

      <div 
        className={styles.clickZone} 
        onClick={handleMainClick}
        onTouchStart={handleMainClick}
      >
        <div className={styles.coin}>₹</div>
        <div className={styles.earnLabel}>+<span id="per-click">{fmt(getPerClick(state))}</span> per click</div>
      </div>

      <div className={styles.psTicker}>
        ⚡ <span>{fmt(getPerSec(state))}</span> / sec passive income
      </div>

      <div className={styles.stats}>
        <div className={styles.statBox}>
          <div className={styles.statLabel}>Balance</div>
          <div className={styles.statVal}>₹{fmt(state.bal)}</div>
        </div>
        <div className={styles.statBox}>
          <div className={styles.statLabel}>Total Earned</div>
          <div className={styles.statVal}>₹{fmt(state.total)}</div>
        </div>
        <div className={styles.statBox}>
          <div className={styles.statLabel}>Prestige</div>
          <div className={styles.statVal}>×{state.prestige}</div>
        </div>
      </div>

      <div className={styles.sectionTitle}>Income Buildings</div>
      <div className={styles.buildings}>
        {BUILDINGS.map(b => {
          const cost = getBuildingCost(b, state);
          const isAffordable = state.bal >= cost;
          return (
            <div 
              key={b.id} 
              className={`${styles.bld} ${isAffordable ? styles.affordable : ''}`} 
              onClick={() => buyBuilding(b)}
            >
              <div className={styles.bldCnt}>{state.owned[b.id] || 0}</div>
              <div className={styles.bldIcon}>{b.icon}</div>
              <div className={styles.bldName}>{b.name}</div>
              <div className={styles.bldOwned}>{b.desc}</div>
              <div className={styles.bldCost}>₹{fmt(cost)}</div>
              <div className={styles.bldPs}>+{b.ps}/s +{b.click}/click</div>
            </div>
          );
        })}
      </div>

      {state.total >= 100000 && (
        <button className={styles.prestigeBtn} onClick={doPrestige}>
          🌟 Prestige — Reset for ×{Math.floor(state.total / 100000) + 1} multiplier
        </button>
      )}

      <div className={styles.milestones}>
        {state.badges.map((b, i) => (
          <div key={i} className={styles.badge}>🏆 {b}</div>
        ))}
      </div>
    </div>
  );
}
