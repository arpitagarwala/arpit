'use client';
import {useState,useEffect,useCallback,useRef} from 'react';
import BackButton from '@/components/BackButton/BackButton';
import {emptyCapture,gameAction,gameResult} from '@/lib/game-capture';
import {newInfinityRound,infinityBoard,playInfinity,infinityAiMove,type Mark} from '@/lib/infinity-tictactoe';
import styles from './tictactoe.module.css';
export default function TicTacToeClient(){
 const [round,setRound]=useState(newInfinityRound),roundRef=useRef(round),trainingCapture=useRef(emptyCapture());
 const [mode,setMode]=useState<'pvp'|'ai'>('pvp'),[humanSym,setHumanSym]=useState<Mark>('X'),[scores,setScores]=useState({X:0,O:0});
 const board=infinityBoard(round),current=round.current,gameActive=!round.winner,winData=round.winner;
 const overlay=round.winner?{show:true,type:'win' as const,sym:round.winner.sym}:null;
 const popScore=round.winner?.sym,confetti:{id:number;left:number;color:string;duration:number;delay:number}[]=[];
 const play=useCallback((index:number)=>{const before=roundRef.current,next=playInfinity(before,index);if(next===before)return;roundRef.current=next;setRound(next);gameAction(trainingCapture.current);if(next.winner){setScores(s=>({...s,[next.winner!.sym]:s[next.winner!.sym]+1}));gameResult(trainingCapture.current,'tictactoe-infinity-'+mode,mode==='pvp'||next.winner.sym===humanSym?'solved':'practice');}},[mode,humanSym]);
 useEffect(()=>{if(round.winner||mode!=='ai'||round.current===humanSym)return;const timer=setTimeout(()=>{const index=infinityAiMove(round);if(roundRef.current===round)play(index);},350);return()=>clearTimeout(timer);},[round,mode,humanSym,play]);
 const newRound=()=>{const next=newInfinityRound();roundRef.current=next;setRound(next);trainingCapture.current=emptyCapture();};
 const resetAll=()=>{setScores({X:0,O:0});newRound();};
 const changeMode=(value:'pvp'|'ai')=>{setMode(value);resetAll();};
 const changeSymbol=(value:Mark)=>{setHumanSym(value);newRound();};
 const onCellClick=(index:number)=>{if(mode==='ai'&&roundRef.current.current!==humanSym)return;play(index);};
  const renderMark = (sym: string | null) => {
    if (!sym) return null;
    if (sym === 'X') {
      return (
        <svg viewBox="0 0 50 50" width="55%" height="55%" fill="none">
          <line x1="11" y1="11" x2="39" y2="39" className={styles.xLine} stroke="#a5b4fc" strokeWidth="5.5" strokeLinecap="round" />
          <line x1="39" y1="11" x2="11" y2="39" className={styles.xLine} stroke="#a5b4fc" strokeWidth="5.5" strokeLinecap="round" />
        </svg>
      );
    } else {
      return (
        <svg viewBox="0 0 50 50" width="55%" height="55%" fill="none">
          <circle cx="25" cy="25" r="17" className={styles.oCircle} stroke="#d8b4fe" strokeWidth="5.5" strokeLinecap="round" />
        </svg>
      );
    }
  };

  return (
    <div className={`${styles.page} min-h-screen text-slate-100 transition-colors duration-300`}>
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
              <button onClick={newRound} className="flex-1 py-2.5 rounded-xl bg-violet-300 hover:bg-violet-200 text-violet-950 font-bold text-sm transition-colors">
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
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Infinity Tic Tac Toe</h1>
          <p className="text-xs text-slate-400 mt-0.5">Three marks each. Your fourth replaces your oldest.</p>
        </div>

        {/* Mode + Symbol */}
        <div className="w-full bg-slate-900/50 rounded-2xl border border-slate-700/50 p-4 flex flex-col gap-3 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest w-14 shrink-0">Mode</span>
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
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest w-14 shrink-0">You are</span>
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
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
              {mode === 'ai' ? (humanSym === 'X' ? 'You (X)' : 'AI (X)') : 'Player X'}
            </p>
            <p className={`text-2xl font-black text-violet-300 ${popScore === 'X' ? styles.pop : ''}`}>{scores.X}</p>
          </div>
          <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-3 text-center shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Moves this round</p>
            <p className={`text-2xl font-black text-slate-400 `}>{round.moves}</p>
          </div>
          <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-3 text-center shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
              {mode === 'ai' ? (humanSym === 'O' ? 'You (O)' : 'AI (O)') : 'Player O'}
            </p>
            <p className={`text-2xl font-black text-indigo-300 ${popScore === 'O' ? styles.pop : ''}`}>{scores.O}</p>
          </div>
        </div>

        {/* Status bar */}
        <div className="w-full bg-slate-900/50 rounded-xl border border-slate-700/50 px-4 py-2.5 flex items-center justify-center gap-2 text-sm font-semibold shadow-sm">
          <span className={`w-2.5 h-2.5 rounded-full ${styles.pulse} ${current === 'X' ? 'bg-violet-300' : 'bg-indigo-300'}`}></span>
          <span>
            {round.winner ? round.winner.sym+' wins this round' : mode === 'ai' 
              ? (current === humanSym ? `Your turn (${humanSym})` : 'AI is thinking…')
              : `${current}'s turn`}
          </span>
        </div>

        {/* Board */}
        <div className="grid grid-cols-3 gap-2.5 w-full">
          {board.map((cellSym, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Cell ${i+1}, ${cellSym??'empty'}`}
              disabled={!gameActive||Boolean(cellSym)||(mode==='ai'&&current!==humanSym)}
              data-expiring={cellSym&&round.marks[cellSym].length===3&&round.marks[cellSym][0]===i?true:undefined}
              className={`${styles.cell} ${cellSym ? 'taken' : ''} ${winData?.line.includes(i) ? styles.winCell : ''}`}
              onClick={() => onCellClick(i)}
            >
              {renderMark(cellSym)}
            </button>
          ))}
        </div>

        <p className={styles.rules}>The dotted mark is the oldest. It disappears when that player places their next mark. No filled-board draws; play continues until three line up.</p>
        {/* Controls */}
        <div className="flex gap-2.5 w-full">
          <button onClick={newRound} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 hover:border-violet-300 text-slate-300 text-xs font-semibold transition-all">
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
