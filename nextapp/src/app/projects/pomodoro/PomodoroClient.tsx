'use client';

import React, { useState, useEffect, useRef } from 'react';
import PageHeader from '@/components/PageHeader/PageHeader';
import BackButton from '@/components/BackButton/BackButton';
import styles from './pomodoro.module.css';

export default function PomodoroClient() {
  const [isClient, setIsClient] = useState(false);

  // Gamification state
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [totalMins, setTotalMins] = useState(0);
  const [sessions, setSessions] = useState(0);

  // Configuration state
  const [confFocus, setConfFocus] = useState(25);
  const [confBreak, setConfBreak] = useState(5);
  const [showSettings, setShowSettings] = useState(false);

  // Timer state
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load from local storage on mount
  useEffect(() => {
    setIsClient(true);
    const l = parseInt(localStorage.getItem('pomo_level') || '1');
    const x = parseInt(localStorage.getItem('pomo_xp') || '0');
    const m = parseInt(localStorage.getItem('pomo_mins') || '0');
    const s = parseInt(localStorage.getItem('pomo_sessions') || '0');
    const cf = parseInt(localStorage.getItem('pomo_c_f') || '25');
    const cb = parseInt(localStorage.getItem('pomo_c_b') || '5');

    setLevel(l);
    setXp(x);
    setTotalMins(m);
    setSessions(s);
    setConfFocus(cf);
    setConfBreak(cb);
    setTimeLeft(cf * 60);
  }, []);

  // Save state helper
  const saveData = (newLevel: number, newXp: number, newMins: number, newSessions: number) => {
    localStorage.setItem('pomo_level', newLevel.toString());
    localStorage.setItem('pomo_xp', newXp.toString());
    localStorage.setItem('pomo_mins', newMins.toString());
    localStorage.setItem('pomo_sessions', newSessions.toString());
  };

  // Level Up Logic
  const checkLevel = (currentXp: number, currentLevel: number) => {
    let tempXp = currentXp;
    let tempLevel = currentLevel;
    let nextXp = tempLevel * 100 + 50;

    while (tempXp >= nextXp) {
      tempXp -= nextXp;
      tempLevel++;
      nextXp = tempLevel * 100 + 50;
    }

    return { newXp: tempXp, newLevel: tempLevel };
  };

  const nextLevelXp = level * 100 + 50;

  const rankName = 
    level < 5 ? 'Novice' :
    level < 10 ? 'Apprentice' :
    level < 20 ? 'Adept' :
    level < 35 ? 'Expert' : 'Grandmaster';

  // Format time
  const formattedTime = () => {
    const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const s = (timeLeft % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const toggleTimer = () => {
    if (isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsRunning(false);
    } else {
      setIsRunning(true);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            completeSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const resetTimer = () => {
    if (isRunning) toggleTimer();
    setTimeLeft(mode === 'focus' ? confFocus * 60 : confBreak * 60);
  };

  const changeMode = (newMode: 'focus' | 'break') => {
    if (isRunning) toggleTimer();
    setMode(newMode);
    setTimeLeft(newMode === 'focus' ? confFocus * 60 : confBreak * 60);
  };

  const applySettings = (type: 'focus' | 'break', val: number) => {
    const v = Math.max(1, val);
    if (type === 'focus') {
      setConfFocus(v);
      localStorage.setItem('pomo_c_f', v.toString());
      if (!isRunning && mode === 'focus') setTimeLeft(v * 60);
    } else {
      setConfBreak(v);
      localStorage.setItem('pomo_c_b', v.toString());
      if (!isRunning && mode === 'break') setTimeLeft(v * 60);
    }
  };

  const completeSession = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(false);

    if (mode === 'focus') {
      const earnedXp = (confFocus * 4) + Math.floor(Math.random() * 10);
      const newTotalXp = xp + earnedXp;
      const { newXp, newLevel } = checkLevel(newTotalXp, level);
      
      const newMins = totalMins + confFocus;
      const newSess = sessions + 1;

      setXp(newXp);
      setLevel(newLevel);
      setTotalMins(newMins);
      setSessions(newSess);
      saveData(newLevel, newXp, newMins, newSess);

      alert(`Focus complete! +${earnedXp} XP`);
      changeMode('break');
    } else {
      alert('Break complete! Back to focus.');
      changeMode('focus');
    }
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!isClient) return <div className="min-h-screen bg-slate-900 text-slate-100"></div>;

  return (
    <div className="min-h-screen transition-colors duration-300 flex items-center justify-center p-4 relative pt-16 bg-slate-900 text-slate-100">
      <BackButton />

      <div className="max-w-xl w-full">
        {/* User Stats */}
        <div className={`border ${styles.glass} p-6 rounded-3xl mb-6 flex items-center gap-6 shadow-xl relative overflow-hidden bg-slate-800/80 border-slate-700/50`}>
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-purple-500 rounded-full blur-[80px] opacity-20"></div>
          
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg relative shrink-0">
            <i className="ri-fire-fill text-4xl text-white"></i>
            <div className="absolute -bottom-2 -right-2 border w-8 h-8 rounded-full flex items-center justify-center font-black text-sm bg-slate-900 border-slate-700">
              {level}
            </div>
          </div>
          
          <div className="flex-1 w-full">
            <div className="flex justify-between items-end mb-2">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight">Focus Mastery</h2>
                <div className="text-xs font-bold tracking-wider uppercase text-slate-400">Rank: <span className="text-purple-400">{rankName}</span></div>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold"><span>{xp}</span> / <span>{nextLevelXp}</span> XP</span>
              </div>
            </div>
            
            <div className="w-full h-3 rounded-full overflow-hidden relative bg-slate-800">
              <div className={`h-full ${styles.xpBar}`} style={{ width: `${(xp / nextLevelXp) * 100}%` }}></div>
            </div>
          </div>
        </div>

        {/* Timer Central */}
        <div className={`border ${styles.glass} p-8 sm:p-10 rounded-3xl text-center shadow-xl relative overflow-visible bg-slate-800/80 border-slate-700/50`}>
          
          {/* Settings Panel Toggle */}
          <div className="absolute top-4 right-4 z-30">
            <button onClick={() => setShowSettings(!showSettings)} className="text-slate-400 transition hover:text-slate-200">
              <i className="ri-settings-4-fill text-xl"></i>
            </button>
          </div>
          
          {/* Settings Modal inline */}
          {showSettings && (
            <div className="absolute top-12 right-4 border p-4 rounded-xl shadow-2xl z-30 text-left w-48 bg-slate-700 border-slate-600">
              <div className="mb-3">
                <label className="block text-[10px] font-bold tracking-widest uppercase mb-1 text-slate-400">Focus Mins</label>
                <input 
                  type="number" 
                  value={confFocus} 
                  onChange={e => applySettings('focus', parseInt(e.target.value) || 1)} 
                  className="w-full border rounded px-2 py-1 text-sm font-bold outline-none bg-slate-800 border-slate-600"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase mb-1 text-slate-400">Break Mins</label>
                <input 
                  type="number" 
                  value={confBreak} 
                  onChange={e => applySettings('break', parseInt(e.target.value) || 1)} 
                  className="w-full border rounded px-2 py-1 text-sm font-bold outline-none bg-slate-800 border-slate-600"
                />
              </div>
            </div>
          )}

          <div className="inline-flex gap-2 p-1.5 border rounded-2xl mb-8 relative z-10 bg-slate-800/80 border-slate-700/50">
            <button 
              onClick={() => changeMode('focus')} 
              className={`px-5 py-2 rounded-xl text-sm font-bold transition ${mode === 'focus' ? 'bg-indigo-500 shadow-md text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Focus ({confFocus}m)
            </button>
            <button 
              onClick={() => changeMode('break')} 
              className={`px-5 py-2 rounded-xl text-sm font-bold transition ${mode === 'break' ? 'bg-emerald-500 shadow-md text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Break ({confBreak}m)
            </button>
          </div>

          <h1 className={`text-7xl sm:text-9xl font-black font-mono tracking-tighter mb-8 text-white ${styles.neonGlow}`}>
            {formattedTime()}
          </h1>

          <div className="flex justify-center gap-4 relative z-10 w-full max-w-[200px] mx-auto">
            <button 
              onClick={toggleTimer} 
              className="flex-1 py-4 border backdrop-blur rounded-2xl shadow-md transition-all flex items-center justify-center text-3xl font-bold bg-white/10 hover:bg-white/20 active:bg-white/5 border-white/10 text-white"
            >
              <i className={isRunning ? 'ri-pause-circle-fill' : 'ri-play-circle-fill'}></i>
            </button>
            <button 
              onClick={resetTimer} 
              className="w-16 h-[68px] active:bg-rose-200 border text-rose-500 rounded-2xl shadow-md transition-all flex items-center justify-center text-2xl bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30"
            >
              <i className="ri-refresh-line"></i>
            </button>
          </div>
        </div>

        {/* Streak Box */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className={`border rounded-2xl p-5 flex items-center justify-between shadow-xl ${styles.glass} bg-slate-800/50 border-slate-700/50`}>
            <div>
              <div className="text-[10px] font-bold tracking-widest uppercase mb-1 text-slate-400">Total Focus</div>
              <div className="text-2xl font-black font-mono">{totalMins}m</div>
            </div>
            <i className="ri-timer-line text-3xl text-indigo-400/50"></i>
          </div>
          <div className={`border rounded-2xl p-5 flex items-center justify-between shadow-xl ${styles.glass} bg-slate-800/50 border-slate-700/50`}>
            <div>
              <div className="text-[10px] font-bold tracking-widest uppercase mb-1 text-slate-400">Sessions</div>
              <div className="text-2xl font-black font-mono">{sessions}</div>
            </div>
            <i className="ri-check-double-line text-3xl text-emerald-400/50"></i>
          </div>
        </div>
      </div>
    </div>
  );
}
