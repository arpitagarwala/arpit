'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './calculator.module.css';
import BackButton from '@/components/BackButton/BackButton';

const MAX_HISTORY = 200;

type HistoryItem = { calc: string; result: string };

const UNITS: Record<string, any> = {
  length: { units: ['mm', 'cm', 'm', 'km', 'in', 'ft', 'yd', 'mi'], toBase: { mm: 0.001, cm: 0.01, m: 1, km: 1000, in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344 } },
  weight: { units: ['mg', 'g', 'kg', 't', 'oz', 'lb'], toBase: { mg: 0.000001, g: 0.001, kg: 1, t: 1000, oz: 0.028349, lb: 0.453592 } },
  temp: { units: ['°C', '°F', 'K'], toBase: null },
  area: { units: ['mm²', 'cm²', 'm²', 'km²', 'ft²', 'ac', 'ha'], toBase: { 'mm²': 1e-6, 'cm²': 1e-4, 'm²': 1, 'km²': 1e6, 'ft²': 0.092903, ac: 4046.86, ha: 10000 } },
  speed: { units: ['m/s', 'km/h', 'mph', 'knot'], toBase: { 'm/s': 1, 'km/h': 1 / 3.6, mph: 0.44704, knot: 0.514444 } },
  data: { units: ['B', 'KB', 'MB', 'GB', 'TB', 'PB'], toBase: { B: 1, KB: 1024, MB: 1048576, GB: 1073741824, TB: 1099511627776, PB: 1.126e15 } }
};

export default function CalculatorClient() {
  const [mode, setMode] = useState<'standard' | 'scientific' | 'unit'>('standard');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [toast, setToast] = useState({ show: false, msg: '' });

  // Calculator State
  const [currentInput, setCurrentInput] = useState('0');
  const [previousInput, setPreviousInput] = useState('');
  const [operator, setOperator] = useState<string | null>(null);
  const [shouldReset, setShouldReset] = useState(false);
  const [memory, setMemory] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [lastOperator, setLastOperator] = useState<string | null>(null);
  const [lastOperand, setLastOperand] = useState<number | null>(null);
  const [justEvaluated, setJustEvaluated] = useState(false);
  const [mrcJustPressed, setMrcJustPressed] = useState(false);
  const [gtJustPressed, setGtJustPressed] = useState(false);
  const [angleMode, setAngleMode] = useState<'deg' | 'rad'>('deg');
  const [histLine, setHistLine] = useState('');

  // Unit State
  const [unitCat, setUnitCat] = useState('length');
  const [unitFrom, setUnitFrom] = useState('m');
  const [unitTo, setUnitTo] = useState('km');
  const [unitInput, setUnitInput] = useState('1');

  // Load history
  useEffect(() => {
    const saved = localStorage.getItem('calcHistory');
    if (saved) setHistoryList(JSON.parse(saved));
  }, []);

  const showToast = (msg: string) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: '' }), 2200);
  };

  const fmtDisplay = (s: string) => {
    const n = parseFloat(s);
    if (isNaN(n)) return s;
    return n.toLocaleString('en-IN', { maximumFractionDigits: 8 });
  };

  const fmtResult = (v: number | string) => {
    if (v === 'Error') return 'Error';
    return parseFloat((v as number).toFixed(10)).toString();
  };

  const opSym = (op: string) => ({ '*': '×', '/': '÷', '-': '−' }[op] || op);

  const addToHistory = (calc: string, result: number | string) => {
    const resStr = fmtResult(result);
    setHistoryList(prev => {
      const nw = [{ calc, result: resStr }, ...prev];
      if (nw.length > MAX_HISTORY) nw.pop();
      localStorage.setItem('calcHistory', JSON.stringify(nw));
      return nw;
    });
  };

  const compute = (a: number, b: number, op: string) => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b === 0 ? 'Error' : a / b;
      default: return b;
    }
  };

  // Keep ref to state for calculate
  const stateRef = useRef({ currentInput, previousInput, operator, shouldReset, memory, grandTotal, lastOperator, lastOperand, justEvaluated, mrcJustPressed });
  useEffect(() => {
    stateRef.current = { currentInput, previousInput, operator, shouldReset, memory, grandTotal, lastOperator, lastOperand, justEvaluated, mrcJustPressed };
  });

  const appendNumber = (n: string) => {
    setMrcJustPressed(false);
    setGtJustPressed(false);
    const s = stateRef.current;
    if (n === '.' && s.currentInput.includes('.') && !s.shouldReset) return;
    
    if (s.currentInput === '0' || s.shouldReset) {
      setCurrentInput(n === '.' ? '0.' : (n === '00' ? '0' : n));
      setShouldReset(false);
    } else {
      if (s.currentInput.replace(/[^0-9]/g, '').length >= 15) return;
      setCurrentInput(s.currentInput + n);
    }
  };

  const calculate = (silent = false) => {
    const s = stateRef.current;
    if (s.justEvaluated && !silent) {
      if (s.lastOperator === null || s.lastOperand === null) return;
      const cur = parseFloat(s.currentInput);
      const res = compute(cur, s.lastOperand, s.lastOperator);
      const cs = `${fmtDisplay(s.currentInput)} ${opSym(s.lastOperator)} ${fmtDisplay(s.lastOperand.toString())}`;
      if (!silent) {
        addToHistory(cs, res);
        setHistLine(`${cs} =`);
      }
      setGrandTotal(prev => prev + (typeof res === 'number' && isFinite(res) ? res : 0));
      setCurrentInput(fmtResult(res));
      return;
    }

    if (s.operator === null) return;
    const prev = parseFloat(s.previousInput);
    const b = (s.shouldReset && !s.mrcJustPressed) ? parseFloat(s.previousInput) : parseFloat(s.currentInput);
    const result = compute(prev, b, s.operator);
    const calcStr = `${fmtDisplay(s.previousInput)} ${opSym(s.operator)} ${fmtDisplay(b.toString())}`;
    
    if (!silent) {
      addToHistory(calcStr, result);
      setHistLine(`${calcStr} =`);
    }
    
    setGrandTotal(p => p + (typeof result === 'number' && isFinite(result) ? result : 0));
    setLastOperator(s.operator);
    setLastOperand(b);
    setJustEvaluated(!silent);
    setCurrentInput(fmtResult(result));
    setOperator(null);
    setShouldReset(true);
  };

  const appendOperator = (op: string) => {
    setJustEvaluated(false);
    const s = stateRef.current;
    if (s.operator !== null && (!s.shouldReset || s.mrcJustPressed)) {
      calculate(true); // silent calculate
    }
    setMrcJustPressed(false);
    setGtJustPressed(false);
    setPreviousInput(stateRef.current.currentInput); // might be updated by silent calculate
    setOperator(op);
    setHistLine(`${fmtDisplay(stateRef.current.currentInput)} ${opSym(op)}`);
    setShouldReset(true);
  };

  const toggleSign = () => {
    if (currentInput === '0' || currentInput === 'Error') return;
    setCurrentInput(currentInput.startsWith('-') ? currentInput.slice(1) : '-' + currentInput);
  };

  const sciOp = (op: string) => {
    const v = parseFloat(currentInput);
    const a = angleMode === 'deg' ? (v * Math.PI) / 180 : v;
    let result: number | 'Error';
    switch (op) {
      case 'sin': result = Math.sin(a); break;
      case 'cos': result = Math.cos(a); break;
      case 'tan': result = Math.tan(a); break;
      case 'log': result = v <= 0 ? 'Error' : Math.log10(v); break;
      case 'ln': result = v <= 0 ? 'Error' : Math.log(v); break;
      case 'pow2': result = v * v; break;
      case 'pow3': result = v * v * v; break;
      case 'cbrt': result = Math.cbrt(v); break;
      case 'inv': result = v === 0 ? 'Error' : 1 / v; break;
      case 'pi': setCurrentInput(Math.PI.toString()); setShouldReset(true); return;
      case 'e': setCurrentInput(Math.E.toString()); setShouldReset(true); return;
      case 'abs': result = Math.abs(v); break;
      default: return;
    }
    const label = `${op}(${v})`;
    addToHistory(label, result);
    setHistLine(`${label} =`);
    setCurrentInput(fmtResult(result));
    setShouldReset(true);
  };

  const calculatePercentage = () => {
    const s = stateRef.current;
    const cur = parseFloat(s.currentInput);
    if (s.operator === '*' || s.operator === '/') {
      const b = cur / 100;
      const res = compute(parseFloat(s.previousInput), b, s.operator);
      addToHistory(`${fmtDisplay(s.previousInput)} ${opSym(s.operator)} ${fmtDisplay(b.toString())} %`, res);
      setHistLine(`${fmtDisplay(s.previousInput)} ${opSym(s.operator)} ${fmtDisplay(b.toString())} % =`);
      setGrandTotal(p => p + (typeof res === 'number' && isFinite(res) ? res : 0));
      setCurrentInput(fmtResult(res));
      setOperator(null);
      setShouldReset(true);
    } else if (s.operator === '+' || s.operator === '-') {
      const prev = parseFloat(s.previousInput);
      const b = (prev * cur) / 100;
      const res = compute(prev, b, s.operator);
      addToHistory(`${fmtDisplay(s.previousInput)} ${opSym(s.operator)} ${fmtDisplay(b.toString())} %`, res);
      setHistLine(`${fmtDisplay(s.previousInput)} ${opSym(s.operator)} ${fmtDisplay(b.toString())} % =`);
      setGrandTotal(p => p + (typeof res === 'number' && isFinite(res) ? res : 0));
      setCurrentInput(fmtResult(res));
      setOperator(null);
      setShouldReset(true);
    } else {
      setCurrentInput(fmtResult(cur / 100));
      setShouldReset(true);
    }
  };

  const calculateRoot = () => {
    const v = parseFloat(currentInput);
    const res = v < 0 ? 'Error' : Math.sqrt(v);
    setCurrentInput(fmtResult(res));
    addToHistory(`√(${v})`, res);
    setShouldReset(true);
  };

  const deleteLast = () => {
    if (shouldReset || currentInput === 'Error') {
      setCurrentInput('0');
      setShouldReset(false);
    } else {
      setCurrentInput(currentInput.length > 1 ? currentInput.slice(0, -1) : '0');
    }
  };

  const clearAll = () => {
    setCurrentInput('0');
    setPreviousInput('');
    setOperator(null);
    setGrandTotal(0);
    setLastOperator(null);
    setLastOperand(null);
    setJustEvaluated(false);
    setHistLine('');
  };

  const memoryRecall = () => {
    setGtJustPressed(false);
    if (mrcJustPressed) {
      setMemory(0);
      setMrcJustPressed(false);
      showToast('Memory cleared');
    } else {
      setCurrentInput(memory.toString());
      setShouldReset(true);
      setMrcJustPressed(true);
    }
  };

  const grandTotalRecall = () => {
    setMrcJustPressed(false);
    if (gtJustPressed) {
      setGrandTotal(0);
      setGtJustPressed(false);
      showToast('Grand Total cleared');
      setHistLine('');
    } else {
      setCurrentInput(grandTotal.toString());
      setHistLine('Grand Total');
      setShouldReset(true);
      setGtJustPressed(true);
    }
  };

  const handleMemory = (sign: 1 | -1) => {
    const s = stateRef.current;
    let val = parseFloat(s.currentInput);
    
    if (s.operator !== null && (!s.shouldReset || s.mrcJustPressed)) {
      val = compute(parseFloat(s.previousInput), val, s.operator) as number;
      if (typeof val === 'number' && isFinite(val)) {
        calculate(false); // Evaluate and update screen/history
      }
    }
    
    if (typeof val === 'number' && isFinite(val)) {
      setMemory(m => m + val * sign);
      setShouldReset(true);
      showToast(sign === 1 ? 'M+' : 'M−');
    }
  };

  // Keyboard
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (mode === 'unit') return;
      if (e.key >= '0' && e.key <= '9') appendNumber(e.key);
      if (e.key === '.') appendNumber('.');
      if (e.key === '=' || e.key === 'Enter') { e.preventDefault(); calculate(); }
      if (e.key === 'Backspace') deleteLast();
      if (e.key === 'Escape') clearAll();
      if (['+', '-', '*', '/'].includes(e.key)) appendOperator(e.key);
      if (e.key === '%') calculatePercentage();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [mode]);

  // Font sizing
  const len = currentInput.replace('.', '').replace('-', '').length;
  const fontSize = len > 12 ? '1.6rem' : len > 9 ? '2.4rem' : len > 7 ? '3rem' : '';

  // Unit converter logic
  useEffect(() => {
    if (mode === 'unit') {
      const units = UNITS[unitCat].units;
      setUnitFrom(units[0]);
      setUnitTo(units[1]);
    }
  }, [unitCat, mode]);

  const getUnitResult = () => {
    const val = parseFloat(unitInput);
    if (isNaN(val)) return '—';
    let result = 0;
    if (unitCat === 'temp') {
      if (unitFrom === unitTo) result = val;
      else if (unitFrom === '°C' && unitTo === '°F') result = val * 9 / 5 + 32;
      else if (unitFrom === '°C' && unitTo === 'K') result = val + 273.15;
      else if (unitFrom === '°F' && unitTo === '°C') result = (val - 32) * 5 / 9;
      else if (unitFrom === '°F' && unitTo === 'K') result = (val - 32) * 5 / 9 + 273.15;
      else if (unitFrom === 'K' && unitTo === '°C') result = val - 273.15;
      else if (unitFrom === 'K' && unitTo === '°F') result = (val - 273.15) * 9 / 5 + 32;
    } else {
      const base = UNITS[unitCat].toBase;
      result = val * base[unitFrom] / base[unitTo];
    }
    return result < 0.0001 && result > 0 ? result.toExponential(4) : parseFloat(result.toFixed(6)).toLocaleString('en-IN');
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 relative overflow-hidden">
      <BackButton />
      
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <button onClick={() => setHistoryOpen(!historyOpen)} className="w-10 h-10 flex items-center justify-center rounded-full backdrop-blur border hover:border-cyan-400 hover:text-cyan-400 shadow-lg transition-all bg-slate-800 border-slate-700 text-slate-300">
          <i className="ri-history-line text-lg"></i>
        </button>
      </div>

      <div className="w-full max-w-5xl mx-auto flex flex-col lg:flex-row gap-5 items-center justify-center px-4">
        
        {/* Calculator Body */}
        <div className={`w-full max-w-[400px] ${styles.glass} rounded-[2rem] shadow-2xl p-5 flex flex-col gap-4`}>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[.18em] font-bold text-slate-400">Calculator</span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">v3.0</span>
            </div>
            <div className="flex items-center gap-2">
              {memory !== 0 && <div className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">M</div>}
              {mode === 'scientific' && (
                <button onClick={() => setAngleMode(angleMode === 'deg' ? 'rad' : 'deg')} className="text-[9px] px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 transition hover:bg-violet-500/20">
                  {angleMode.toUpperCase()}
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-1 p-1 rounded-xl border bg-slate-800 border-slate-700">
            <button onClick={() => setMode('standard')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg ${mode === 'standard' ? styles.modeTabActive : styles.modeTab}`}>Standard</button>
            <button onClick={() => setMode('scientific')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg ${mode === 'scientific' ? styles.modeTabActive : styles.modeTab}`}>Scientific</button>
            <button onClick={() => setMode('unit')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg ${mode === 'unit' ? styles.modeTabActive : styles.modeTab}`}>Unit</button>
          </div>

          <div className="flex flex-col items-end gap-1 px-1">
            <div className={`h-5 text-xs ${styles.mono} truncate w-full text-right text-slate-400`}>{histLine}</div>
            <div className={`w-full text-right font-bold tracking-tight truncate ${styles.mono} leading-tight text-slate-50`} style={{ fontSize: fontSize || '3.75rem' }}>
              {currentInput}
            </div>
          </div>

          {mode === 'scientific' && (
            <div className="grid grid-cols-4 gap-2">
              {['sin', 'cos', 'tan', 'log', 'ln', 'pow2', 'pow3', 'cbrt', 'inv', 'pi', 'e', 'abs'].map(op => (
                <button key={op} className={styles.sciBtn} onClick={() => sciOp(op)}>
                  {op === 'pow2' ? 'x²' : op === 'pow3' ? 'x³' : op === 'cbrt' ? '∛x' : op === 'inv' ? '1/x' : op === 'pi' ? 'π' : op === 'abs' ? '|x|' : op}
                </button>
              ))}
            </div>
          )}

          {mode === 'unit' && (
            <div className="flex flex-col gap-3">
              <select value={unitCat} onChange={e => setUnitCat(e.target.value)} className="w-full px-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-cyan-500 bg-slate-800 border-slate-700 text-slate-200">
                {Object.keys(UNITS).map(k => <option key={k} value={k}>{k.charAt(0).toUpperCase() + k.slice(1)}</option>)}
              </select>
              <div className="flex gap-2 items-center">
                <div className="flex-1 flex flex-col gap-1">
                  <select value={unitFrom} onChange={e => setUnitFrom(e.target.value)} className="w-full px-3 py-2 rounded-xl border text-xs outline-none focus:ring-2 focus:ring-cyan-500 bg-slate-800 border-slate-700 text-slate-200">
                    {UNITS[unitCat]?.units.map((u: string) => <option key={u} value={u}>{u}</option>)}
                  </select>
                  <input type="number" value={unitInput} onChange={e => setUnitInput(e.target.value)} className={`w-full px-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-cyan-500 ${styles.mono} bg-slate-800 border-slate-700 text-slate-200`} />
                </div>
                <button onClick={() => { setUnitFrom(unitTo); setUnitTo(unitFrom); }} className="w-8 h-8 flex items-center justify-center rounded-xl bg-cyan-500/15 border border-cyan-500/20 hover:bg-cyan-500/25 transition-colors text-cyan-400 shrink-0">
                  <i className="ri-arrow-left-right-line text-sm"></i>
                </button>
                <div className="flex-1 flex flex-col gap-1">
                  <select value={unitTo} onChange={e => setUnitTo(e.target.value)} className="w-full px-3 py-2 rounded-xl border text-xs outline-none focus:ring-2 focus:ring-cyan-500 bg-slate-800 border-slate-700 text-slate-200">
                    {UNITS[unitCat]?.units.map((u: string) => <option key={u} value={u}>{u}</option>)}
                  </select>
                  <div className={`w-full px-3 py-2 rounded-xl bg-cyan-500/8 border border-cyan-500/15 text-sm font-bold ${styles.mono} text-cyan-300`}>
                    {getUnitResult()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {mode !== 'unit' && (
            <div className="grid grid-cols-4 gap-2.5">
              <button onClick={memoryRecall} className={`${styles.btnRipple} ${styles.btnFn} h-12 rounded-2xl text-xs font-bold transition-all active:scale-95`}>MRC</button>
              <button onClick={() => handleMemory(1)} className={`${styles.btnRipple} ${styles.btnFn} h-12 rounded-2xl text-xs font-bold transition-all active:scale-95`}>M+</button>
              <button onClick={() => handleMemory(-1)} className={`${styles.btnRipple} ${styles.btnFn} h-12 rounded-2xl text-xs font-bold transition-all active:scale-95`}>M−</button>
              <button onClick={clearAll} className={`${styles.btnRipple} ${styles.btnAc} h-12 rounded-2xl font-bold transition-all active:scale-95`}>AC</button>
              
              <button onClick={deleteLast} className={`${styles.btnRipple} ${styles.btnFn} h-12 rounded-2xl font-bold transition-all active:scale-95`}><i className="ri-delete-back-2-line text-xl"></i></button>
              <button onClick={grandTotalRecall} className={`${styles.btnRipple} ${styles.btnFn} h-12 rounded-2xl font-bold text-sm transition-all active:scale-95`}>GT</button>
              <button onClick={calculateRoot} className={`${styles.btnRipple} ${styles.btnFn} h-12 rounded-2xl font-bold text-lg transition-all active:scale-95`}>√</button>
              <button onClick={calculatePercentage} className={`${styles.btnRipple} ${styles.btnFn} h-12 rounded-2xl font-bold text-sm transition-all active:scale-95`}>%</button>
              
              <button onClick={() => appendNumber('7')} className={`${styles.btnRipple} ${styles.btnNum} h-12 rounded-2xl text-lg font-semibold transition-all active:scale-95`}>7</button>
              <button onClick={() => appendNumber('8')} className={`${styles.btnRipple} ${styles.btnNum} h-12 rounded-2xl text-lg font-semibold transition-all active:scale-95`}>8</button>
              <button onClick={() => appendNumber('9')} className={`${styles.btnRipple} ${styles.btnNum} h-12 rounded-2xl text-lg font-semibold transition-all active:scale-95`}>9</button>
              <button onClick={() => appendOperator('/')} className={`${styles.btnRipple} ${styles.btnOp} h-12 rounded-2xl font-bold text-xl transition-all active:scale-95`}>÷</button>
              
              <button onClick={() => appendNumber('4')} className={`${styles.btnRipple} ${styles.btnNum} h-12 rounded-2xl text-lg font-semibold transition-all active:scale-95`}>4</button>
              <button onClick={() => appendNumber('5')} className={`${styles.btnRipple} ${styles.btnNum} h-12 rounded-2xl text-lg font-semibold transition-all active:scale-95`}>5</button>
              <button onClick={() => appendNumber('6')} className={`${styles.btnRipple} ${styles.btnNum} h-12 rounded-2xl text-lg font-semibold transition-all active:scale-95`}>6</button>
              <button onClick={() => appendOperator('*')} className={`${styles.btnRipple} ${styles.btnOp} h-12 rounded-2xl font-bold text-xl transition-all active:scale-95`}>×</button>
              
              <button onClick={() => appendNumber('1')} className={`${styles.btnRipple} ${styles.btnNum} h-12 rounded-2xl text-lg font-semibold transition-all active:scale-95`}>1</button>
              <button onClick={() => appendNumber('2')} className={`${styles.btnRipple} ${styles.btnNum} h-12 rounded-2xl text-lg font-semibold transition-all active:scale-95`}>2</button>
              <button onClick={() => appendNumber('3')} className={`${styles.btnRipple} ${styles.btnNum} h-12 rounded-2xl text-lg font-semibold transition-all active:scale-95`}>3</button>
              <button onClick={() => appendOperator('-')} className={`${styles.btnRipple} ${styles.btnOp} h-12 rounded-2xl font-bold text-xl transition-all active:scale-95`}>−</button>
              
              <button onClick={() => appendNumber('.')} className={`${styles.btnRipple} ${styles.btnNum} h-12 rounded-2xl text-xl font-bold transition-all active:scale-95`}>.</button>
              <button onClick={() => appendNumber('0')} className={`${styles.btnRipple} ${styles.btnNum} h-12 rounded-2xl text-lg font-semibold transition-all active:scale-95`}>0</button>
              <button onClick={toggleSign} className={`${styles.btnRipple} ${styles.btnFn} h-12 rounded-2xl font-bold text-sm transition-all active:scale-95`}>+/−</button>
              <button onClick={() => appendOperator('+')} className={`${styles.btnRipple} ${styles.btnOp} h-12 rounded-2xl font-bold text-xl transition-all active:scale-95`}>+</button>
              
              <button onClick={() => calculate(false)} className={`${styles.btnRipple} ${styles.btnEq} col-span-4 h-12 rounded-2xl text-white font-bold text-2xl transition-all active:scale-[.98]`}>=</button>
            </div>
          )}
        </div>

        {/* History Sidebar */}
        {historyOpen && (
          <div className={`w-full lg:w-72 ${styles.glass} rounded-[2rem] shadow-xl p-5 flex flex-col gap-4 max-h-[480px]`}>
            <div className="flex items-center justify-between border-b pb-3 border-black/8 text-slate-300">
              <span className="font-bold text-sm flex items-center gap-2"><i className="ri-history-line"></i> History</span>
              <div className="flex gap-3">
                <button onClick={() => { navigator.clipboard.writeText(historyList.map(h => `${h.calc} = ${h.result}`).join('\n')); showToast('📋 Copied!'); }} className="text-xs font-semibold hover:underline text-cyan-400">Copy All</button>
                <button onClick={() => { setHistoryList([]); localStorage.removeItem('calcHistory'); showToast('🗑️ Cleared'); }} className="text-xs font-semibold hover:underline text-rose-400">Clear</button>
              </div>
            </div>
            <div className={`flex-1 overflow-y-auto pr-1 flex flex-col gap-1 ${styles.customScroll}`}>
              {historyList.length === 0 ? (
                <div className="text-xs text-slate-500 italic text-center py-10">No calculations yet</div>
              ) : (
                historyList.map((item, idx) => (
                  <div key={idx} onClick={() => { if (item.result !== 'Error') { setCurrentInput(item.result); setShouldReset(true); } }} className="flex flex-col items-end gap-0.5 px-2 py-2 rounded-xl cursor-pointer hover:bg-slate-800/50 transition">
                    <span className={`text-[10px] ${styles.mono} truncate w-full text-right text-slate-400`}>{item.calc} =</span>
                    <span className={`text-sm font-bold ${styles.mono} text-slate-200`}>{item.result}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 transition-all duration-300 bg-white text-slate-900 ${toast.show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <i className="ri-checkbox-circle-fill text-emerald-400 text-lg"></i>
        <span className="text-[11px] font-bold uppercase tracking-widest">{toast.msg}</span>
      </div>
    </div>
  );
}
