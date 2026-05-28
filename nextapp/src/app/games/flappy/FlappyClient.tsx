'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import BackButton from '@/components/BackButton/BackButton';
import styles from './flappy.module.css';

interface Pipe {
  x: number;
  y: number;
  passed: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

export default function FlappyClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);

  const gameData = useRef({
    W: 0,
    H: 0,
    bird: { x: 0, y: 0, vy: 0, angle: 0 },
    pipes: [] as Pipe[],
    particles: [] as Particle[],
    score: 0,
    best: 0,
    frameN: 0,
    state: 'idle' as 'idle' | 'play' | 'dead',
    frameId: 0
  });

  const GAP = useCallback(() => gameData.current.H * 0.24, []);
  const PIPE_W = useCallback(() => gameData.current.W * 0.12, []);
  const BIRD_R = useCallback(() => gameData.current.W * 0.05, []);
  const PIPE_SPD = useCallback(() => gameData.current.W * 0.006 + gameData.current.score * 0.004, []);

  const resize = useCallback(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const sz = Math.min(window.innerWidth - 32, window.innerHeight - 100, 500);
    gameData.current.W = cvs.width = Math.min(sz * 0.75, 360);
    gameData.current.H = cvs.height = sz;
  }, []);

  const drawBg = (ctx: CanvasRenderingContext2D, W: number, H: number) => {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#050812');
    grad.addColorStop(1, '#0a1628');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    
    // Stars
    ctx.fillStyle = 'rgba(200,220,255,0.4)';
    for (let i = 0; i < 40; i++) {
      ctx.beginPath();
      ctx.arc((i * 137.5) % W, (i * 93.1) % H, 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Ground
    ctx.fillStyle = 'rgba(34,211,238,0.07)';
    ctx.fillRect(0, H - 4, W, 4);
  };

  const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number | number[]) => {
    let radii = Array.isArray(r) ? r : [r, r, r, r];
    ctx.beginPath();
    ctx.moveTo(x + radii[0], y);
    ctx.lineTo(x + w - radii[1], y);       ctx.arcTo(x + w, y, x + w, y + radii[1], radii[1]);
    ctx.lineTo(x + w, y + h - radii[2]);   ctx.arcTo(x + w, y + h, x + w - radii[2], y + h, radii[2]);
    ctx.lineTo(x + radii[3], y + h);       ctx.arcTo(x, y + h, x, y + h - radii[3], radii[3]);
    ctx.lineTo(x, y + radii[0]);           ctx.arcTo(x, y, x + radii[0], y, radii[0]);
    ctx.closePath();
  };

  const drawPipeAt = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    const { H } = gameData.current;
    const g = GAP();
    const PW = PIPE_W();
    
    // Top pipe
    const topGrad = ctx.createLinearGradient(x, 0, x + PW, 0);
    topGrad.addColorStop(0, '#0e4f5c');
    topGrad.addColorStop(1, '#155e75');
    ctx.fillStyle = topGrad;
    roundRect(ctx, x, 0, PW, y - g / 2, [0, 0, 8, 8]);
    ctx.fill();
    
    // Top cap
    ctx.fillStyle = '#22d3ee';
    ctx.globalAlpha *= 0.8;
    roundRect(ctx, x - 3, y - g / 2 - 14, PW + 6, 14, [0, 0, 6, 6]);
    ctx.fill();
    ctx.globalAlpha = 1;
    
    // Bottom pipe
    const botGrad = ctx.createLinearGradient(x, 0, x + PW, 0);
    botGrad.addColorStop(0, '#0e4f5c');
    botGrad.addColorStop(1, '#155e75');
    ctx.fillStyle = botGrad;
    roundRect(ctx, x, y + g / 2, PW, H - (y + g / 2), [8, 8, 0, 0]);
    ctx.fill();
    
    // Bottom cap
    ctx.fillStyle = '#22d3ee';
    ctx.globalAlpha *= 0.8;
    roundRect(ctx, x - 3, y + g / 2, PW + 6, 14, [6, 6, 0, 0]);
    ctx.fill();
    ctx.globalAlpha = 1;
  };

  const drawBird = (ctx: CanvasRenderingContext2D, x: number, y: number, angle: number) => {
    const BR = BIRD_R();
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    
    ctx.shadowBlur = 16;
    ctx.shadowColor = '#22d3ee';
    
    const bg = ctx.createRadialGradient(-BR * 0.3, -BR * 0.3, 1, 0, 0, BR);
    bg.addColorStop(0, '#67e8f9');
    bg.addColorStop(1, '#0891b2');
    ctx.fillStyle = bg;
    roundRect(ctx, -BR, -BR, BR * 2, BR * 2, BR * 0.4);
    ctx.fill();
    
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(BR * 0.3, -BR * 0.25, BR * 0.28, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0c4a6e';
    ctx.beginPath(); ctx.arc(BR * 0.38, -BR * 0.22, BR * 0.14, 0, Math.PI * 2); ctx.fill();
    
    ctx.restore();
  };

  const drawIdle = useCallback(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    if (!ctx) return;
    const { W, H } = gameData.current;

    ctx.clearRect(0, 0, W, H);
    drawBg(ctx, W, H);
    
    ctx.globalAlpha = 0.3;
    drawPipeAt(ctx, W * 0.6, H * 0.35);
    ctx.globalAlpha = 1;
    
    drawBird(ctx, W * 0.25, H * 0.5, 0);
    
    ctx.fillStyle = 'rgba(34,211,238,0.9)';
    ctx.font = `bold ${W * 0.07}px Inter`;
    ctx.textAlign = 'center';
    ctx.fillText('Flappy Block', W / 2, H * 0.42);
    ctx.fillStyle = 'rgba(148,163,184,0.6)';
    ctx.font = `${W * 0.04}px Inter`;
    ctx.fillText('Tap / Space to start', W / 2, H * 0.5);
    ctx.textAlign = 'left';
  }, [drawPipeAt, drawBird]);

  const initGame = useCallback(() => {
    if (gameData.current.frameId) cancelAnimationFrame(gameData.current.frameId);
    
    const { W, H } = gameData.current;
    gameData.current.bird = { x: W * 0.25, y: H * 0.5, vy: 0, angle: 0 };
    gameData.current.pipes = [];
    gameData.current.particles = [];
    gameData.current.score = 0;
    gameData.current.frameN = 0;
    gameData.current.state = 'idle';
    
    setScore(0);
    drawIdle();
  }, [drawIdle]);

  const draw = useCallback(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    if (!ctx) return;

    const { W, H, particles, pipes, bird, score } = gameData.current;
    ctx.clearRect(0, 0, W, H);
    drawBg(ctx, W, H);

    particles.forEach(p => {
      ctx.globalAlpha = (p.life / 20) * 0.5;
      ctx.fillStyle = '#22d3ee';
      ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;

    pipes.forEach(p => drawPipeAt(ctx, p.x, p.y));
    drawBird(ctx, bird.x, bird.y, bird.angle);

    ctx.shadowBlur = 10; ctx.shadowColor = '#22d3ee';
    ctx.fillStyle = '#e2e8f0';
    ctx.font = `bold ${W * 0.1}px Inter`;
    ctx.textAlign = 'center';
    ctx.fillText(score.toString(), W / 2, W * 0.12);
    ctx.shadowBlur = 0;
    ctx.textAlign = 'left';
  }, [drawPipeAt, drawBird]);

  const drawDeadScreen = useCallback(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    if (!ctx) return;

    draw();
    const { W, H, score, best } = gameData.current;
    
    ctx.fillStyle = 'rgba(5,8,18,0.72)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#f87171';
    ctx.font = `bold ${W * 0.09}px Inter`;
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', W / 2, H * 0.38);
    ctx.fillStyle = 'rgba(148,163,184,0.7)';
    ctx.font = `${W * 0.045}px Inter`;
    ctx.fillText(`Score: ${score}`, W / 2, H * 0.46);
    ctx.fillText(`Best: ${best}`, W / 2, H * 0.52);
    ctx.fillStyle = '#22d3ee';
    ctx.font = `bold ${W * 0.05}px Inter`;
    ctx.fillText('Tap to Restart', W / 2, H * 0.62);
    ctx.textAlign = 'left';
  }, [draw]);

  const die = useCallback(() => {
    gameData.current.state = 'dead';
    drawDeadScreen();
  }, [drawDeadScreen]);

  const loop = useCallback(() => {
    if (gameData.current.state !== 'play') return;
    gameData.current.frameId = requestAnimationFrame(loop);

    const { W, H, bird } = gameData.current;
    const PW = PIPE_W();
    const BR = BIRD_R();
    const g = GAP();

    // Gravity
    bird.vy += H * 0.001;
    bird.y += bird.vy;
    bird.angle = Math.min(Math.max(bird.vy / (H * 0.03), -0.4), 1.2);

    // Spawn pipes
    if (gameData.current.frameN % Math.max(60, 90 - gameData.current.score * 2) === 0) {
      const y = H * 0.25 + Math.random() * H * 0.5;
      gameData.current.pipes.push({ x: W + PW, y, passed: false });
    }

    // Move pipes
    const spd = PIPE_SPD();
    gameData.current.pipes.forEach(p => {
      p.x -= spd;
      if (!p.passed && p.x + PW < bird.x - BR) {
        p.passed = true;
        gameData.current.score++;
        setScore(gameData.current.score);
        
        if (gameData.current.score > gameData.current.best) {
          gameData.current.best = gameData.current.score;
          setBest(gameData.current.best);
          localStorage.setItem('flappy-best', gameData.current.best.toString());
        }
      }
    });
    gameData.current.pipes = gameData.current.pipes.filter(p => p.x > -PW - 10);

    // Collision
    const isDead = bird.y - BR < 0 || bird.y + BR > H ||
      gameData.current.pipes.some(p =>
        bird.x + BR * 0.8 > p.x && bird.x - BR * 0.8 < p.x + PW &&
        (bird.y - BR * 0.8 < p.y - g / 2 || bird.y + BR * 0.8 > p.y + g / 2)
      );

    if (isDead) {
      die();
      return;
    }

    // Particles
    if (gameData.current.frameN % 4 === 0) {
      gameData.current.particles.push({ 
        x: bird.x - BR, 
        y: bird.y + (Math.random() - 0.5) * 8, 
        vx: -2, 
        vy: (Math.random() - 0.5) * 2, 
        life: 20 
      });
    }
    gameData.current.particles = gameData.current.particles.filter(p => { 
      p.x += p.vx; 
      p.y += p.vy; 
      p.life--; 
      return p.life > 0; 
    });

    gameData.current.frameN++;
    draw();
  }, [GAP, PIPE_W, BIRD_R, PIPE_SPD, draw, die]);

  const flap = useCallback(() => {
    if (gameData.current.state === 'dead') {
      initGame();
      return;
    }
    if (gameData.current.state === 'idle') {
      gameData.current.state = 'play';
      if (gameData.current.frameId) cancelAnimationFrame(gameData.current.frameId);
      gameData.current.frameId = requestAnimationFrame(loop);
    }
    gameData.current.bird.vy = -gameData.current.H * 0.0187; // 85% of 0.022
  }, [initGame, loop]);

  useEffect(() => {
    const b = parseInt(localStorage.getItem('flappy-best') || '0', 10);
    gameData.current.best = b;
    setBest(b);

    resize();
    initGame();

    const handleResize = () => {
      resize();
      if (gameData.current.state === 'idle') drawIdle();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (gameData.current.frameId) cancelAnimationFrame(gameData.current.frameId);
    };
  }, [resize, initGame, drawIdle]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        flap();
      }
    };
    
    // Prevent default touch interactions like scrolling on the body while playing
    const handleTouchMove = (e: TouchEvent) => {
      if (gameData.current.state === 'play') e.preventDefault();
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [flap]);

  return (
    <div className={styles.container}>
      <div className="fixed top-4 left-4 z-50 pointer-events-auto">
        <BackButton />
      </div>

      <div className={styles.scoreHud}>
        <div className={styles.hudLabel}>Score / Best</div>
        <div className={styles.hudVal}>{score} / {best}</div>
      </div>

      <canvas 
        ref={canvasRef} 
        className={styles.canvas}
        onMouseDown={(e) => { e.preventDefault(); flap(); }}
        onTouchStart={(e) => { e.preventDefault(); flap(); }}
      />
    </div>
  );
}
