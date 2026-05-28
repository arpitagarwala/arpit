'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import BackButton from '@/components/BackButton/BackButton';
import styles from './2048.module.css';

type Board = number[][];

export default function Game2048Client() {
  const [board, setBoard] = useState<Board>(Array.from({ length: 4 }, () => Array(4).fill(0)));
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [history, setHistory] = useState<{ board: Board; score: number }[]>([]);
  const [won, setWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showWinBanner, setShowWinBanner] = useState(false);
  const [newPos, setNewPos] = useState<[number, number] | null>(null);
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  const toastTimeout = useRef<NodeJS.Timeout | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const savedBest = parseInt(localStorage.getItem('2048-best') || '0');
    setBest(savedBest);
    
    const saved = JSON.parse(localStorage.getItem('2048-save') || 'null');
    if (saved && saved.board && saved.board.some((r: number[]) => r.some(v => v > 0))) {
      // Prompt logic shouldn't block render, but we can auto-resume for better UX or use a confirm
      // For Next.js client component, window.confirm during mount can be jarring. Let's auto-resume.
      setBoard(saved.board);
      setScore(saved.score);
      setWon(saved.won || false);
      setHistory([]);
    } else {
      newGame();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = (b: Board, s: number, w: boolean) => {
    localStorage.setItem('2048-save', JSON.stringify({ board: b, score: s, won: w }));
    if (s > best) {
      setBest(s);
      localStorage.setItem('2048-best', s.toString());
    }
  };

  const addTile = (b: Board): [number, number] | null => {
    const empties: [number, number][] = [];
    b.forEach((row, r) => row.forEach((v, c) => { if (!v) empties.push([r, c]); }));
    if (!empties.length) return null;
    const [r, c] = empties[Math.floor(Math.random() * empties.length)];
    b[r][c] = Math.random() < 0.9 ? 2 : 4;
    return [r, c];
  };

  const newGame = () => {
    let newBoard = Array.from({ length: 4 }, () => Array(4).fill(0));
    addTile(newBoard);
    addTile(newBoard);
    setBoard(newBoard);
    setScore(0);
    setWon(false);
    setGameOver(false);
    setShowWinBanner(false);
    setHistory([]);
    setNewPos(null);
    save(newBoard, 0, false);
  };

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    toastTimeout.current = setTimeout(() => setShowToast(false), 2000);
  };

  const undoMove = () => {
    if (!history.length) { triggerToast('Nothing to undo!'); return; }
    const last = history[history.length - 1];
    setBoard(last.board);
    setScore(last.score);
    setHistory(prev => prev.slice(0, -1));
    setNewPos(null);
    save(last.board, last.score, won);
  };

  const isGameOver = (b: Board) => {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (!b[r][c]) return false;
        if (c < 3 && b[r][c] === b[r][c + 1]) return false;
        if (r < 3 && b[r][c] === b[r + 1][c]) return false;
      }
    }
    return true;
  };

  const slideRow = (row: number[], currentScore: { val: number }, wState: { won: boolean }): number[] => {
    let arr = row.filter(v => v);
    let merged = Array(arr.length).fill(false);
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] === arr[i + 1] && !merged[i] && !merged[i + 1]) {
        arr[i] *= 2;
        currentScore.val += arr[i];
        arr.splice(i + 1, 1);
        merged.splice(i + 1, 1);
        merged[i] = true;
        if (arr[i] === 2048 && !wState.won) {
          wState.won = true;
          setShowWinBanner(true);
          setTimeout(() => setShowWinBanner(false), 4000);
        }
      }
    }
    while (arr.length < 4) arr.push(0);
    return arr;
  };

  const rotateBoard = (b: Board) => {
    return b[0].map((_, i) => b.map(r => r[i]).reverse());
  };

  const move = useCallback((dir: number) => {
    if (gameOver) return;

    let b = board.map(r => [...r]);
    const prevHistory = { board: board.map(r => [...r]), score };

    let rotations = [0, 0, 3, 1][dir];
    for (let i = 0; i < rotations; i++) b = rotateBoard(b);

    const scoreState = { val: score };
    const winState = { won };

    if (dir === 1) {
      b = b.map(r => slideRow([...r].reverse(), scoreState, winState).reverse());
    } else {
      b = b.map(r => slideRow(r, scoreState, winState));
    }

    for (let i = 0; i < rotations; i++) b = rotateBoard(rotateBoard(rotateBoard(b)));

    const changed = JSON.stringify(b) !== JSON.stringify(board);
    if (changed) {
      const addedPos = addTile(b);
      setBoard(b);
      setScore(scoreState.val);
      setWon(winState.won);
      setNewPos(addedPos);
      
      const newHistory = [...history, prevHistory];
      if (newHistory.length > 5) newHistory.shift();
      setHistory(newHistory);

      save(b, scoreState.val, winState.won);

      if (isGameOver(b)) {
        setTimeout(() => setGameOver(true), 300);
      }
    }
  }, [board, score, won, gameOver, history]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling for arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
      const dirMap: Record<string, number> = { 
        ArrowLeft: 0, a: 0, 
        ArrowRight: 1, d: 1, 
        ArrowUp: 2, w: 2, 
        ArrowDown: 3, s: 3 
      };
      if (dirMap[e.key] !== undefined) {
        move(dirMap[e.key]);
      }
    };
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
    if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 1 : 0);
    else move(dy > 0 ? 3 : 2);
    touchStart.current = null;
  };

  const getColorClass = (v: number) => {
    if (!v) return styles.tileEmpty;
    if (v === 2) return styles.tile2;
    if (v === 4) return styles.tile4;
    if (v === 8) return styles.tile8;
    if (v === 16) return styles.tile16;
    if (v === 32) return styles.tile32;
    if (v === 64) return styles.tile64;
    if (v === 128) return styles.tile128;
    if (v === 256) return styles.tile256;
    if (v === 512) return styles.tile512;
    if (v === 1024) return styles.tile1024;
    if (v === 2048) return styles.tile2048;
    return styles.tileHigh;
  };

  return (
    <div 
      className="min-h-screen bg-[#0c0f1a] text-slate-100 flex flex-col items-center justify-center py-16 px-4 touch-none select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="fixed top-4 left-4 z-50 pointer-events-auto">
        <BackButton />
      </div>

      <div className={`${styles.winBanner} ${showWinBanner ? styles.winBannerShow : ''}`}>
        🎉 You reached 2048! Keep going!
      </div>

      <div className={styles.header}>
        <h1 className={styles.title}>2048</h1>
        <div className={styles.scoreRow}>
          <div className={styles.scoreBox}>
            <div className={styles.scoreLabel}>Score</div>
            <div className={styles.scoreVal}>{score}</div>
          </div>
          <div className={styles.scoreBox}>
            <div className={styles.scoreLabel}>Best</div>
            <div className={styles.scoreVal}>{best}</div>
          </div>
        </div>
      </div>

      <div className={styles.btnRow}>
        <button className={styles.actionBtn} onClick={newGame}>New Game</button>
        <button className={styles.actionBtn} onClick={undoMove}>Undo</button>
      </div>

      <div className={styles.board}>
        {board.map((row, r) => row.map((v, c) => (
          <div 
            key={`${r}-${c}`} 
            className={`${styles.tile} ${getColorClass(v)} ${newPos && newPos[0] === r && newPos[1] === c ? styles.tileNew : ''}`}
          >
            {v || ''}
          </div>
        )))}
      </div>
      
      <div className={styles.hint}>Arrow Keys / WASD / Swipe to slide tiles</div>

      {gameOver && (
        <div className={`${styles.over} ${styles.overShow}`}>
          <div className={styles.overBox}>
            <div className={styles.overTitle}>💀 Game Over</div>
            <div className={styles.overSub}>No more moves available</div>
            <div style={{ fontSize: '.7rem', color: 'rgba(251,191,36,0.45)', textTransform: 'uppercase', letterSpacing: '.1em' }}>Score</div>
            <div className={styles.overScore}>{score}</div>
            <button className={styles.overBtn} onClick={newGame}>Play Again</button>
          </div>
        </div>
      )}

      <div className={`${styles.toast} ${showToast ? styles.toastShow : ''}`}>
        {toastMsg}
      </div>
    </div>
  );
}
