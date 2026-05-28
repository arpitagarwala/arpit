'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import BackButton from '@/components/BackButton/BackButton';
import styles from './snake.module.css';

const CELL = 22;

interface Point {
  x: number;
  y: number;
}

export default function SnakeClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');

  // Game internals (kept out of state to avoid re-renders during rAF loop)
  const gameData = useRef({
    cols: 0,
    rows: 0,
    snake: [] as Point[],
    dir: { x: 1, y: 0 },
    nextDir: { x: 1, y: 0 },
    food: { x: 0, y: 0 },
    score: 0,
    level: 1,
    running: false,
    lastTick: 0,
    frameId: 0
  });

  const getInterval = (lvl: number) => {
    if (lvl <= 1) return 160;
    if (lvl <= 3) return 130;
    if (lvl <= 6) return 105;
    if (lvl <= 10) return 85;
    return 70;
  };

  const spawnFood = useCallback((cols: number, rows: number, snake: Point[]) => {
    let pos: Point;
    do {
      pos = { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) };
    } while (snake.some(s => s.x === pos.x && s.y === pos.y));
    return pos;
  }, []);

  const sizeCvs = useCallback(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const avail = Math.min(window.innerWidth - 32, window.innerHeight - 120, 660);
    const sz = Math.floor(avail / CELL) * CELL;
    cvs.width = sz;
    cvs.height = sz;
    gameData.current.cols = sz / CELL;
    gameData.current.rows = sz / CELL;
  }, []);

  const drawIdle = useCallback(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#050812';
    ctx.fillRect(0, 0, cvs.width, cvs.height);
  }, []);

  const draw = useCallback(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    if (!ctx) return;
    const { snake, food, cols, rows, dir } = gameData.current;
    const sz = cvs.width;

    ctx.fillStyle = '#050812';
    ctx.fillRect(0, 0, sz, sz);

    // Grid (faint)
    ctx.strokeStyle = 'rgba(34,211,238,0.04)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= Math.max(cols, rows); i++) {
      ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, sz); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(sz, i * CELL); ctx.stroke();
    }

    // Food — glowing orb
    const fx = food.x * CELL + CELL / 2;
    const fy = food.y * CELL + CELL / 2;
    const foodGrad = ctx.createRadialGradient(fx, fy, 1, fx, fy, CELL * 0.45);
    foodGrad.addColorStop(0, '#fff');
    foodGrad.addColorStop(0.3, '#f0abfc');
    foodGrad.addColorStop(1, 'rgba(192,38,211,0)');
    ctx.shadowBlur = 18;
    ctx.shadowColor = '#d946ef';
    ctx.fillStyle = foodGrad;
    ctx.beginPath(); ctx.arc(fx, fy, CELL * 0.42, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;

    // Snake
    snake.forEach((seg, i) => {
      const t = i / snake.length;
      const hue = (160 + t * 60) % 360;
      const cx = seg.x * CELL + CELL / 2;
      const cy = seg.y * CELL + CELL / 2;
      
      ctx.shadowBlur = i === 0 ? 20 : 10;
      ctx.shadowColor = `hsl(${hue}, 100%, 65%)`;
      ctx.fillStyle = `hsl(${hue}, 100%, ${i === 0 ? 70 : 60}%)`;
      ctx.beginPath();
      ctx.roundRect(seg.x * CELL + 2, seg.y * CELL + 2, CELL - 4, CELL - 4, 5);
      ctx.fill();

      // Eye on head
      if (i === 0) {
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff';
        const eyeOff = { x: dir.y * 4, y: dir.x * -4 };
        [[cx + dir.x * 4 + eyeOff.x - 2, cy + dir.y * 4 + eyeOff.y - 2],
         [cx + dir.x * 4 - eyeOff.x - 2, cy + dir.y * 4 - eyeOff.y - 2]].forEach(([ex, ey]) => {
          ctx.beginPath(); ctx.arc(ex, ey, 2.5, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#050812';
          ctx.beginPath(); ctx.arc(ex + dir.x, ey + dir.y, 1.2, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#fff';
        });
      }
    });
    ctx.shadowBlur = 0;
  }, []);

  const gameOver = useCallback(() => {
    gameData.current.running = false;
    setGameState('gameover');
    
    // Update Best Score immediately
    setBest(prev => {
      const b = Math.max(prev, gameData.current.score);
      localStorage.setItem('snake-best', b.toString());
      return b;
    });
  }, []);

  const update = useCallback(() => {
    const state = gameData.current;
    state.dir = { ...state.nextDir };
    const head = { x: state.snake[0].x + state.dir.x, y: state.snake[0].y + state.dir.y };

    // Wall wrap
    head.x = (head.x + state.cols) % state.cols;
    head.y = (head.y + state.rows) % state.rows;

    // Self collision
    if (state.snake.slice(1).some(s => s.x === head.x && s.y === head.y)) {
      gameOver();
      return;
    }

    state.snake.unshift(head);
    if (head.x === state.food.x && head.y === state.food.y) {
      state.score += state.level * 10;
      state.level = Math.floor(state.score / 80) + 1;
      state.food = spawnFood(state.cols, state.rows, state.snake);
      
      // Sync React state for HUD
      setScore(state.score);
      setLevel(state.level);
    } else {
      state.snake.pop();
    }
  }, [gameOver, spawnFood]);

  const loop = useCallback((ts = 0) => {
    gameData.current.frameId = requestAnimationFrame(loop);
    if (!gameData.current.running) return;
    if (ts - gameData.current.lastTick < getInterval(gameData.current.level)) return;
    
    gameData.current.lastTick = ts;
    update();
    draw();
  }, [draw, update]);

  const startGame = useCallback(() => {
    sizeCvs();
    const { cols, rows } = gameData.current;
    const mid = Math.floor(cols / 2);
    
    gameData.current.snake = [{ x: mid, y: mid }, { x: mid - 1, y: mid }, { x: mid - 2, y: mid }];
    gameData.current.dir = { x: 1, y: 0 };
    gameData.current.nextDir = { x: 1, y: 0 };
    gameData.current.food = spawnFood(cols, rows, gameData.current.snake);
    gameData.current.score = 0;
    gameData.current.level = 1;
    gameData.current.lastTick = 0;
    gameData.current.running = true;

    setScore(0);
    setLevel(1);
    setGameState('playing');

    if (gameData.current.frameId) cancelAnimationFrame(gameData.current.frameId);
    loop();
  }, [sizeCvs, spawnFood, loop]);

  // Init
  useEffect(() => {
    setBest(parseInt(localStorage.getItem('snake-best') || '0'));
    sizeCvs();
    drawIdle();
    
    const onResize = () => {
      sizeCvs();
      if (!gameData.current.running) drawIdle();
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      if (gameData.current.frameId) cancelAnimationFrame(gameData.current.frameId);
    };
  }, [sizeCvs, drawIdle]);

  // Input bindings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const DIRS: Record<string, Point> = {
        ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 }
      };
      const d = DIRS[e.key] || DIRS[e.key.toLowerCase()];
      const dir = gameData.current.dir;
      if (d && (d.x !== -dir.x || d.y !== -dir.y)) {
        gameData.current.nextDir = d;
      }
      if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Swipe logic
  const touchStart = useRef<{ x: number, y: number } | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!gameData.current.running || !touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    if (Math.abs(dx) < 15 && Math.abs(dy) < 15) return;
    
    const d = Math.abs(dx) > Math.abs(dy) 
      ? (dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 }) 
      : (dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 });
      
    const dir = gameData.current.dir;
    if (d.x !== -dir.x || d.y !== -dir.y) {
      gameData.current.nextDir = d;
    }
    touchStart.current = null;
  };

  const setDir = (d: Point) => {
    const dir = gameData.current.dir;
    if (d.x !== -dir.x || d.y !== -dir.y) gameData.current.nextDir = d;
  };

  return (
    <div 
      className={styles.container}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="fixed top-4 left-4 z-50">
        <BackButton />
      </div>

      <div className={styles.hud}>
        <div className={styles.hudBox}>
          <div className={styles.hudLabel}>Score</div>
          <div className={styles.hudVal}>{score}</div>
        </div>
        <div className={styles.hudBox}>
          <div className={styles.hudLabel}>Best</div>
          <div className={styles.hudVal}>{best}</div>
        </div>
        <div className={styles.hudBox}>
          <div className={styles.hudLabel}>Level</div>
          <div className={styles.hudVal}>{level}</div>
        </div>
      </div>

      <canvas ref={canvasRef} className={styles.canvas} />

      <div className={styles.dpad}>
        <div />
        <div className={styles.dp} onClick={() => setDir({ x: 0, y: -1 })}>↑</div>
        <div />
        <div className={styles.dp} onClick={() => setDir({ x: -1, y: 0 })}>←</div>
        <div />
        <div className={styles.dp} onClick={() => setDir({ x: 1, y: 0 })}>→</div>
        <div />
        <div className={styles.dp} onClick={() => setDir({ x: 0, y: 1 })}>↓</div>
        <div />
      </div>

      {gameState === 'start' && (
        <div className={styles.screen}>
          <div className={styles.screenBox}>
            <div className={styles.screenTitle}>🐍 Neon Snake</div>
            <div className={styles.screenSub}>
              Eat the glowing pellets. Don't hit yourself.<br />
              Speed increases as you score.
            </div>
            <button className={styles.btnStart} onClick={startGame}>Start Game</button>
            <div className={styles.ctrlsHint}>Arrow keys / WASD / Swipe to move</div>
          </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className={styles.screen}>
          <div className={styles.screenBox}>
            <div className={styles.screenTitle}>💀 Game Over</div>
            <div className={styles.scoreLabel}>Score</div>
            <div className={styles.screenScore}>{score}</div>
            <div className={styles.scoreLabel} style={{ marginBottom: '4px' }}>Best</div>
            <div className={styles.hudVal} style={{ fontSize: '1.5rem', color: '#22d3ee', marginBottom: '20px' }}>{best}</div>
            <button className={styles.btnStart} onClick={startGame}>Play Again</button>
          </div>
        </div>
      )}
    </div>
  );
}
