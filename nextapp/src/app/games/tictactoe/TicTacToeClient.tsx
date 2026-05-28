'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import BackButton from '@/components/BackButton/BackButton';
import styles from './tictactoe.module.css';

const WINS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

export default function TicTacToeClient() {
  const [board, setBoard] = useState<Array<string | null>>(Array(9).fill(null));
  const [current, setCurrent] = useState<'X' | 'O'>('X');
  const [gameActive, setGameActive] = useState(true);
  const [mode, setMode] = useState<'pvp' | 'ai'>('pvp');
  const [humanSym, setHumanSym] = useState<'X' | 'O'>('X');
  const [scores, setScores] = useState({ X: 0, O: 0, D: 0 });
  const [winData, setWinData] = useState<{ sym: string, line: number[] } | null>(null);
  const [overlay, setOverlay] = useState<{ show: boolean, type: 'win' | 'draw', sym?: string | null } | null>(null);
  const [popScore, setPopScore] = useState<string | null>(null);
  const [confetti, setConfetti] = useState<{ id: number, left: number, color: string, duration: number, delay: number }[]>([]);

  // Prevent multiple AI calls
  const isAiThinking = useRef(false);

  const checkWinner = (b: Array<string | null>) => {
    for (const [a, bIdx, c] of WINS) {
      if (b[a] && b[a] === b[bIdx] && b[a] === b[c]) {
        return { sym: b[a] as string, line: [a, bIdx, c] };
      }
    }
    return null;
  };

  const launchConfetti = () => {
    const colors = ['#22d3ee', '#a78bfa', '#34d399', '#f472b6', '#fbbf24', '#fb923c'];
    const newConfetti = [];
    for (let k = 0; k < 48; k++) {
      newConfetti.push({
        id: Math.random(),
        left: Math.random() * 100,
        color: colors[k % colors.length],
        duration: 1.3 + Math.random() * 1.6,
        delay: Math.random() * 0.6
      });
    }
    setConfetti(newConfetti);
    setTimeout(() => setConfetti([]), 4000); // clear after animation
  };

  const bumpScore = (s: string) => {
    setPopScore(null);
    // Request animation frame to restart animation
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setPopScore(s);
      });
    });
  };

  const endGame = useCallback((type: 'win' | 'draw', sym?: string) => {
    if (type === 'win' && sym) {
      setScores(prev => ({ ...prev, [sym]: prev[sym as keyof typeof prev] + 1 }));
      bumpScore(sym);
      if (sym === humanSym || mode === 'pvp') launchConfetti();
    } else {
      setScores(prev => ({ ...prev, D: prev.D + 1 }));
      bumpScore('D');
    }
    setOverlay({ show: true, type, sym });
  }, [humanSym, mode]);

  const handleMove = useCallback((idx: number, b: Array<string | null>, curr: 'X' | 'O') => {
    const newBoard = [...b];
    newBoard[idx] = curr;
    setBoard(newBoard);

    const w = checkWinner(newBoard);
    if (w) {
      setWinData(w);
      setGameActive(false);
      setTimeout(() => endGame('win', w.sym), 480);
      return;
    }
    if (newBoard.every(Boolean)) {
      setGameActive(false);
      setTimeout(() => endGame('draw'), 480);
      return;
    }
    setCurrent(curr === 'X' ? 'O' : 'X');
  }, [endGame]);

  // AI Logic
  const evalBoard = (b: Array<string | null>, aiS: string) => {
    for (const [a, c, d] of WINS) {
      if (b[a] && b[a] === b[c] && b[a] === b[d]) {
        return b[a] === aiS ? 10 : -10;
      }
    }
    return null;
  };

  const minimax = (b: Array<string | null>, isMax: boolean, aiS: string, huS: string, depth: number): { score: number, idx: number } => {
    const w = evalBoard(b, aiS);
    // Adjust score by depth: faster wins are better, slower losses are better
    if (w === 10) return { score: 10 - depth, idx: -1 };
    if (w === -10) return { score: -10 + depth, idx: -1 };
    if (b.every(Boolean)) return { score: 0, idx: -1 };

    let best = { score: isMax ? -Infinity : Infinity, idx: -1 };
    
    for (let i = 0; i < 9; i++) {
      if (b[i]) continue;
      b[i] = isMax ? aiS : huS;
      const res = minimax(b, !isMax, aiS, huS, depth + 1);
      b[i] = null;

      if (isMax) {
        if (res.score > best.score) best = { score: res.score, idx: i };
      } else {
        if (res.score < best.score) best = { score: res.score, idx: i };
      }
    }
    return best;
  };

  const doAI = useCallback(() => {
    if (!gameActive) return;
    const aiSym = humanSym === 'X' ? 'O' : 'X';
    const bestMove = minimax([...board], true, aiSym, humanSym, 0);
    if (bestMove.idx !== -1) {
      handleMove(bestMove.idx, board, current);
    }
    isAiThinking.current = false;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board, current, gameActive, humanSym, handleMove]);

  useEffect(() => {
    if (gameActive && mode === 'ai' && current !== humanSym && !isAiThinking.current) {
      isAiThinking.current = true;
      const t = setTimeout(() => {
        doAI();
      }, 380);
      return () => clearTimeout(t);
    }
  }, [current, mode, gameActive, humanSym, doAI]);

  const onCellClick = (i: number) => {
    if (!gameActive || board[i]) return;
    if (mode === 'ai' && current !== humanSym) return;
    handleMove(i, board, current);
  };

  const buildBoard = () => {
    setBoard(Array(9).fill(null));
    setCurrent('X');
    setGameActive(true);
    setWinData(null);
    setOverlay(null);
    isAiThinking.current = false;
  };

  const newRound = () => {
    buildBoard();
  };

  const resetAll = () => {
    setScores({ X: 0, O: 0, D: 0 });
    buildBoard();
  };

  const changeMode = (m: 'pvp' | 'ai') => {
    setMode(m);
    setScores({ X: 0, O: 0, D: 0 });
    buildBoard();
  };

  const changeSymbol = (s: 'X' | 'O') => {
    setHumanSym(s);
    buildBoard();
  };

  const renderMark = (sym: string | null) => {
    if (!sym) return null;
    if (sym === 'X') {
      return (
        <svg viewBox="0 0 50 50" width="55%" height="55%" fill="none">
          <line x1="11" y1="11" x2="39" y2="39" className={styles.xLine} stroke="#22d3ee" strokeWidth="5.5" strokeLinecap="round" />
          <line x1="39" y1="11" x2="11" y2="39" className={styles.xLine} stroke="#22d3ee" strokeWidth="5.5" strokeLinecap="round" />
        </svg>
      );
    } else {
      return (
        <svg viewBox="0 0 50 50" width="55%" height="55%" fill="none">
          <circle cx="25" cy="25" r="17" className={styles.oCircle} stroke="#a78bfa" strokeWidth="5.5" strokeLinecap="round" />
        </svg>
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 transition-colors duration-300">
      <div className="fixed top-4 left-4 z-50">
        <BackButton />
      </div>

      {confetti.map(c => (
        <div 
          key={c.id} 
          className={styles.confetti}
          style={{
            left: `${c.left}vw`,
            top: '-15px',
            background: c.color,
            animationDuration: `${c.duration}s`,
            animationDelay: `${c.delay}s`
          }}
        />
      ))}

      {/* Overlay */}
      {overlay && overlay.show && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[100]">
          <div className={`${styles.overlayCard} bg-[#0d1424] rounded-2xl border border-slate-700/60 shadow-2xl p-8 text-center max-w-xs w-full mx-4`}>
            <div className="text-5xl mb-3">
              {overlay.type === 'win' ? (
                mode === 'ai' ? (overlay.sym === humanSym ? '🎉' : '🤖') : '🏆'
              ) : '🤝'}
            </div>
            <h2 className="text-2xl font-extrabold text-white mb-1">
              {overlay.type === 'win' ? (
                mode === 'ai' ? (overlay.sym === humanSym ? 'You Won!' : 'AI Wins!') : `Player ${overlay.sym} Wins!`
              ) : "It's a Draw!"}
            </h2>
            <p className="text-sm text-slate-400 mb-6">
              {overlay.type === 'win' ? (
                mode === 'ai' ? (overlay.sym === humanSym ? 'Brilliant! You outsmarted the AI.' : 'The AI wins this round. Try again!') : `Nice game! ${overlay.sym} takes the round.`
              ) : 'Well played by both sides!'}
            </p>
            <div className="flex gap-3">
              <button onClick={newRound} className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-sm transition-colors">
                <i className="ri-refresh-line mr-1"></i>Play Again
              </button>
              <button onClick={resetAll} className="flex-1 py-2.5 rounded-xl border border-slate-600 text-slate-300 hover:border-slate-400 font-bold text-sm transition-colors">
                <i className="ri-restart-line mr-1"></i>Reset All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-sm mx-auto px-4 py-8 pt-16 flex flex-col items-center gap-4">
        {/* Header */}
        <div className="text-center w-full">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Tic Tac Toe</h1>
          <p className="text-xs text-slate-500 mt-0.5">Outwit your opponent on a 3×3 grid.</p>
        </div>

        {/* Mode + Symbol */}
        <div className="w-full bg-slate-900/50 rounded-2xl border border-slate-700/50 p-4 flex flex-col gap-3 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest w-14 shrink-0">Mode</span>
            <div className="flex gap-2 flex-1">
              <button 
                onClick={() => changeMode('pvp')} 
                className={`${styles.modePill} ${mode === 'pvp' ? styles.modePillActive : 'text-slate-300 border-slate-600'} flex-1 text-xs font-semibold px-3 py-2 rounded-lg border`}
              >
                <i className="ri-group-line mr-1"></i>2 Players
              </button>
              <button 
                onClick={() => changeMode('ai')} 
                className={`${styles.modePill} ${mode === 'ai' ? styles.modePillActive : 'text-slate-300 border-slate-600'} flex-1 text-xs font-semibold px-3 py-2 rounded-lg border`}
              >
                <i className="ri-robot-line mr-1"></i>vs AI
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2" style={{ opacity: mode === 'ai' ? 1 : 0.35, pointerEvents: mode === 'ai' ? 'auto' : 'none' }}>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest w-14 shrink-0">You are</span>
            <div className="flex gap-2 flex-1">
              <button 
                onClick={() => changeSymbol('X')} 
                className={`${styles.modePill} ${humanSym === 'X' ? styles.modePillActive : 'text-slate-300 border-slate-600'} flex-1 text-xs font-semibold px-3 py-2 rounded-lg border`}
              >
                ✕ X · First
              </button>
              <button 
                onClick={() => changeSymbol('O')} 
                className={`${styles.modePill} ${humanSym === 'O' ? styles.modePillActive : 'text-slate-300 border-slate-600'} flex-1 text-xs font-semibold px-3 py-2 rounded-lg border`}
              >
                ○ O · Second
              </button>
            </div>
          </div>
        </div>

        {/* Scoreboard */}
        <div className="w-full grid grid-cols-3 gap-2">
          <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-3 text-center shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
              {mode === 'ai' ? (humanSym === 'X' ? 'You (X)' : 'AI (X)') : 'Player X'}
            </p>
            <p className={`text-2xl font-black text-cyan-600 ${popScore === 'X' ? styles.pop : ''}`}>{scores.X}</p>
          </div>
          <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-3 text-center shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Draws</p>
            <p className={`text-2xl font-black text-slate-400 ${popScore === 'D' ? styles.pop : ''}`}>{scores.D}</p>
          </div>
          <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-3 text-center shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
              {mode === 'ai' ? (humanSym === 'O' ? 'You (O)' : 'AI (O)') : 'Player O'}
            </p>
            <p className={`text-2xl font-black text-violet-600 ${popScore === 'O' ? styles.pop : ''}`}>{scores.O}</p>
          </div>
        </div>

        {/* Status bar */}
        <div className="w-full bg-slate-900/50 rounded-xl border border-slate-700/50 px-4 py-2.5 flex items-center justify-center gap-2 text-sm font-semibold shadow-sm">
          <span className={`w-2.5 h-2.5 rounded-full ${styles.pulse} ${current === 'X' ? 'bg-cyan-600' : 'bg-violet-600'}`}></span>
          <span>
            {mode === 'ai' 
              ? (current === humanSym ? `Your turn (${humanSym})` : 'AI is thinking…')
              : `${current}'s turn`}
          </span>
        </div>

        {/* Board */}
        <div className="grid grid-cols-3 gap-2.5 w-full">
          {board.map((cellSym, i) => (
            <div 
              key={i} 
              className={`${styles.cell} ${cellSym ? 'taken' : ''} ${winData?.line.includes(i) ? styles.winCell : ''}`}
              onClick={() => onCellClick(i)}
            >
              {renderMark(cellSym)}
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex gap-2.5 w-full">
          <button onClick={newRound} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 hover:border-cyan-400 text-slate-300 text-xs font-semibold transition-all">
            <i className="ri-refresh-line"></i>New Round
          </button>
          <button onClick={resetAll} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 hover:border-red-400 text-slate-300 text-xs font-semibold transition-all">
            <i className="ri-delete-bin-line"></i>Reset Scores
          </button>
        </div>

      </div>
    </div>
  );
}
