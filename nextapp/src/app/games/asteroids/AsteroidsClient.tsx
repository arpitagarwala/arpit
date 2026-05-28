'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import BackButton from '@/components/BackButton/BackButton';
import styles from './asteroids.module.css';

interface Point { x: number; y: number; }
interface Bullet extends Point { vx: number; vy: number; life: number; }
interface Asteroid extends Point { vx: number; vy: number; r: number; size: number; angle: number; spin: number; verts: Point[]; }
interface Particle extends Point { vx: number; vy: number; life: number; color: string; }
interface Star { x: number; y: number; r: number; a: number; }

export default function AsteroidsClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [lives, setLives] = useState(3);
  const [wave, setWave] = useState(1);

  const gameData = useRef({
    W: 0,
    H: 0,
    ship: { x: 0, y: 0, angle: -Math.PI / 2, vx: 0, vy: 0, thrust: false },
    bullets: [] as Bullet[],
    asteroids: [] as Asteroid[],
    particles: [] as Particle[],
    stars: [] as Star[],
    score: 0,
    lives: 3,
    wave: 1,
    running: false,
    invincible: 0,
    lastFire: 0,
    frameId: 0,
    keys: {} as Record<string, boolean>
  });

  const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

  const buildVerts = (r: number) => {
    const n = 8 + Math.floor(Math.random() * 5);
    return Array.from({ length: n }, (_, i) => {
      const ang = (i / n) * Math.PI * 2;
      const rr = r * (0.7 + Math.random() * 0.5);
      return { x: Math.cos(ang) * rr, y: Math.sin(ang) * rr };
    });
  };

  const spawnWave = useCallback((n: number) => {
    const { W, H, ship, asteroids } = gameData.current;
    const count = 3 + n;
    for (let i = 0; i < count; i++) {
      let a: any = {};
      do {
        a = { x: Math.random() * W, y: Math.random() * H };
      } while (dist(a, ship) < 150);
      a.vx = (Math.random() - 0.5) * (1.5 + n * 0.2);
      a.vy = (Math.random() - 0.5) * (1.5 + n * 0.2);
      a.r = 42 + Math.random() * 18;
      a.size = 3;
      a.angle = 0;
      a.spin = (Math.random() - 0.5) * 0.04;
      a.verts = buildVerts(a.r);
      asteroids.push(a as Asteroid);
    }
  }, []);

  const resize = useCallback(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    gameData.current.W = cvs.width = window.innerWidth;
    gameData.current.H = cvs.height = window.innerHeight;
  }, []);

  const drawStars = (ctx: CanvasRenderingContext2D, W: number, H: number) => {
    gameData.current.stars.forEach(s => {
      ctx.fillStyle = `rgba(200,220,255,${s.a})`;
      ctx.beginPath(); ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2); ctx.fill();
    });
  };

  const drawParticles = (ctx: CanvasRenderingContext2D) => {
    gameData.current.particles.forEach(p => {
      ctx.globalAlpha = Math.max(0, p.life / 60);
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;
  };

  const drawBullets = (ctx: CanvasRenderingContext2D) => {
    gameData.current.bullets.forEach(b => {
      ctx.shadowBlur = 12; ctx.shadowColor = '#60a5fa';
      ctx.fillStyle = '#93c5fd';
      ctx.beginPath(); ctx.arc(b.x, b.y, 3, 0, Math.PI * 2); ctx.fill();
    });
    ctx.shadowBlur = 0;
  };

  const drawAsteroids = (ctx: CanvasRenderingContext2D) => {
    gameData.current.asteroids.forEach(a => {
      ctx.save();
      ctx.translate(a.x, a.y); ctx.rotate(a.angle);
      ctx.shadowBlur = 8; ctx.shadowColor = 'rgba(200,220,255,0.4)';
      ctx.strokeStyle = `rgba(180,200,255,0.75)`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      a.verts.forEach((v, i) => i === 0 ? ctx.moveTo(v.x, v.y) : ctx.lineTo(v.x, v.y));
      ctx.closePath(); ctx.stroke();
      ctx.restore();
    });
    ctx.shadowBlur = 0;
  };

  const drawShip = (ctx: CanvasRenderingContext2D, shield: boolean) => {
    const { x, y, angle, thrust } = gameData.current.ship;
    const invincible = gameData.current.invincible;
    const blink = invincible > 0 && Math.floor(invincible / 6) % 2 === 0;
    if (blink) return;

    ctx.save();
    ctx.translate(x, y); ctx.rotate(angle);

    if (thrust) {
      ctx.beginPath();
      ctx.moveTo(-14, -5); ctx.lineTo(-14 - Math.random() * 14, 0); ctx.lineTo(-14, 5);
      ctx.strokeStyle = 'rgba(255,140,0,0.9)'; ctx.lineWidth = 2.5; ctx.lineJoin = 'round';
      ctx.shadowBlur = 15; ctx.shadowColor = '#f97316';
      ctx.stroke(); ctx.shadowBlur = 0;
    }

    ctx.shadowBlur = 14; ctx.shadowColor = '#60a5fa';
    ctx.strokeStyle = '#93c5fd'; ctx.lineWidth = 2; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(20, 0); ctx.lineTo(-12, -11); ctx.lineTo(-6, 0); ctx.lineTo(-12, 11); ctx.closePath(); ctx.stroke();

    if (shield) {
      ctx.shadowBlur = 20; ctx.shadowColor = '#34d399';
      ctx.strokeStyle = 'rgba(52,211,153,0.5)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, 24, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.shadowBlur = 0;
    ctx.restore();
  };

  const explode = (x: number, y: number, r: number, n: number) => {
    for (let i = 0; i < n; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = Math.random() * 4 + 1;
      gameData.current.particles.push({
        x, y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        life: 30 + Math.random() * 30,
        color: `hsl(${30 + Math.random() * 60},100%,65%)`
      });
    }
  };

  const splitAst = (a: Asteroid): Asteroid => {
    const small: any = {
      x: a.x + (Math.random() - 0.5) * a.r,
      y: a.y + (Math.random() - 0.5) * a.r,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      r: a.r * 0.52,
      size: a.size - 1,
      angle: 0,
      spin: (Math.random() - 0.5) * 0.07
    };
    small.verts = buildVerts(small.r);
    return small as Asteroid;
  };

  const gameOver = useCallback(() => {
    gameData.current.running = false;
    setGameState('gameover');
  }, []);

  const loop = useCallback((ts: number) => {
    gameData.current.frameId = requestAnimationFrame(loop);
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    if (!ctx) return;

    const { W, H, keys, ship } = gameData.current;

    ctx.fillStyle = 'rgba(1,2,8,0.25)';
    ctx.fillRect(0, 0, W, H);

    if (!gameData.current.running) {
      drawStars(ctx, W, H);
      drawAsteroids(ctx);
      return;
    }

    const ROTATE = 0.05, THRUST = 0.12, MAX_SPD = 6, FRICTION = 0.99;

    // Ship controls
    if (keys['ArrowLeft'] || keys['a']) ship.angle -= ROTATE;
    if (keys['ArrowRight'] || keys['d']) ship.angle += ROTATE;
    ship.thrust = !!(keys['ArrowUp'] || keys['w']);
    if (ship.thrust) {
      ship.vx += Math.cos(ship.angle) * THRUST;
      ship.vy += Math.sin(ship.angle) * THRUST;
    }
    ship.vx *= FRICTION;
    ship.vy *= FRICTION;
    const spd = Math.hypot(ship.vx, ship.vy);
    if (spd > MAX_SPD) { ship.vx *= MAX_SPD / spd; ship.vy *= MAX_SPD / spd; }
    ship.x = (ship.x + ship.vx + W) % W;
    ship.y = (ship.y + ship.vy + H) % H;

    // Fire
    if ((keys[' '] || keys['Enter']) && ts - gameData.current.lastFire > 180) {
      gameData.current.lastFire = ts;
      gameData.current.bullets.push({
        x: ship.x + Math.cos(ship.angle) * 20,
        y: ship.y + Math.sin(ship.angle) * 20,
        vx: Math.cos(ship.angle) * 18 + ship.vx,
        vy: Math.sin(ship.angle) * 18 + ship.vy,
        life: 45
      });
    }

    // Shield
    const shield = !!(keys['s'] || keys['S']) && gameData.current.invincible <= 0;

    // Bullets
    gameData.current.bullets = gameData.current.bullets.filter(b => {
      b.x = (b.x + b.vx + W) % W;
      b.y = (b.y + b.vy + H) % H;
      b.life--;
      return b.life > 0;
    });

    // Asteroids
    gameData.current.asteroids.forEach(a => {
      a.angle += a.spin;
      a.x = (a.x + a.vx + W) % W;
      a.y = (a.y + a.vy + H) % H;
    });

    // Bullet-asteroid collisions
    let toAdd: Asteroid[] = [];
    let toRemove = new Set<number>();
    let bulletsToRemove = new Set<number>();

    gameData.current.bullets.forEach((b, bi) => {
      gameData.current.asteroids.forEach((a, ai) => {
        if (bulletsToRemove.has(bi) || toRemove.has(ai)) return;
        if (dist(b, a) < a.r) {
          bulletsToRemove.add(bi);
          toRemove.add(ai);
          explode(a.x, a.y, a.r, 12);
          const pts = a.size === 3 ? 20 : a.size === 2 ? 50 : 100;
          gameData.current.score += pts;
          setScore(gameData.current.score);

          setBest(prev => {
            const newBest = Math.max(prev, gameData.current.score);
            localStorage.setItem('ast-best', newBest.toString());
            return newBest;
          });

          if (a.size > 1) {
            toAdd.push(splitAst(a));
            toAdd.push(splitAst(a));
          }
        }
      });
    });

    gameData.current.bullets = gameData.current.bullets.filter((_, i) => !bulletsToRemove.has(i));
    gameData.current.asteroids = gameData.current.asteroids.filter((_, i) => !toRemove.has(i)).concat(toAdd);
    
    if (gameData.current.asteroids.length === 0) {
      gameData.current.wave++;
      setWave(gameData.current.wave);
      spawnWave(gameData.current.wave);
    }

    // Ship-asteroid collision
    if (gameData.current.invincible <= 0 && !shield) {
      gameData.current.asteroids.forEach(a => {
        if (dist(ship, a) < a.r * 0.8 + 10) {
          gameData.current.lives--;
          setLives(gameData.current.lives);
          gameData.current.invincible = 160;
          explode(ship.x, ship.y, 20, 20);
          if (gameData.current.lives <= 0) {
            gameOver();
          }
        }
      });
    }
    if (gameData.current.invincible > 0) gameData.current.invincible--;

    // Particles
    gameData.current.particles = gameData.current.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      return p.life > 0;
    });

    drawStars(ctx, W, H);
    drawParticles(ctx);
    drawBullets(ctx);
    drawAsteroids(ctx);
    drawShip(ctx, shield);
  }, [gameOver, spawnWave]);

  useEffect(() => {
    setBest(parseInt(localStorage.getItem('ast-best') || '0'));
    
    // Init stars
    gameData.current.stars = Array.from({ length: 180 }, () => ({
      x: Math.random(), y: Math.random(), r: Math.random() * 1.4 + 0.3, a: Math.random() * 0.7 + 0.3
    }));

    resize();
    window.addEventListener('resize', resize);
    
    // Initialize background drawing
    gameData.current.frameId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', resize);
      if (gameData.current.frameId) cancelAnimationFrame(gameData.current.frameId);
    };
  }, [resize, loop]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => { gameData.current.keys[e.key] = true; };
    const up = (e: KeyboardEvent) => { gameData.current.keys[e.key] = false; };
    document.addEventListener('keydown', down);
    document.addEventListener('keyup', up);
    return () => {
      document.removeEventListener('keydown', down);
      document.removeEventListener('keyup', up);
    };
  }, []);

  const startGame = () => {
    setGameState('playing');
    const { W, H } = gameData.current;
    gameData.current.ship = { x: W / 2, y: H / 2, angle: -Math.PI / 2, vx: 0, vy: 0, thrust: false };
    gameData.current.bullets = [];
    gameData.current.asteroids = [];
    gameData.current.particles = [];
    gameData.current.score = 0;
    gameData.current.lives = 3;
    gameData.current.wave = 1;
    gameData.current.running = true;
    gameData.current.invincible = 0;
    gameData.current.keys = {}; // Reset keys

    setScore(0);
    setLives(3);
    setWave(1);

    spawnWave(1);
  };

  return (
    <div className={styles.container}>
      <div className="fixed top-4 left-4 z-50 pointer-events-auto">
        <BackButton />
      </div>

      <canvas ref={canvasRef} className={styles.canvas} />

      <div className={styles.hud}>
        <div className={styles.hudBox}>
          <div className={styles.hudLabel}>Score</div>
          <div className={styles.hudVal}>{score}</div>
        </div>
        <div className={`${styles.hudBox} ${styles.livesBox}`}>
          <div className={styles.hudLabel} style={{ marginBottom: 0 }}>Lives</div>
          {Array.from({ length: Math.max(0, lives) }, (_, i) => (
            <span key={i} className={styles.lifeIcon}>🚀</span>
          ))}
        </div>
        <div className={styles.hudBox}>
          <div className={styles.hudLabel}>Best</div>
          <div className={styles.hudVal}>{best}</div>
        </div>
      </div>

      <div className={styles.waveBadge}>Wave <span>{wave}</span></div>

      {gameState === 'start' && (
        <div className={styles.screen}>
          <div className={styles.screenBox}>
            <div className={styles.screenTitle}>☄️ Void Asteroids</div>
            <div className={styles.screenSub}>
              Navigate through the void. Destroy asteroids.<br />
              Break big ones into smaller fragments.
            </div>
            <button className={styles.btnStart} onClick={startGame}>Launch</button>
            <div className={styles.ctrlTable}>
              <div className={styles.ctrlRow}><span className={styles.ctrlKey}>←→</span> Rotate</div>
              <div className={styles.ctrlRow}><span className={styles.ctrlKey}>↑</span> Thrust</div>
              <div className={styles.ctrlRow}><span className={styles.ctrlKey}>Space</span> Fire</div>
              <div className={styles.ctrlRow}><span className={styles.ctrlKey}>S</span> Shield</div>
            </div>
          </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className={styles.screen}>
          <div className={styles.screenBox}>
            <div className={styles.screenTitle}>💀 Ship Lost</div>
            <div className={styles.scoreLabel}>Score</div>
            <div className={styles.screenScore}>{score}</div>
            <div className={styles.scoreLabel} style={{ marginBottom: '6px' }}>Best</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#60a5fa', marginBottom: '20px' }}>{best}</div>
            <button className={styles.btnStart} onClick={startGame}>Try Again</button>
          </div>
        </div>
      )}
    </div>
  );
}
