'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import BackButton from '@/components/BackButton/BackButton';
import styles from './pong.module.css';

type Difficulty = 'easy' | 'medium' | 'hard' | 'insane';

const diffConfig: Record<Difficulty, number> = {
  easy: 0.045,
  medium: 0.08,
  hard: 0.12,
  insane: 0.18
};

export default function PongClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'result'>('menu');
  const [diff, setDiff] = useState<Difficulty>('medium');
  const [winTarget, setWinTarget] = useState<number>(7);
  const [paused, setPaused] = useState(false);
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);

  // Game data kept out of state to avoid re-renders during rAF loop
  const gameData = useRef({
    W: 0,
    H: 0,
    p1: { y: 0 },
    p2: { y: 0 },
    ball: { x: 0, y: 0, vx: 0, vy: 0 },
    rallyCount: 0,
    controlMode: 'mouse' as 'mouse' | 'touch',
    targetY: 0, // mouse/touch Y
    running: false,
    paused: false, // sync with state
    frameId: 0,
    aiSpeed: diffConfig['medium'],
    score1: 0,
    score2: 0,
    winTarget: 7
  });

  const PH = useCallback(() => gameData.current.H * 0.14, []);
  const PW = useCallback(() => gameData.current.W * 0.012, []);
  const BALL_R = useCallback(() => gameData.current.W * 0.008, []);

  const resize = useCallback(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    gameData.current.W = cvs.width = window.innerWidth;
    gameData.current.H = cvs.height = window.innerHeight;
    
    if (gameState === 'menu') {
      gameData.current.targetY = gameData.current.H / 2;
    }
  }, [gameState]);

  const drawPaddle = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) => {
    ctx.shadowBlur = 18;
    ctx.shadowColor = color;
    const g = ctx.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, color);
    g.addColorStop(1, color + '88');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, w / 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  };

  const draw = useCallback(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    if (!ctx) return;

    const { W, H, p1, p2, ball, rallyCount, score1, score2 } = gameData.current;

    ctx.fillStyle = '#010208';
    ctx.fillRect(0, 0, W, H);

    // Center line
    ctx.setLineDash([H * 0.02, H * 0.02]);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke();
    ctx.setLineDash([]);

    // Score
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.font = `900 ${H * 0.18}px Inter`;
    ctx.textAlign = 'center';
    ctx.fillText(score1.toString(), W / 2 - W * 0.15, H * 0.25);
    ctx.fillText(score2.toString(), W / 2 + W * 0.15, H * 0.25);
    ctx.textAlign = 'left';

    const pw = PW();
    const ph = PH();
    const br = BALL_R();

    // Paddles
    drawPaddle(ctx, 30, p1.y, pw, ph, '#22d3ee');
    drawPaddle(ctx, W - 30 - pw, p2.y, pw, ph, '#f472b6');

    // Ball
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#fff';
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(ball.x, ball.y, br, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;

    // Rally streak indicator
    if (rallyCount > 3) {
      ctx.fillStyle = `rgba(251,191,36,${Math.min(rallyCount / 12, 0.9)})`;
      ctx.font = `bold ${W * 0.02}px Inter`;
      ctx.textAlign = 'center';
      ctx.fillText(`🔥 Rally ×${rallyCount}`, W / 2, H * 0.94);
      ctx.textAlign = 'left';
    }
  }, [PH, PW, BALL_R]);

  const capSpeed = useCallback(() => {
    const { W, ball } = gameData.current;
    const maxSpd = W * 0.018;
    const spd = Math.hypot(ball.vx, ball.vy);
    if (spd > maxSpd) {
      ball.vx *= maxSpd / spd;
      ball.vy *= maxSpd / spd;
    }
  }, []);

  const resetBall = useCallback((dir = 0) => {
    const { W, H } = gameData.current;
    const ang = (Math.random() * 0.4 - 0.2) + (dir === 0 ? (Math.random() > 0.5 ? 0 : Math.PI) : (dir > 0 ? 0 : Math.PI));
    const spd = W * 0.007;
    gameData.current.ball = { x: W / 2, y: H / 2, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd };
    gameData.current.rallyCount = 0;
  }, []);

  const resetPaddles = useCallback(() => {
    const { H } = gameData.current;
    gameData.current.p1.y = H / 2 - PH() / 2;
    gameData.current.p2.y = H / 2 - PH() / 2;
  }, [PH]);

  const showResult = useCallback(() => {
    gameData.current.running = false;
    setP1Score(gameData.current.score1);
    setP2Score(gameData.current.score2);
    setGameState('result');
  }, []);

  const checkWin = useCallback(() => {
    const { score1, score2, winTarget } = gameData.current;
    if (score1 >= winTarget || score2 >= winTarget) {
      showResult();
      return true;
    }
    return false;
  }, [showResult]);

  const loop = useCallback(() => {
    gameData.current.frameId = requestAnimationFrame(loop);
    if (!gameData.current.running || gameData.current.paused) return;

    const { W, H, p1, p2, ball, targetY, aiSpeed } = gameData.current;
    const ph = PH();
    const pw = PW();
    const br = BALL_R();

    // Player paddle follows mouse/touch
    p1.y += (targetY - ph / 2 - p1.y) * 0.25;
    p1.y = Math.max(0, Math.min(H - ph, p1.y));

    // AI paddle
    const aiTarget = ball.y - ph / 2 + (Math.random() - 0.5) * H * (0.12 - aiSpeed * 0.2);
    p2.y += (aiTarget - p2.y) * aiSpeed;
    p2.y = Math.max(0, Math.min(H - ph, p2.y));

    // Ball
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Wall bounce
    if (ball.y - br < 0) { ball.y = br; ball.vy = Math.abs(ball.vy); }
    if (ball.y + br > H) { ball.y = H - br; ball.vy = -Math.abs(ball.vy); }

    // Paddle hits
    // P1 (left)
    if (ball.vx < 0 && ball.x - br < pw * 2 + 30 && ball.x - br > pw + 28 &&
        ball.y > p1.y && ball.y < p1.y + ph) {
      ball.vx = Math.abs(ball.vx) * 1.04;
      const rel = (ball.y - p1.y) / ph - 0.5;
      ball.vy = rel * W * 0.016 + ball.vy * 0.3;
      gameData.current.rallyCount++;
      capSpeed();
    }
    // P2 (right)
    if (ball.vx > 0 && ball.x + br > W - pw * 2 - 30 && ball.x + br < W - pw - 28 &&
        ball.y > p2.y && ball.y < p2.y + ph) {
      ball.vx = -Math.abs(ball.vx) * 1.04;
      const rel = (ball.y - p2.y) / ph - 0.5;
      ball.vy = rel * W * 0.016 + ball.vy * 0.3;
      gameData.current.rallyCount++;
      capSpeed();
    }

    // Scoring
    if (ball.x < 0) {
      gameData.current.score2++;
      if (checkWin()) return;
      resetBall(1);
    }
    if (ball.x > W) {
      gameData.current.score1++;
      if (checkWin()) return;
      resetBall(-1);
    }

    draw();
  }, [PH, PW, BALL_R, capSpeed, resetBall, checkWin, draw]);

  const startGame = useCallback(() => {
    setGameState('playing');
    setPaused(false);
    gameData.current.score1 = 0;
    gameData.current.score2 = 0;
    gameData.current.rallyCount = 0;
    gameData.current.running = true;
    gameData.current.paused = false;
    gameData.current.aiSpeed = diffConfig[diff];
    gameData.current.winTarget = winTarget;
    
    resetBall();
    resetPaddles();
    
    if (gameData.current.frameId) cancelAnimationFrame(gameData.current.frameId);
    gameData.current.frameId = requestAnimationFrame(loop);
  }, [diff, winTarget, resetBall, resetPaddles, loop]);

  const showMenu = () => {
    gameData.current.running = false;
    setGameState('menu');
  };

  const pauseToggle = () => {
    if (!gameData.current.running) return;
    const isPaused = !gameData.current.paused;
    gameData.current.paused = isPaused;
    setPaused(isPaused);
  };

  useEffect(() => {
    resize();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
    };
  }, [resize]);

  useEffect(() => {
    return () => {
      if (gameData.current.frameId) cancelAnimationFrame(gameData.current.frameId);
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      gameData.current.targetY = e.clientY;
      gameData.current.controlMode = 'mouse';
    };
    const handleTouchMove = (e: TouchEvent) => {
      gameData.current.targetY = e.touches[0].clientY;
      gameData.current.controlMode = 'touch';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return (
    <div className={styles.container}>
      <div className="fixed top-4 left-4 z-50 pointer-events-auto">
        <BackButton />
      </div>

      <div className={styles.settings}>
        <div className={styles.hudPill} onClick={pauseToggle}>
          {paused ? '▶ Resume' : '⏸ Pause'}
        </div>
        <div className={styles.hudPill} onClick={showMenu}>
          ☰ Menu
        </div>
      </div>

      <canvas ref={canvasRef} className={styles.canvas} />

      {gameState === 'menu' && (
        <div className={styles.screen}>
          <div className={styles.sbox}>
            <div className={styles.sTitle}>🏓 Neon Pong</div>
            <div className={styles.sSub}>
              Play against a reactive AI paddle.<br />
              First to <b>{winTarget}</b> points wins.
            </div>
            
            <div style={{ fontSize: '.7rem', color: 'rgba(148,163,184,0.45)', marginBottom: '8px', letterSpacing: '.1em', textTransform: 'uppercase' }}>Difficulty</div>
            <div className={styles.diffRow}>
              {(['easy', 'medium', 'hard', 'insane'] as Difficulty[]).map(d => (
                <button 
                  key={d} 
                  className={`${styles.dBtn} ${diff === d ? styles.dBtnActive : ''}`} 
                  onClick={() => setDiff(d)}
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
            
            <div style={{ fontSize: '.7rem', color: 'rgba(148,163,184,0.45)', marginBottom: '8px', letterSpacing: '.1em', textTransform: 'uppercase' }}>First to</div>
            <div className={styles.diffRow}>
              {[5, 7, 11].map(n => (
                <button 
                  key={n} 
                  className={`${styles.dBtn} ${winTarget === n ? styles.dBtnActive : ''}`} 
                  onClick={() => setWinTarget(n)}
                >
                  {n}
                </button>
              ))}
            </div>
            
            <button className={styles.sBtn} onClick={startGame}>Serve!</button>
          </div>
        </div>
      )}

      {gameState === 'result' && (
        <div className={styles.screen}>
          <div className={styles.sbox}>
            <div className={styles.sTitle} style={{ color: p1Score >= winTarget ? '#22d3ee' : '#f87171' }}>
              {p1Score >= winTarget ? '🏆 You Win!' : '💀 You Lose'}
            </div>
            
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', margin: '16px 0' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '.65rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(148,163,184,0.45)', marginBottom: '4px' }}>You</div>
                <div className={styles.scoreLarge}>{p1Score}</div>
              </div>
              <div style={{ fontSize: '2rem', alignSelf: 'center', color: 'rgba(148,163,184,0.3)' }}>:</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '.65rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(148,163,184,0.45)', marginBottom: '4px' }}>AI</div>
                <div className={styles.scoreLarge}>{p2Score}</div>
              </div>
            </div>
            
            <button className={styles.sBtn} onClick={startGame}>Rematch</button>
            <button className={`${styles.sBtn} ${styles.secondary}`} onClick={showMenu}>Menu</button>
          </div>
        </div>
      )}
    </div>
  );
}
