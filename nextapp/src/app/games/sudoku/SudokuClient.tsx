'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import BackButton from '@/components/BackButton/BackButton';
import styles from './sudoku.module.css';

type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

const DIFF_CLUES = {
  easy: 46,
  medium: 36,
  hard: 28,
  expert: 22
};

interface CellData {
  given: boolean;
  value: number;
  notes: Set<number>;
}

export default function SudokuClient() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [grid, setGrid] = useState<CellData[]>([]);
  const [solution, setSolution] = useState<number[]>([]);
  const [selected, setSelected] = useState<number>(-1);
  const [notesMode, setNotesMode] = useState(false);
  const [hints, setHints] = useState(3);
  const [errors, setErrors] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [bestTimes, setBestTimes] = useState<Record<string, number>>({});
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [victory, setVictory] = useState(false);
  
  const toastTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const b = localStorage.getItem('sudoku-best');
    if (b) {
      try {
        setBestTimes(JSON.parse(b));
      } catch (e) {}
    }
    // Initialize game on mount
    newGame('easy');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && !victory) {
      interval = setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, victory]);

  // Sudoku Generator
  const isValid = (board: number[], pos: number, num: number) => {
    const row = Math.floor(pos / 9);
    const col = pos % 9;
    for (let c = 0; c < 9; c++) if (board[row * 9 + c] === num && c !== col) return false;
    for (let r = 0; r < 9; r++) if (board[r * 9 + col] === num && r !== row) return false;
    const br = Math.floor(row / 3) * 3;
    const bc = Math.floor(col / 3) * 3;
    for (let r = br; r < br + 3; r++) {
      for (let c = bc; c < bc + 3; c++) {
        if (board[r * 9 + c] === num && r * 9 + c !== pos) return false;
      }
    }
    return true;
  };

  const solve = (board: number[]): boolean => {
    const empty = board.indexOf(0);
    if (empty === -1) return true;
    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
    for (const n of nums) {
      if (isValid(board, empty, n)) {
        board[empty] = n;
        if (solve(board)) return true;
        board[empty] = 0;
      }
    }
    return false;
  };

  const generatePuzzle = (diff: Difficulty) => {
    const board = Array(81).fill(0);
    solve(board);
    const sol = [...board];
    const clues = DIFF_CLUES[diff];
    const positions = Array.from({ length: 81 }, (_, i) => i).sort(() => Math.random() - 0.5);
    
    let removed = 0;
    for (const pos of positions) {
      if (81 - removed <= clues) break;
      const backup = board[pos];
      board[pos] = 0;
      
      let cnt = 0;
      const countSolutions = (b: number[], limit: number) => {
        if (cnt >= limit) return;
        const e = b.indexOf(0);
        if (e === -1) { cnt++; return; }
        for (let n = 1; n <= 9; n++) {
          if (isValid(b, e, n)) {
            b[e] = n;
            countSolutions(b, limit);
            b[e] = 0; // backtrack
          }
        }
      };
      
      countSolutions(board, 2);
      if (cnt !== 1) {
        board[pos] = backup;
      } else {
        removed++;
      }
    }
    return { puzzle: board, solution: sol };
  };

  const newGame = (diff = difficulty) => {
    setDifficulty(diff);
    setTimerActive(false);
    setElapsed(0);
    setErrors(0);
    setHints(3);
    setSelected(-1);
    setVictory(false);
    setShowToast(false);

    // Give UI a moment to update before freezing thread with generation
    setTimeout(() => {
      const { puzzle, solution: sol } = generatePuzzle(diff);
      setSolution(sol);
      setGrid(puzzle.map(v => ({ given: v !== 0, value: v, notes: new Set<number>() })));
    }, 10);
  };

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    toastTimeout.current = setTimeout(() => setShowToast(false), 2000);
  };

  const checkWin = useCallback((currentGrid: CellData[], currentSol: number[]) => {
    if (currentGrid.every((c, i) => c.value === currentSol[i])) {
      setTimerActive(false);
      
      setBestTimes(prev => {
        const newBest = { ...prev };
        if (!newBest[difficulty] || elapsed < newBest[difficulty]) {
          newBest[difficulty] = elapsed;
          localStorage.setItem('sudoku-best', JSON.stringify(newBest));
        }
        return newBest;
      });
      setTimeout(() => setVictory(true), 400);
    }
  }, [difficulty, elapsed]);

  const enterNum = useCallback((n: number) => {
    if (selected < 0 || grid[selected]?.given) return;
    if (!timerActive) setTimerActive(true);

    const newGrid = [...grid];
    const cell = { ...newGrid[selected], notes: new Set(newGrid[selected].notes) };

    if (notesMode && n !== 0) {
      if (cell.notes.has(n)) cell.notes.delete(n);
      else cell.notes.add(n);
      newGrid[selected] = cell;
      setGrid(newGrid);
      return;
    }

    cell.notes.clear();
    if (n === 0) {
      cell.value = 0;
      newGrid[selected] = cell;
      setGrid(newGrid);
      return;
    }

    if (n !== solution[selected]) {
      setErrors(e => e + 1);
      triggerToast('✕ Incorrect!');
    }
    
    cell.value = n;
    newGrid[selected] = cell;
    setGrid(newGrid);
    checkWin(newGrid, solution);
  }, [selected, grid, timerActive, notesMode, solution, checkWin]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selected < 0) return;
      const n = parseInt(e.key);
      if (n >= 1 && n <= 9) { enterNum(n); return; }
      if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') { enterNum(0); return; }
      
      const r = Math.floor(selected / 9);
      const c = selected % 9;
      if (e.key === 'ArrowUp' && r > 0) setSelected((r - 1) * 9 + c);
      if (e.key === 'ArrowDown' && r < 8) setSelected((r + 1) * 9 + c);
      if (e.key === 'ArrowLeft' && c > 0) setSelected(r * 9 + c - 1);
      if (e.key === 'ArrowRight' && c < 8) setSelected(r * 9 + c + 1);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selected, enterNum]);

  const useHint = () => {
    if (hints <= 0) { triggerToast('No hints left!'); return; }
    const empties = grid.map((c, i) => i).filter(i => !grid[i].given && grid[i].value !== solution[i]);
    if (!empties.length) return;
    
    const pos = empties[Math.floor(Math.random() * empties.length)];
    const newGrid = [...grid];
    newGrid[pos] = { ...newGrid[pos], value: solution[pos], notes: new Set() };
    
    setHints(h => h - 1);
    setSelected(pos);
    setGrid(newGrid);
    checkWin(newGrid, solution);
    triggerToast(`💡 Hint used — ${hints - 1} left`);
  };

  const fmtTime = (s: number) => {
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  };

  const isRelated = (a: number, b: number) => {
    if (a < 0 || b < 0) return false;
    const ar = Math.floor(a / 9), ac = a % 9;
    const br = Math.floor(b / 9), bc = b % 9;
    return ar === br || ac === bc || (Math.floor(ar / 3) === Math.floor(br / 3) && Math.floor(ac / 3) === Math.floor(bc / 3));
  };

  return (
    <div className="min-h-screen bg-[#050f1f] text-slate-100 flex flex-col items-center py-16 px-4">
      <div className="fixed top-4 left-4 z-50">
        <BackButton />
      </div>

      <h1 className="text-[2rem] font-black bg-gradient-to-br from-cyan-400 to-indigo-400 bg-clip-text text-transparent mb-1">
        🔢 Sudoku
      </h1>
      <div className="text-slate-400/50 text-[0.82rem] mb-6 text-center">
        Fill the grid — every row, column, and 3×3 box must contain 1–9
      </div>

      <div className={styles.ctrlRow}>
        {(['easy', 'medium', 'hard', 'expert'] as Difficulty[]).map(d => (
          <button
            key={d}
            className={`${styles.diffBtn} ${difficulty === d ? styles.diffBtnActive : ''}`}
            onClick={() => newGame(d)}
          >
            {d.charAt(0).toUpperCase() + d.slice(1)}
          </button>
        ))}
        <button className={styles.actionBtn} onClick={() => newGame()}>New Game</button>
        <button className={styles.actionBtn} onClick={useHint}>Hint ({hints})</button>
        <button 
          className={`${styles.actionBtn} ${notesMode ? styles.notesOn : ''}`} 
          onClick={() => setNotesMode(!notesMode)}
        >
          {notesMode ? '✏️ Notes ON' : '✏️ Notes'}
        </button>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.stat}>
          <div className={styles.statLabel}>Time</div>
          <div className={styles.statVal}>{fmtTime(elapsed)}</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statLabel}>Errors</div>
          <div className={styles.statVal}>{errors}</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statLabel}>Best</div>
          <div className={styles.statVal}>{bestTimes[difficulty] !== undefined ? fmtTime(bestTimes[difficulty]) : '—'}</div>
        </div>
      </div>

      <div className={styles.gridWrap}>
        <div className={styles.grid}>
          {grid.map((cell, i) => {
            const isSel = i === selected;
            const sameNum = !cell.given && selected >= 0 && grid[selected]?.value && grid[selected]?.value === cell.value;
            const related = selected >= 0 && isRelated(i, selected) && i !== selected;
            const error = cell.value && !isValid(solution, i, cell.value) && cell.value !== solution[i];

            let cellClass = styles.cell;
            if (cell.given) cellClass += ` ${styles.cellGiven}`;
            else if (error) cellClass += ` ${styles.cellError}`;
            else if (cell.value) cellClass += ` ${styles.cellUser}`;

            if (isSel) cellClass += ` ${styles.cellSelected}`;
            if (sameNum && !isSel) cellClass += ` ${styles.cellSameNum}`;
            if (related && !isSel) cellClass += ` ${styles.cellRelated}`;

            return (
              <div 
                key={i} 
                className={cellClass}
                onClick={() => {
                  if (cell.given) { setSelected(i); return; }
                  if (!timerActive) setTimerActive(true);
                  setSelected(i);
                }}
              >
                {cell.notes.size > 0 && !cell.value ? (
                  <div className={styles.notesGrid}>
                    {[1,2,3,4,5,6,7,8,9].map(n => (
                      <div key={n} className={styles.noteN}>{cell.notes.has(n) ? n : ''}</div>
                    ))}
                  </div>
                ) : (
                  cell.value || ''
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.numpad}>
        <button className={`${styles.numBtn} ${styles.numBtnErase}`} onClick={() => enterNum(0)}>✕</button>
        {[1,2,3,4,5,6,7,8,9].map(n => (
          <button key={n} className={styles.numBtn} onClick={() => enterNum(n)}>{n}</button>
        ))}
      </div>

      <div className={`${styles.toast} ${showToast ? styles.toastShow : ''}`}>
        {toastMsg}
      </div>

      {victory && (
        <div className={`${styles.victory} ${styles.victoryShow}`}>
          <div className={styles.victoryBox}>
            <div className={styles.victoryTitle}>🎉 Solved!</div>
            <div className={styles.victorySub}>Excellent work. Puzzle completed in:</div>
            <div className={styles.victoryTime}>{fmtTime(elapsed)}</div>
            <button className={styles.btnNew} onClick={() => newGame()}>New Puzzle</button>
          </div>
        </div>
      )}
    </div>
  );
}
