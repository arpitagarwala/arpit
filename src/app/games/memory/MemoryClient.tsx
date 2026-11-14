'use client';
import {toolStorage} from '@/lib/account-storage';

import {useState,useEffect,useCallback,useRef} from 'react';
import BackButton from '@/components/BackButton/BackButton';
import {emptyCapture,gameAction,gameResult} from '@/lib/game-capture';
import {MEMORY_LEVELS as DIFF_CFG,newMemoryRound,flipMemoryCard,closeMemoryPair,memoryElapsed,type MemoryDifficulty as Difficulty,type MemoryRound} from '@/lib/memory-game';
import styles from './memory.module.css';

export default function MemoryClient(){
  const trainingCapture=useRef(emptyCapture());
  const roundRef=useRef<MemoryRound|null>(null);
  const [round,setRound]=useState<MemoryRound|null>(null),[seconds,setSeconds]=useState(0),[showWin,setShowWin]=useState(false),[bestTime,setBestTime]=useState<number|null>(null),[isNewBest,setIsNewBest]=useState(false);
  const [comboMsg,setComboMsg]=useState(''),[showComboBadge,setShowComboBadge]=useState(false),[storageError,setStorageError]=useState('');
  const timerRef=useRef<ReturnType<typeof setInterval>|null>(null),timeouts=useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const diff=round?.difficulty??'easy',cards=round?.cards??[],moves=round?.moves??0,matched=round?.matched??0;
  const clearTimers=useCallback(()=>{if(timerRef.current)clearInterval(timerRef.current);timerRef.current=null;for(const t of timeouts.current)clearTimeout(t);timeouts.current.clear();},[]);
  const later=(fn:()=>void,ms:number)=>{const timer=setTimeout(()=>{timeouts.current.delete(timer);fn();},ms);timeouts.current.add(timer);};
  const initGame=useCallback((difficulty:Difficulty='easy')=>{
    clearTimers();const next=newMemoryRound(difficulty);roundRef.current=next;setRound(next);trainingCapture.current=emptyCapture();setSeconds(0);setShowWin(false);setShowComboBadge(false);setIsNewBest(false);
    try{const raw=toolStorage.getItem('memBest_'+difficulty),value=raw===null?NaN:Number(raw);setBestTime(Number.isFinite(value)&&value>=0?value:null);setStorageError('');}catch{setBestTime(null);setStorageError('Personal bests cannot be saved in this browser. You can still play.');}
  },[clearTimers]);
  useEffect(()=>{const frame=requestAnimationFrame(()=>initGame('easy'));return()=>{cancelAnimationFrame(frame);clearTimers();};},[initGame,clearTimers]);
  useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key.toLowerCase()==='r'&&!e.ctrlKey&&!e.metaKey)initGame(roundRef.current?.difficulty??'easy');if(e.key==='Escape')setShowWin(false);};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[initGame]);
  const handleDiffChange=(difficulty:Difficulty)=>initGame(difficulty);
  const handleFlipCard=(index:number,now:number)=>{
    const before=roundRef.current;if(!before)return;
    const next=flipMemoryCard(before,index,now);if(next===before)return;
    roundRef.current=next;setRound(next);gameAction(trainingCapture.current);
    if(before.startedAt===null)timerRef.current=setInterval(()=>{const active=roundRef.current;if(active)setSeconds(Math.floor(memoryElapsed(active,performance.now())/1000));},200);
    if(next.flipped.length===2)later(()=>{if(roundRef.current!==next)return;const closed=closeMemoryPair(next);roundRef.current=closed;setRound(closed);},850);
    if(next.combo>=2&&next.matched>before.matched){setComboMsg(next.combo+' pairs in a row');setShowComboBadge(true);later(()=>setShowComboBadge(false),1200);}
    if(next.endedAt!==null){
      if(timerRef.current)clearInterval(timerRef.current);timerRef.current=null;
      const elapsed=Math.floor(memoryElapsed(next,next.endedAt)/1000);setSeconds(elapsed);gameResult(trainingCapture.current,'memory-'+next.difficulty);
      try{const raw=toolStorage.getItem('memBest_'+next.difficulty),previous=raw===null?Infinity:Number(raw);const best=!Number.isFinite(previous)||elapsed<previous;setIsNewBest(best);if(best){toolStorage.setItem('memBest_'+next.difficulty,String(elapsed));setBestTime(elapsed);}}catch{setStorageError('Round completed. Your personal best could not be saved.');}
      later(()=>setShowWin(true),450);
    }
  };
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
    <div className={`${styles.page} min-h-screen text-slate-50 transition-colors duration-300 p-4 pb-8`}>
      <div className="fixed top-4 left-4 z-50 pointer-events-auto">
        <BackButton />
      </div>

      {/* Combo badge */}
      {showComboBadge && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div className={`px-5 py-2 rounded-2xl bg-violet-400/15 text-violet-200 font-extrabold text-lg shadow-xl ${styles.comboAnim}`}>
            {comboMsg}
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto flex flex-col gap-5 pt-16">
        {/* Header */}
        <div className={`${styles.fadeUp} text-center`}>
          <h1 className="text-3xl font-extrabold tracking-tight mb-1">🃏 Memory Cards</h1>
          <p className="text-sm text-slate-400">Find the pairs. Build a little more recall.</p>
        </div>

        {/* Difficulty */}
        <div className={`${styles.fadeUp} flex gap-1 p-1 bg-white/5 rounded-xl border border-white/8`}>
          {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
            <button 
              key={d}
              onClick={() => handleDiffChange(d)}
              aria-pressed={diff===d} 
              className={`${styles.diffTab} ${diff === d ? styles.active : ''} flex-1 py-2 text-xs font-bold rounded-lg border`}
            >
              {DIFF_CFG[d].label} ({DIFF_CFG[d].cols}×{DIFF_CFG[d].pairs * 2 / DIFF_CFG[d].cols})
            </button>
          ))}
        </div>

        {/* Stats bar */}
        <div className={`${styles.fadeUp} grid grid-cols-4 gap-2.5`}>
          <div className={`${styles.statCard} flex flex-col items-center justify-center py-3 gap-0.5`}>
            <span className={`text-xl font-extrabold font-mono text-violet-300 ${seconds >= 90 ? styles.timerWarn : ''}`}>
              {formatTime(seconds)}
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Time</span>
          </div>
          <div className={`${styles.statCard} flex flex-col items-center justify-center py-3 gap-0.5`}>
            <span className="text-xl font-extrabold font-mono text-indigo-300">{moves}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Moves</span>
          </div>
          <div className={`${styles.statCard} flex flex-col items-center justify-center py-3 gap-0.5`}>
            <span className="text-xl font-extrabold font-mono text-emerald-300">{matched}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Matches</span>
          </div>
          <div className={`${styles.statCard} flex flex-col items-center justify-center py-3 gap-0.5`}>
            <span className="text-xl font-extrabold font-mono text-violet-300">
              {bestTime !== null ? formatTime(bestTime) : '--'}
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Best</span>
          </div>
        </div>

        <p className={styles.roundHint} role="status">{round?.endedAt!==null&&round?.endedAt!==undefined?'All pairs found. Nice work.':round?.startedAt===null?'Your first flip starts the timer.':round?.flipped.length===2?'Take a moment to remember these two.':'Find the matching card.'} · {moves?Math.round(matched/moves*100):0}% pair accuracy</p>
        {storageError&&<p role="status" className={styles.roundHint}>{storageError}</p>}
        {/* Game board */}
        <div 
          className={`${styles.fadeUp} grid gap-3`} 
          style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
        >
          {cards.map((c, i) => (
            <button
              key={c.id}
              type="button"
              aria-label={c.isMatched?'Card '+(i+1)+', matched '+c.emoji:c.isFlipped?'Card '+(i+1)+', '+c.emoji:'Card '+(i+1)+', face down'}
              aria-pressed={c.isFlipped||c.isMatched}
              disabled={c.isMatched||round?.endedAt!==null&&round?.endedAt!==undefined}
              className={`${styles.cardScene} ${c.isFlipped||c.isMatched?styles.flipped:''} ${c.isMatched?styles.matched:''} ${c.isWrong?styles.wrong:''} ${cardHeight}`}
              onClick={event=>handleFlipCard(i,event.timeStamp)}
            >
              <div className={styles.cardInner} aria-hidden="true">
                <div className={`${styles.cardFace} ${styles.cardBack}`}>
                  <i className="ri-question-mark text-2xl text-slate-400"></i>
                </div>
                <div className={`${styles.cardFace} ${styles.cardFront} bg-gradient-to-br ${c.grad} shadow-lg`}>
                  <span className={`${emojiSize} select-none`}>{c.emoji}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Restart */}
        <div className={`${styles.fadeUp} flex justify-center`}>
          <button 
            onClick={() => initGame(diff)} 
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-violet-300 text-violet-950 hover:bg-violet-200 font-bold text-sm shadow-lg hover:opacity-90 active:scale-95 transition-all"
          >
            <i className="ri-refresh-line"></i> New Game
          </button>
        </div>
      </div>

      {/* Win Overlay */}
      {showWin && (
        <div className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 ${styles.overlayIn}`}>
          <div className={`w-full max-w-sm bg-[#19182e] rounded-3xl border border-[#403750] shadow-2xl p-8 flex flex-col items-center gap-5 text-center ${styles.modalIn}`}>
            <div className="text-6xl">{diff === 'hard' ? '🏆' : diff === 'medium' ? '🥈' : '🥉'}</div>
            <div>
              <h2 className="text-2xl font-extrabold mb-1 text-slate-50">You Won!</h2>
              <p className="text-sm text-slate-400">{DIFF_CFG[diff].label} mode — {DIFF_CFG[diff].pairs} pairs matched!</p>
            </div>
            
            <div className="w-full grid grid-cols-3 gap-3">
              <div className={`${styles.statCard} py-3 flex flex-col items-center gap-0.5`}>
                <span className="text-lg font-extrabold text-violet-300 font-mono">{formatTime(seconds)}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Time</span>
              </div>
              <div className={`${styles.statCard} py-3 flex flex-col items-center gap-0.5`}>
                <span className="text-lg font-extrabold text-indigo-300 font-mono">{moves}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Moves</span>
              </div>
              <div className={`${styles.statCard} py-3 flex flex-col items-center gap-0.5`}>
                <span className="text-lg font-extrabold text-violet-300 font-mono">{scoreAmt}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Score</span>
              </div>
            </div>
            
            {isNewBest && (
              <div className="w-full py-2.5 rounded-2xl bg-violet-400/15 text-violet-200 font-bold text-sm">
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
                className="flex-1 py-3 rounded-2xl bg-violet-300 text-violet-950 hover:bg-violet-200 font-bold text-sm shadow-md hover:opacity-90 active:scale-95 transition-all"
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
