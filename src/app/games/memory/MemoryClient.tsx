'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import BackButton from '@/components/BackButton/BackButton';
import styles from './memory.module.css';

// ── Constants ──
const EMOJIS = [
  '🚀','🌈','🎸','🦊','🌺','🍕',
  '🎯','🦋','🌙','⚡','🎪','🦁',
  '🐬','🎨','🍦','🏆','🌊','🎭',
  '🦄','🎲'
];

const GRADIENTS = [
  'from-cyan-500 to-blue-600',
  'from-violet-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-500',
  'from-indigo-500 to-blue-700',
  'from-fuchsia-500 to-pink-600',
  'from-green-500 to-emerald-600',
  'from-sky-500 to-cyan-600',
  'from-red-500 to-rose-600',
  'from-yellow-500 to-amber-600',
  'from-teal-500 to-cyan-700',
  'from-purple-500 to-indigo-600',
  'from-pink-500 to-rose-600',
  'from-lime-500 to-green-600',
  'from-orange-500 to-red-600',
  'from-blue-500 to-indigo-700',
  'from-cyan-600 to-teal-700',
  'from-violet-600 to-fuchsia-600',
  'from-amber-600 to-yellow-600'
];

type Difficulty = 'easy' | 'medium' | 'hard';

const DIFF_CFG: Record<Difficulty, { pairs: number; cols: number; label: string }> = {
  easy: { pairs: 6, cols: 3, label: 'Easy' },
  medium: { pairs: 8, cols: 4, label: 'Medium' },
  hard: { pairs: 10, cols: 5, label: 'Hard' }
};

interface Card {
  id: number;
  emoji: string;
  grad: string;
  isFlipped: boolean;
  isMatched: boolean;
  isWrong: boolean;
}

export default function MemoryClient() {
  const [diff, setDiff] = useState<Difficulty>('easy');
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIdxs, setFlippedIdxs] = useState<number[]>([]);
  const [matched, setMatched] = useState(0);
  const [moves, setMoves] = useState(0);
  const [combo, setCombo] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [locked, setLocked] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [isNewBest, setIsNewBest] = useState(false);
  const [bestTime, setBestTime] = useState<number | null>(null);
  
  // Combo notification state
  const [comboMsg, setComboMsg] = useState('');
  const [showComboBadge, setShowComboBadge] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const shuffle = <T,>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const loadBest = useCallback((d: Difficulty) => {
    const b = localStorage.getItem('memBest_' + d);
    setBestTime(b ? parseInt(b, 10) : null);
  }, []);

  const initGame = useCallback((newDiff = diff) => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    setSeconds(0);
    setMoves(0);
    setMatched(0);
    setCombo(0);
    setFlippedIdxs([]);
    setLocked(false);
    setGameActive(false);
    setShowWin(false);
    setComboMsg('');
    setShowComboBadge(false);

    const cfg = DIFF_CFG[newDiff];
    const pool = shuffle([...EMOJIS]).slice(0, cfg.pairs);
    const grads = shuffle([...GRADIENTS]).slice(0, cfg.pairs);
    
    const newCards = shuffle([...pool, ...pool].map((emoji, i) => ({
      id: i,
      emoji,
      grad: grads[pool.indexOf(emoji)],
      isFlipped: false,
      isMatched: false,
      isWrong: false
    })));
    
    setCards(newCards);
    loadBest(newDiff);
  }, [diff, loadBest]);

  useEffect(() => {
    initGame('easy');
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [initGame]);

  const handleDiffChange = (d: Difficulty) => {
    setDiff(d);
    initGame(d);
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
  };

  const triggerCombo = (n: number) => {
    const msgs = ['', '', '🔥 x2 Combo!', '🔥🔥 x3 Streak!', '⚡ x4 ON FIRE!', '💥 x5 UNSTOPPABLE!'];
    setComboMsg(msgs[Math.min(n, msgs.length - 1)]);
    setShowComboBadge(false);
    
    // Force reflow/restart animation
    setTimeout(() => {
      setShowComboBadge(true);
      setTimeout(() => setShowComboBadge(false), 1300);
    }, 50);
  };

  const handleWin = useCallback((finalSecs: number, finalMoves: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameActive(false);
    
    const key = 'memBest_' + diff;
    const prev = parseInt(localStorage.getItem(key) || '99999', 10);
    const isNew = finalSecs < prev;
    if (isNew) {
      localStorage.setItem(key, finalSecs.toString());
      setBestTime(finalSecs);
    }
    setIsNewBest(isNew);
    
    setTimeout(() => setShowWin(true), 400);
  }, [diff]);

  const flipCard = (index: number) => {
    if (locked || cards[index].isFlipped || cards[index].isMatched) return;

    if (!gameActive) {
      startTimer();
      setGameActive(true);
    }

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);
    
    const newFlipped = [...flippedIdxs, index];
    setFlippedIdxs(newFlipped);

    if (newFlipped.length === 2) {
      setLocked(true);
      const m = moves + 1;
      setMoves(m);

      const [a, b] = newFlipped;
      if (newCards[a].emoji === newCards[b].emoji) {
        // Match
        const c = combo + 1;
        setCombo(c);
        const matchCount = matched + 1;
        setMatched(matchCount);
        
        setTimeout(() => {
          setCards(prev => {
            const upd = [...prev];
            upd[a].isMatched = true;
            upd[b].isMatched = true;
            return upd;
          });
          if (c >= 2) triggerCombo(c);
          setFlippedIdxs([]);
          setLocked(false);
          
          if (matchCount === DIFF_CFG[diff].pairs) {
            handleWin(seconds, m);
          }
        }, 300);
      } else {
        // No Match
        setCombo(0);
        
        // Trigger wrong animation
        setTimeout(() => {
          setCards(prev => {
            const upd = [...prev];
            upd[a].isWrong = true;
            upd[b].isWrong = true;
            return upd;
          });
        }, 100);

        setTimeout(() => {
          setCards(prev => {
            const upd = [...prev];
            upd[a].isFlipped = false;
            upd[b].isFlipped = false;
            upd[a].isWrong = false;
            upd[b].isWrong = false;
            return upd;
          });
          setFlippedIdxs([]);
          setLocked(false);
        }, 750);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') initGame(diff);
      if (e.key === 'Escape') setShowWin(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [diff, initGame]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const gridCols = DIFF_CFG[diff].cols;
  const cardHeight = diff === 'hard' ? 'h-16 sm:h-20' : diff === 'medium' ? 'h-20 sm:h-24' : 'h-24 sm:h-28';
  const emojiSize = diff === 'hard' ? 'text-2xl' : diff === 'medium' ? 'text-3xl' : 'text-4xl';
  const scoreAmt = Math.max(0, Math.floor(1000 + DIFF_CFG[diff].pairs * 50 - moves * 10 - seconds * 2));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 transition-colors duration-300 p-4 pb-8">
      <div className="fixed top-4 left-4 z-50 pointer-events-auto">
        <BackButton />
      </div>

      {/* Combo badge */}
      {showComboBadge && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div className={`px-5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-lg shadow-xl ${styles.comboAnim}`}>
            {comboMsg}
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto flex flex-col gap-5 pt-16">
        {/* Header */}
        <div className={`${styles.fadeUp} text-center`}>
          <h1 className="text-3xl font-extrabold tracking-tight mb-1">🃏 Memory Cards</h1>
          <p className="text-sm text-slate-500">Flip & match all pairs as fast as you can!</p>
        </div>

        {/* Difficulty */}
        <div className={`${styles.fadeUp} flex gap-1 p-1 bg-white/5 rounded-xl border border-white/8`}>
          {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
            <button 
              key={d}
              onClick={() => handleDiffChange(d)} 
              className={`${styles.diffTab} ${diff === d ? styles.active : ''} flex-1 py-2 text-xs font-bold rounded-lg border`}
            >
              {DIFF_CFG[d].label} ({DIFF_CFG[d].cols}×{DIFF_CFG[d].pairs * 2 / DIFF_CFG[d].cols})
            </button>
          ))}
        </div>

        {/* Stats bar */}
        <div className={`${styles.fadeUp} grid grid-cols-4 gap-2.5`}>
          <div className={`${styles.statCard} flex flex-col items-center justify-center py-3 gap-0.5`}>
            <span className={`text-xl font-extrabold font-mono text-cyan-600 ${seconds >= 90 ? styles.timerWarn : ''}`}>
              {formatTime(seconds)}
            </span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Time</span>
          </div>
          <div className={`${styles.statCard} flex flex-col items-center justify-center py-3 gap-0.5`}>
            <span className="text-xl font-extrabold font-mono text-violet-600">{moves}</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Moves</span>
          </div>
          <div className={`${styles.statCard} flex flex-col items-center justify-center py-3 gap-0.5`}>
            <span className="text-xl font-extrabold font-mono text-emerald-600">{matched}</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Matches</span>
          </div>
          <div className={`${styles.statCard} flex flex-col items-center justify-center py-3 gap-0.5`}>
            <span className="text-xl font-extrabold font-mono text-amber-600">
              {bestTime !== null ? formatTime(bestTime) : '--'}
            </span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Best</span>
          </div>
        </div>

        {/* Game board */}
        <div 
          className={`${styles.fadeUp} grid gap-3`} 
          style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
        >
          {cards.map((c, i) => (
            <div 
              key={i} 
              className={`${styles.cardScene} ${c.isFlipped || c.isMatched ? styles.flipped : ''} ${c.isMatched ? styles.matched : ''} ${c.isWrong ? styles.wrong : ''} ${cardHeight}`} 
              onClick={() => flipCard(i)}
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div className={styles.cardInner}>
                <div className={`${styles.cardFace} ${styles.cardBack}`}>
                  <i className="ri-question-mark text-2xl text-slate-500"></i>
                </div>
                <div className={`${styles.cardFace} ${styles.cardFront} bg-gradient-to-br ${c.grad} shadow-lg`}>
                  <span className={`${emojiSize} select-none`}>{c.emoji}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Restart */}
        <div className={`${styles.fadeUp} flex justify-center`}>
          <button 
            onClick={() => initGame(diff)} 
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm shadow-lg hover:opacity-90 active:scale-95 transition-all"
          >
            <i className="ri-refresh-line"></i> New Game
          </button>
        </div>
      </div>

      {/* Win Overlay */}
      {showWin && (
        <div className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 ${styles.overlayIn}`}>
          <div className={`w-full max-w-sm bg-slate-800 rounded-3xl border border-slate-700 shadow-2xl p-8 flex flex-col items-center gap-5 text-center ${styles.modalIn}`}>
            <div className="text-6xl">{diff === 'hard' ? '🏆' : diff === 'medium' ? '🥈' : '🥉'}</div>
            <div>
              <h2 className="text-2xl font-extrabold mb-1 text-slate-50">You Won!</h2>
              <p className="text-sm text-slate-500">{DIFF_CFG[diff].label} mode — {DIFF_CFG[diff].pairs} pairs matched!</p>
            </div>
            
            <div className="w-full grid grid-cols-3 gap-3">
              <div className={`${styles.statCard} py-3 flex flex-col items-center gap-0.5`}>
                <span className="text-lg font-extrabold text-cyan-600 font-mono">{formatTime(seconds)}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Time</span>
              </div>
              <div className={`${styles.statCard} py-3 flex flex-col items-center gap-0.5`}>
                <span className="text-lg font-extrabold text-violet-600 font-mono">{moves}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Moves</span>
              </div>
              <div className={`${styles.statCard} py-3 flex flex-col items-center gap-0.5`}>
                <span className="text-lg font-extrabold text-amber-600 font-mono">{scoreAmt}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Score</span>
              </div>
            </div>
            
            {isNewBest && (
              <div className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm">
                🎉 New Best Time!
              </div>
            )}
            
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => setShowWin(false)} 
                className="flex-1 py-3 rounded-2xl border border-slate-700 text-slate-300 font-semibold text-sm hover:bg-white/5 transition-all"
              >
                Close
              </button>
              <button 
                onClick={() => initGame(diff)} 
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm shadow-md hover:opacity-90 active:scale-95 transition-all"
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
