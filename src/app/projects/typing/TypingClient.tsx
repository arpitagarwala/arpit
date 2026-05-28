'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import BackButton from '@/components/BackButton/BackButton';
import styles from './typing.module.css';

const WORDS_LIST = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "I", "it", "for", "not", "on", "with", "he", "as", "you", "do", "at", 
  "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", "one", "all", "would", "there", 
  "their", "what", "so", "up", "out", "if", "about", "who", "get", "which", "go", "me", "when", "make", "can", "like", "time", "no", 
  "just", "him", "know", "take", "people", "into", "year", "your", "good", "some", "could", "them", "see", "other", "than", "then", 
  "now", "look", "only", "come", "its", "over", "think", "also", "back", "after", "use", "two", "how", "our", "work", "first", "well", 
  "way", "even", "new", "want", "because", "any", "these", "give", "day", "most", "us"
];

export default function TypingClient() {
  const [isClient, setIsClient] = useState(false);
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [typedValue, setTypedValue] = useState('');
  
  const [time, setTime] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [finalWpm, setFinalWpm] = useState(0);
  const [finalAcc, setFinalAcc] = useState(0);
  
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
  
  const [translateY, setTranslateY] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLDivElement | null)[]>([]);

  const generateWords = useCallback(() => {
    const newWords = [];
    for (let i = 0; i < 100; i++) {
      newWords.push(WORDS_LIST[Math.floor(Math.random() * WORDS_LIST.length)]);
    }
    setWords(newWords);
    setCurrentWordIndex(0);
    setTypedValue('');
    setTranslateY(0);
  }, []);

  useEffect(() => {
    setIsClient(true);
    generateWords();

    const handleGlobalKeydown = (e: KeyboardEvent) => {
      // Auto-focus input on any letter key press if not playing and not showing results
      if (!isPlaying && !showResults && e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
        startGame();
      }
      // Restart on space if results are showing
      if (!isPlaying && showResults && e.key === ' ') {
        e.preventDefault();
        resetGame();
      }
    };
    
    document.addEventListener('keydown', handleGlobalKeydown);
    return () => {
      document.removeEventListener('keydown', handleGlobalKeydown);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, showResults]);

  useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (isPlaying && time > 0) {
      timerId = setInterval(() => {
        setTime((prev) => prev - 1);
      }, 1000);
    } else if (time === 0 && isPlaying) {
      endGame();
    }
    return () => clearInterval(timerId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, time]);

  useEffect(() => {
    if (isPlaying) {
      const elapsed = (30 - time) / 60;
      const liveWpm = elapsed > 0 ? Math.round((correctKeystrokes / 5) / elapsed) : 0;
      setWpm(liveWpm);
    }
  }, [time, correctKeystrokes, isPlaying]);

  const startGame = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    setShowResults(false);
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 10);
  };

  const resetGame = () => {
    generateWords();
    setTime(30);
    setWpm(0);
    setTotalKeystrokes(0);
    setCorrectKeystrokes(0);
    setShowResults(false);
    setIsPlaying(false);
  };

  const endGame = () => {
    setIsPlaying(false);
    const finalW = Math.round((correctKeystrokes / 5) / 0.5); // 30s is 0.5 min
    const finalA = totalKeystrokes > 0 ? Math.round((correctKeystrokes / totalKeystrokes) * 100) : 0;
    setFinalWpm(finalW);
    setFinalAcc(finalA);
    setShowResults(true);
    if (inputRef.current) inputRef.current.blur();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isPlaying) {
      setTypedValue('');
      return;
    }
    const val = e.target.value;
    setTotalKeystrokes(prev => prev + 1);

    const actualWord = words[currentWordIndex];
    
    // Space logic: next word
    if (val.endsWith(' ')) {
      const trimmed = val.trim();
      if (trimmed === actualWord) {
        setCorrectKeystrokes(prev => prev + 1);
      }
      
      let nextIndex = currentWordIndex + 1;
      if (nextIndex >= words.length) {
        generateWords();
        nextIndex = 0;
      } else {
        setCurrentWordIndex(nextIndex);
      }
      setTypedValue('');

      // Scroll heuristic
      if (nextIndex > 0 && nextIndex % 5 === 0) {
        const wordEl = wordRefs.current[nextIndex];
        if (wordEl) {
          setTranslateY(-wordEl.offsetTop);
        }
      }
      return;
    }

    // Still typing the current word
    setTypedValue(val);
    
    // Naive correct keystrokes count (only if perfectly matching so far)
    if (val === actualWord.substring(0, val.length)) {
      setCorrectKeystrokes(prev => prev + 1);
    }
  };

  const handleDocumentClick = () => {
    if (isPlaying && inputRef.current) {
      inputRef.current.focus();
    }
  };

  if (!isClient) return <div className="min-h-screen bg-[#2D3748]"></div>;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#2D3748] text-[#E2E8F0]" onClick={handleDocumentClick}>
      <BackButton />

      <div className="max-w-4xl w-full flex flex-col items-center">
        
        {/* Top Stats */}
        <div className={`w-full flex justify-between items-center mb-8 ${styles.glass} rounded-2xl px-6 py-4 shadow-xl border border-slate-700`}>
          <div className="flex items-center gap-3">
            <i className="ri-keyboard-line text-3xl text-cyan-400"></i>
            <h1 className="text-2xl font-black tracking-widest uppercase text-white">TypeRush</h1>
          </div>
          <div className="flex gap-8 text-center">
            <div>
              <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Time Left</div>
              <div className="text-3xl font-mono text-cyan-400 font-extrabold">{time}s</div>
            </div>
            <div>
              <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">WPM</div>
              <div className="text-3xl font-mono text-white font-extrabold">{wpm}</div>
            </div>
          </div>
        </div>

        {/* Text Display */}
        <div className={`w-full text-center mb-10 h-[120px] overflow-hidden relative ${styles.textDisplay}`}>
          <div 
            ref={containerRef}
            className="font-mono tracking-wide absolute left-0 w-full transition-transform duration-200"
            style={{ transform: `translateY(${translateY}px)` }}
          >
            {words.map((word, wIdx) => {
              const isActive = wIdx === currentWordIndex;
              const isPast = wIdx < currentWordIndex;
              
              return (
                <div 
                  key={wIdx} 
                  ref={el => { wordRefs.current[wIdx] = el; }}
                  className={`${styles.word} ${isActive ? styles.active : ''}`}
                >
                  {word.split('').map((letter, lIdx) => {
                    let letterClass = styles.letter;
                    
                    if (isActive) {
                      const typedLetter = typedValue[lIdx];
                      if (typedLetter) {
                        if (typedLetter === letter) letterClass = `${styles.letter} ${styles.correct}`;
                        else letterClass = `${styles.letter} ${styles.incorrect}`;
                      }
                    } else if (isPast) {
                      // We don't save per-word history in the original HTML (it gets reset when container clears or just turns grey).
                      // We'll leave past words greyed out natively by not applying correct/incorrect to them.
                    }
                    
                    return (
                      <span key={lIdx} className={letterClass}>{letter}</span>
                    );
                  })}
                  {/* Handle extra typed characters that exceed word length */}
                  {isActive && typedValue.length > word.length && (
                    <span className={`${styles.letter} ${styles.incorrect}`}>
                      {typedValue.substring(word.length)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Input Box (Hidden, captures typing) */}
        <input 
          ref={inputRef}
          type="text" 
          value={typedValue}
          onChange={handleInputChange}
          autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false"
          className="opacity-0 absolute w-px h-px pointer-events-none"
        />

        {/* Play Button */}
        {!isPlaying && !showResults && (
          <button 
            onClick={startGame}
            className={`bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black px-12 py-4 rounded-full text-xl uppercase tracking-widest shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all active:scale-95 ${styles.pulseCyan}`}
          >
            Start Typing
          </button>
        )}

        {/* Results Modal */}
        {showResults && (
          <div className="absolute inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex items-center justify-center">
            <div className={`${styles.glass} p-10 rounded-3xl max-w-sm w-full text-center border-t-4 border-cyan-400 shadow-2xl`}>
              <h2 className="text-3xl font-black mb-6 uppercase tracking-widest text-cyan-400">Time's Up!</h2>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-800 p-4 rounded-2xl">
                  <div className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-1">Final WPM</div>
                  <div className="text-4xl font-mono font-extrabold text-white">{finalWpm}</div>
                </div>
                <div className="bg-slate-800 p-4 rounded-2xl">
                  <div className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-1">Accuracy</div>
                  <div className="text-4xl font-mono font-extrabold text-white">{finalAcc}%</div>
                </div>
              </div>
              <button 
                onClick={resetGame}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl border border-slate-600 transition-colors uppercase tracking-widest text-sm flex items-center justify-center gap-2"
              >
                <i className="ri-refresh-line"></i> Play Again
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
