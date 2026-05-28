'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import BackButton from '@/components/BackButton/BackButton';
import styles from './asmr.module.css';

interface Drop {
  x: number;
  y: number;
  v: number;
  len: number;
  alpha: number;
  width: number;
}

interface Ripple {
  x: number;
  y: number;
  r: number;
  maxR: number;
  a: number;
  dr: number;
}

export default function AsmrClient() {
  const rainCvsRef = useRef<HTMLCanvasElement>(null);
  const rippleCvsRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [intensity, setIntensity] = useState(350);
  const [speed, setSpeed] = useState(11);
  const [ambience, setAmbience] = useState(50);
  const [sound, setSound] = useState(30);
  
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [ctrlVisible, setCtrlVisible] = useState(true);
  
  const gameData = useRef({
    W: 0,
    H: 0,
    drops: [] as Drop[],
    ripples: [] as Ripple[],
    lastTime: 0,
    frameId: 0,
    audioStarted: false
  });

  const getSpeed = useCallback(() => speed, [speed]);
  const getAmbience = useCallback(() => ambience / 100, [ambience]);
  const getIntensity = useCallback(() => intensity, [intensity]);
  
  const resize = useCallback(() => {
    const rain = rainCvsRef.current;
    const ripple = rippleCvsRef.current;
    if (!rain || !ripple) return;
    
    gameData.current.W = rain.width = ripple.width = window.innerWidth;
    gameData.current.H = rain.height = ripple.height = window.innerHeight;
  }, []);

  const makeDrop = useCallback(() => {
    const spd = getSpeed();
    const { W, H } = gameData.current;
    return {
      x: -W * 0.5 + Math.random() * (W * 1.5),
      y: -Math.random() * H * 0.5,
      v: spd * (0.6 + Math.random() * 0.8),
      len: spd * (1.2 + Math.random() * 1.4),
      alpha: 0.25 + Math.random() * 0.55,
      width: Math.random() < 0.3 ? 1.5 : 1
    };
  }, [getSpeed]);

  const makeRipple = useCallback((x: number, y: number) => {
    gameData.current.ripples.push({ 
      x, y, r: 2, maxR: 12 + Math.random() * 14, a: 0.6, dr: 0.5 + Math.random() * 0.5 
    });
  }, []);

  const seedDrops = useCallback((n: number) => {
    const { H } = gameData.current;
    gameData.current.drops = [];
    for (let i = 0; i < n; i++) {
      const d = makeDrop();
      d.y = Math.random() * H;
      gameData.current.drops.push(d);
    }
  }, [makeDrop]);

  // Handle initialization and resize
  useEffect(() => {
    resize();
    window.addEventListener('resize', resize);
    seedDrops(getIntensity());
    
    return () => {
      window.removeEventListener('resize', resize);
      if (gameData.current.frameId) cancelAnimationFrame(gameData.current.frameId);
    };
  }, [resize, seedDrops, getIntensity]);

  // Audio volume sync
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = sound / 100;
    }
  }, [sound]);

  const drawRain = useCallback((ctx: CanvasRenderingContext2D, dt: number) => {
    const spd = getSpeed();
    const ambi = getAmbience();
    const target = getIntensity();
    const { W, H } = gameData.current;
    
    const bg = `rgba(3, 10, 20, ${Math.max(0, 0.25 - ambi * 0.1)})`;

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    if (ambi > 0.1) {
      const grad = ctx.createRadialGradient(W / 2, H * 0.3, 0, W / 2, H * 0.3, W * 0.6);
      grad.addColorStop(0, `rgba(20, 60, 120, ${ambi * 0.12})`);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    }

    while (gameData.current.drops.length < target) gameData.current.drops.push(makeDrop());
    while (gameData.current.drops.length > target) gameData.current.drops.pop();

    ctx.save();
    gameData.current.drops.forEach(d => {
      d.v = spd * (0.6 + (d.v / Math.max(spd * 0.6, 0.1) * 0.1));
      d.y += d.v;
      d.x += d.v * 0.12;

      if (d.y > H + 10) {
        if (Math.random() < 0.25) makeRipple(d.x, H - 5);
        Object.assign(d, makeDrop());
      }

      const bright = 160 + Math.floor(ambi * 60);
      ctx.strokeStyle = `rgba(${bright - 30}, ${bright}, ${bright + 30}, ${d.alpha})`;
      ctx.lineWidth = d.width;
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x + d.len * 0.12, d.y + d.len);
      ctx.stroke();
    });
    ctx.restore();
  }, [getSpeed, getAmbience, getIntensity, makeDrop, makeRipple]);

  const drawRipples = useCallback((ctx: CanvasRenderingContext2D) => {
    const { W, H } = gameData.current;
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    
    gameData.current.ripples.forEach((r) => {
      r.r += r.dr;
      r.a -= 0.018;
      ctx.strokeStyle = `rgba(120, 200, 255, ${r.a})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(r.x, r.y, r.r, r.r * 0.38, 0, 0, Math.PI * 2);
      ctx.stroke();
      
      if (r.r > r.maxR * 0.4) {
        ctx.globalAlpha = Math.max(0, r.a * 0.4);
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, r.r * 0.55, r.r * 0.2, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    });
    
    gameData.current.ripples = gameData.current.ripples.filter(r => r.a > 0 && r.r < r.maxR);
    ctx.restore();
  }, []);

  const loop = useCallback((ts: number) => {
    if (!gameData.current.lastTime) gameData.current.lastTime = ts;
    const dt = (ts - gameData.current.lastTime) / 1000;
    gameData.current.lastTime = ts;

    if (running) {
      setElapsed(prev => prev + dt);
      
      const rainCtx = rainCvsRef.current?.getContext('2d');
      const rippleCtx = rippleCvsRef.current?.getContext('2d');
      
      if (rainCtx) drawRain(rainCtx, dt);
      if (rippleCtx) drawRipples(rippleCtx);
    }
    
    gameData.current.frameId = requestAnimationFrame(loop);
  }, [running, drawRain, drawRipples]);

  useEffect(() => {
    gameData.current.frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(gameData.current.frameId);
  }, [loop]);

  const togglePlay = () => {
    setRunning(r => !r);
    
    if (!running) {
      gameData.current.lastTime = 0;
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.log("Audio play blocked", e));
        gameData.current.audioStarted = true;
      }
    } else {
      if (audioRef.current) audioRef.current.pause();
    }
  };

  const handleDocumentClick = (e: React.MouseEvent) => {
    // Autoplay audio on first interaction if running
    if (!gameData.current.audioStarted && running && audioRef.current) {
      audioRef.current.play().catch(() => {});
      gameData.current.audioStarted = true;
    }

    // Toggle controls visibility
    const target = e.target as HTMLElement;
    if (target.closest(`.${styles.controls}`) || target.closest('a[href]')) {
      return;
    }
    setCtrlVisible(v => !v);
  };

  const fmtTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const ss = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${ss}`;
  };

  return (
    <div className={styles.container} onClick={handleDocumentClick}>
      <div className="fixed top-4 left-4 z-50 pointer-events-auto">
        <BackButton />
      </div>

      <audio 
        ref={audioRef} 
        src="https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg" 
        loop 
        preload="auto"
      />

      <canvas ref={rainCvsRef} className={styles.canvas} style={{ zIndex: 2 }} />
      <canvas ref={rippleCvsRef} className={styles.canvas} style={{ zIndex: 3 }} />
      
      <div className={styles.overlay}></div>
      <div className={styles.breathe}>BREATHE</div>

      <div className={styles.modeBadge}>🌧 Rain</div>
      <div className={styles.tapHint}>Click to hide controls</div>

      <div className={`${styles.controls} ${!ctrlVisible ? styles.hiddenUi : ''}`}>
        <div className={styles.ctrlGroup}>
          <div className={styles.ctrlLabel}>Intensity</div>
          <input 
            type="range" 
            className={styles.rangeInput}
            min="50" max="800" 
            value={intensity} 
            onChange={e => setIntensity(Number(e.target.value))} 
          />
        </div>
        <div className={styles.ctrlGroup}>
          <div className={styles.ctrlLabel}>Speed</div>
          <input 
            type="range" 
            className={styles.rangeInput}
            min="3" max="25" 
            value={speed} 
            onChange={e => setSpeed(Number(e.target.value))} 
          />
        </div>
        <div className={styles.ctrlGroup}>
          <div className={styles.ctrlLabel}>Ambience</div>
          <input 
            type="range" 
            className={styles.rangeInput}
            min="0" max="100" 
            value={ambience} 
            onChange={e => setAmbience(Number(e.target.value))} 
          />
        </div>
        <div className={styles.ctrlGroup}>
          <div className={styles.ctrlLabel}>Sound</div>
          <input 
            type="range" 
            className={styles.rangeInput}
            min="0" max="100" 
            value={sound} 
            onChange={e => setSound(Number(e.target.value))} 
          />
        </div>
        <div className={styles.ctrlGroup}>
          <div className={styles.ctrlLabel}>Timer</div>
          <div className={styles.timerDisplay}>{fmtTime(elapsed)}</div>
        </div>
        <button className={styles.ctrlBtn} onClick={togglePlay} title="Play/Pause">
          {running ? '⏸' : '▶'}
        </button>
      </div>
    </div>
  );
}
