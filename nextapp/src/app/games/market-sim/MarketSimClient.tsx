'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import BackButton from '@/components/BackButton/BackButton';
import styles from './market.module.css';

interface Asset {
  name: string;
  cat: string;
  base: number;
  vol: number;
  currency: string;
}

const ASSETS: Record<string, Asset> = {
  'BTC': { name: 'Bitcoin', cat: 'Crypto', base: 65000, vol: 0.028, currency: '$' },
  'ETH': { name: 'Ethereum', cat: 'Crypto', base: 3200, vol: 0.030, currency: '$' },
  'SOL': { name: 'Solana', cat: 'Crypto', base: 140, vol: 0.040, currency: '$' },
  'BNB': { name: 'BNB', cat: 'Crypto', base: 580, vol: 0.025, currency: '$' },
  'DOGE': { name: 'Dogecoin', cat: 'Crypto', base: 0.15, vol: 0.055, currency: '$' },
  'XRP': { name: 'XRP', cat: 'Crypto', base: 0.60, vol: 0.038, currency: '$' },
  'AAPL': { name: 'Apple', cat: 'Stock', base: 185, vol: 0.012, currency: '$' },
  'TSLA': { name: 'Tesla', cat: 'Stock', base: 175, vol: 0.032, currency: '$' },
  'NVDA': { name: 'Nvidia', cat: 'Stock', base: 870, vol: 0.028, currency: '$' },
  'GOOGL': { name: 'Google', cat: 'Stock', base: 165, vol: 0.015, currency: '$' },
  'MSFT': { name: 'Microsoft', cat: 'Stock', base: 420, vol: 0.013, currency: '$' },
  'REL': { name: 'Reliance', cat: 'Stock', base: 2850, vol: 0.014, currency: '₹' },
  'TCS': { name: 'TCS', cat: 'Stock', base: 3900, vol: 0.012, currency: '₹' },
  'GOLD': { name: 'Gold', cat: 'Commodity', base: 2350, vol: 0.008, currency: '$' },
  'SILVER': { name: 'Silver', cat: 'Commodity', base: 28, vol: 0.018, currency: '$' },
  'OIL': { name: 'Crude Oil', cat: 'Commodity', base: 78, vol: 0.022, currency: '$' },
  'EURUSD': { name: 'EUR/USD', cat: 'Forex', base: 1.085, vol: 0.005, currency: '' },
  'GBPUSD': { name: 'GBP/USD', cat: 'Forex', base: 1.265, vol: 0.006, currency: '' },
  'USDJPY': { name: 'USD/JPY', cat: 'Forex', base: 149, vol: 0.005, currency: '' },
};

const TF_CFG: Record<string, { ms: number; src: 'm1' | 'h1'; period: number }> = {
  '1m': { ms: 60e3, src: 'm1', period: 1 },
  '5m': { ms: 5 * 60e3, src: 'm1', period: 5 },
  '15m': { ms: 15 * 60e3, src: 'm1', period: 15 },
  '1h': { ms: 3600e3, src: 'h1', period: 1 },
  '4h': { ms: 4 * 3600e3, src: 'h1', period: 4 },
  '1d': { ms: 864e5, src: 'h1', period: 24 },
};

function gaussRand() {
  let u = 0, v = 0;
  while (!u) u = Math.random();
  while (!v) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

interface Candle {
  t: number; o: number; h: number; l: number; c: number; vol: number;
}

function genBase(sym: string, n: number, msPerCandle: number) {
  const a = ASSETS[sym];
  let price = a.base;
  const now = Math.floor(Date.now() / msPerCandle) * msPerCandle;
  const arr: Candle[] = [];
  for (let i = n; i >= 0; i--) {
    const t = now - i * msPerCandle;
    const sigma = a.vol * Math.sqrt(msPerCandle / 864e5);
    const o = price;
    const c = o * Math.exp(0.00005 + sigma * gaussRand());
    const wick = Math.abs(c - o) * (0.3 + Math.random());
    const h = Math.max(o, c) + Math.random() * wick;
    const l = Math.min(o, c) - Math.random() * wick;
    const vol = (Math.random() * 900 + 100) * (1 + Math.abs((c - o) / o) * 50);
    arr.push({ t, o, h, l, c, vol });
    price = c;
  }
  return arr;
}

function aggregate(base: Candle[], period: number) {
  const out: Candle[] = [];
  for (let i = 0; i + period <= base.length; i += period) {
    const grp = base.slice(i, i + period);
    out.push({
      t: grp[0].t,
      o: grp[0].o,
      h: Math.max(...grp.map(c => c.h)),
      l: Math.min(...grp.map(c => c.l)),
      c: grp[grp.length - 1].c,
      vol: grp.reduce((s, c) => s + c.vol, 0)
    });
  }
  const leftover = base.length % period;
  if (leftover > 0) {
    const grp = base.slice(base.length - leftover);
    out.push({
      t: grp[0].t,
      o: grp[0].o,
      h: Math.max(...grp.map(c => c.h)),
      l: Math.min(...grp.map(c => c.l)),
      c: grp[grp.length - 1].c,
      vol: grp.reduce((s, c) => s + c.vol, 0)
    });
  }
  return out;
}

export default function MarketSimClient() {
  const [isClient, setIsClient] = useState(false);
  
  const mainCvsRef = useRef<HTMLCanvasElement>(null);
  const rsiCvsRef = useRef<HTMLCanvasElement>(null);
  const ovCvsRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const [sym, setSym] = useState('BTC');
  const [searchQ, setSearchQ] = useState('');
  const [tf, setTf] = useState('15m');
  const [drawTool, setDrawTool] = useState('none');
  const [orderSide, setOrderSide] = useState<'buy'|'sell'>('buy');
  
  const [indicators, setIndicators] = useState({ ema9: true, ema21: true, ema50: false, vol: true, rsi: true });
  
  // Wallet / Positions / History State
  const [wallet, setWallet] = useState(100000);
  const [positions, setPositions] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);

  // UI state
  const [toast, setToast] = useState<{msg: string, visible: boolean}>({msg: '', visible: false});
  const [modal, setModal] = useState<{type: 'deposit' | 'reset' | null}>({type: null});
  
  const [qty, setQty] = useState<string>('1');
  const [orderType, setOrderType] = useState('market');
  const [limitPrice, setLimitPrice] = useState<string>('');

  // Simulation data (refs for performance)
  const g = useRef({
    baseData: {} as Record<string, { m1: Candle[]; h1: Candle[] }>,
    tfCache: {} as Record<string, Candle[]>,
    simClock: Date.now(),
    offset: 0,
    barsToShow: 80,
    yOffset: null as number | null,
    yScale: null as number | null,
    drawings: [] as any[],
    planEntry: null as number | null,
    planSL: null as number | null,
    planTP: null as number | null,
    crossPrice: 0,
    crossX: 0,
    crossY: 0,
    rafPending: false,
    
    // Interactions
    isPanning: false,
    panStart: null as any,
    isDragging: false,
    drawStart: null as any,
    
    yAxisDrag: null as any,
    xAxisDrag: null as any,
    
    lastC: 0
  });

  // Load from local storage
  useEffect(() => {
    setIsClient(true);
    const savedWallet = localStorage.getItem('trade-wallet');
    if (savedWallet) setWallet(parseFloat(savedWallet));
    
    const savedPos = localStorage.getItem('trade-pos');
    if (savedPos) setPositions(JSON.parse(savedPos));
    
    const savedHist = localStorage.getItem('trade-hist');
    if (savedHist) setHistory(JSON.parse(savedHist));
    
    const savedPending = localStorage.getItem('trade-pending');
    if (savedPending) setPendingOrders(JSON.parse(savedPending));
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem('trade-wallet', wallet.toString());
    localStorage.setItem('trade-pos', JSON.stringify(positions.slice(0, 50)));
    localStorage.setItem('trade-hist', JSON.stringify(history.slice(0, 100)));
    localStorage.setItem('trade-pending', JSON.stringify(pendingOrders));
  }, [wallet, positions, history, pendingOrders, isClient]);

  const showToastMsg = useCallback((msg: string) => {
    setToast({ msg, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 2800);
  }, []);

  const ensureBase = useCallback((s: string) => {
    if (!g.current.baseData[s]) {
      const m1 = genBase(s, 4500, 60e3);
      const h1 = genBase(s, 720, 3600e3);
      const scale = m1[m1.length - 1].c / h1[h1.length - 1].c;
      h1.forEach(c => { c.o *= scale; c.h *= scale; c.l *= scale; c.c *= scale; });
      g.current.baseData[s] = { m1, h1 };
      if (Object.keys(g.current.baseData).length === 1) {
        g.current.simClock = m1[m1.length - 1].t + 55000;
      }
    }
  }, []);

  const getCandles = useCallback(() => {
    ensureBase(sym);
    const key = sym + tf;
    if (!g.current.tfCache[key]) {
      const cfg = TF_CFG[tf];
      const base = g.current.baseData[sym][cfg.src];
      g.current.tfCache[key] = cfg.period === 1 ? [...base] : aggregate(base, cfg.period);
    }
    return g.current.tfCache[key];
  }, [sym, tf, ensureBase]);

  const resizeCanvases = useCallback(() => {
    if (!wrapRef.current || !mainCvsRef.current || !ovCvsRef.current || !rsiCvsRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    const rsiH = indicators.rsi ? 80 : 0;
    
    rsiCvsRef.current.style.display = indicators.rsi ? 'block' : 'none';
    
    mainCvsRef.current.width = ovCvsRef.current.width = r.width;
    mainCvsRef.current.height = r.height - rsiH;
    
    rsiCvsRef.current.width = r.width;
    rsiCvsRef.current.height = rsiH;
    
    ovCvsRef.current.style.height = (r.height - rsiH) + 'px';
    ovCvsRef.current.height = r.height - rsiH;

    scheduleRender();
  }, [indicators.rsi]);

  useEffect(() => {
    window.addEventListener('resize', resizeCanvases);
    // Initial resize delay to ensure DOM is ready
    setTimeout(resizeCanvases, 50);
    return () => window.removeEventListener('resize', resizeCanvases);
  }, [resizeCanvases]);

  const calcViewport = useCallback((vis: Candle[], ch: number) => {
    const autoHi = Math.max(...vis.map(c => c.h));
    const autoLo = Math.min(...vis.map(c => c.l));
    const autoMargin = (autoHi - autoLo) * 0.05 || autoHi * 0.01;

    if (g.current.yOffset === null && g.current.yScale === null) {
      const hiP = autoHi + autoMargin;
      const loP = autoLo - autoMargin;
      return { loP, priceRange: hiP - loP || 1 };
    } else {
      const baseRange = (autoHi + autoMargin) - (autoLo - autoMargin) || 1;
      const scale = g.current.yScale !== null ? g.current.yScale : 1.0;
      const off = g.current.yOffset !== null ? g.current.yOffset : 0;
      const centrePrice = (autoHi + autoLo) / 2 + off;
      const halfRange = (baseRange / 2) * scale;
      return { loP: centrePrice - halfRange, priceRange: halfRange * 2 || 1 };
    }
  }, []);

  const getViewportState = useCallback(() => {
    const arr = getCandles();
    if (!mainCvsRef.current) return null;
    const cw = mainCvsRef.current.width, ch = mainCvsRef.current.height;
    const PAD = { t: 24, r: 80, b: 28, l: 8 };
    const cW = cw - PAD.l - PAD.r;
    const visible = Math.max(10, Math.min(g.current.barsToShow, arr.length));
    const startIdx = Math.max(0, arr.length - visible - Math.floor(g.current.offset));
    const vis = arr.slice(startIdx, startIdx + visible);
    if (!vis.length) return null;
    const { loP, priceRange } = calcViewport(vis, ch);
    return { arr, vis, visible, startIdx, cW, ch, loP, priceRange, bw: Math.max(1, cW / visible - 1.5), PAD };
  }, [getCandles, calcViewport]);

  const fmtP = useCallback((p: number | undefined) => {
    if (p === undefined || isNaN(p)) return '—';
    const ap = Math.abs(p);
    const a = ASSETS[sym];
    if (a && a.cat === 'Forex') {
      return sym === 'USDJPY' ? p.toFixed(2) : p.toFixed(4);
    }
    if (ap < 0.01) return p.toFixed(6);
    if (ap < 1) return p.toFixed(4);
    if (ap < 100) return p.toFixed(2);
    if (ap < 10000) return p.toFixed(2);
    return p.toFixed(0);
  }, [sym]);

  const fmtT = useCallback((ts: number) => {
    const d = new Date(ts);
    if (tf === '1d') return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
    if (tf === '4h') return (d.getMonth() + 1) + '/' + (d.getDate()) + ' ' + d.getHours().toString().padStart(2, '0') + 'h';
    if (tf === '1h') return (d.getMonth() + 1) + '/' + (d.getDate()) + ' ' + d.getHours().toString().padStart(2, '0') + ':00';
    return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
  }, [tf]);

  const drawEMA = useCallback((ctx: CanvasRenderingContext2D, closes: number[], period: number, color: string, vis: Candle[], startIdx: number, cW: number, visible: number, ch: number, lo: number, priceRange: number, bw: number, cw: number, PAD: any) => {
    const mult = 2 / (period + 1); 
    let ema = closes[0];
    const emaArr = closes.map(v => { ema = v * mult + ema * (1 - mult); return ema; });
    
    const visEma = emaArr.slice(startIdx, startIdx + visible);
    ctx.strokeStyle = color; ctx.lineWidth = 1.2; ctx.setLineDash([]);
    ctx.beginPath();
    visEma.forEach((v, i) => {
      const x = PAD.l + i * (cW / visible) + (cW / visible) / 2;
      const y = PAD.t + (1 - (v - lo) / priceRange) * (ch - PAD.t - PAD.b);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
  }, []);

  const renderRSI = useCallback((closes: number[], PAD: any) => {
    const rsiCvs = rsiCvsRef.current;
    if (!rsiCvs) return;
    const rctx = rsiCvs.getContext('2d');
    if (!rctx) return;

    const rw = rsiCvs.width, rh = rsiCvs.height;
    rctx.fillStyle = '#060b14'; rctx.fillRect(0, 0, rw, rh);
    rctx.strokeStyle = 'rgba(34,211,238,0.06)'; rctx.lineWidth = 0.5;
    
    [30, 50, 70].forEach(v => {
      const y = rh - (v / 100) * rh;
      rctx.beginPath(); rctx.moveTo(0, y); rctx.lineTo(rw - PAD.r, y); rctx.stroke();
      rctx.fillStyle = 'rgba(148,163,184,0.3)'; rctx.font = '9px JetBrains Mono'; rctx.textAlign = 'right';
      rctx.fillText(v.toString(), rw - 2, y + 3);
    });

    // Calc RSI
    const period = 14;
    let gains = 0, losses = 0;
    for (let i = 1; i <= period; i++) { 
      const d = closes[i] - closes[i - 1]; 
      if (d > 0) gains += d; else losses -= d; 
    }
    let ag = gains / period, al = losses / period;
    const rsiArr = [50];
    for (let i = period + 1; i < closes.length; i++) {
      const d = closes[i] - closes[i - 1];
      ag = (ag * (period - 1) + (d > 0 ? d : 0)) / period;
      al = (al * (period - 1) + (d < 0 ? -d : 0)) / period;
      rsiArr.push(al === 0 ? 100 : 100 - 100 / (1 + ag / al));
    }

    const visible = Math.min(g.current.barsToShow, rsiArr.length);
    const startIdx = Math.max(0, rsiArr.length - visible - Math.floor(g.current.offset));
    const vis = rsiArr.slice(startIdx, startIdx + visible);
    const cW = rw - PAD.l - PAD.r;
    
    rctx.strokeStyle = '#818cf8'; rctx.lineWidth = 1.5; rctx.beginPath();
    vis.forEach((v, i) => {
      const x = PAD.l + i * (cW / visible) + (cW / visible) / 2;
      const y = rh - (v / 100) * rh;
      i === 0 ? rctx.moveTo(x, y) : rctx.lineTo(x, y);
    });
    rctx.stroke();
    rctx.fillStyle = 'rgba(239,68,68,0.07)'; rctx.fillRect(0, 0, rw - PAD.r, rh * (1 - 70 / 100));
    rctx.fillStyle = 'rgba(16,185,129,0.07)'; rctx.fillRect(0, rh * (1 - 30 / 100), rw - PAD.r, rh * 30 / 100);
    rctx.fillStyle = 'rgba(129,140,248,0.6)'; rctx.font = 'bold 9px Inter'; rctx.textAlign = 'left';
    rctx.fillText('RSI 14', 10, 10);
  }, []);

  const renderDrawings = useCallback((ctx: CanvasRenderingContext2D, vs: any) => {
    const { arr, startIdx, cW, visible, ch, loP, priceRange, bw, PAD } = vs;
    const px = (p: number) => PAD.t + (1 - (p - loP) / priceRange) * (ch - PAD.t - PAD.b);
    const tx = (t: number) => {
      let best = startIdx, bestDiff = Infinity;
      for (let i = startIdx; i < startIdx + visible && i < arr.length; i++) {
        const d = Math.abs(arr[i].t - t);
        if (d < bestDiff) { bestDiff = d; best = i; }
      }
      return PAD.l + (best - startIdx) * (cW / visible) + (cW / visible) / 2;
    };

    g.current.drawings.forEach(d => {
      ctx.save();
      if (['hline', 'entry', 'sl', 'tp'].includes(d.type)) {
        const y = px(d.price);
        if (y < PAD.t - 10 || y > ch + 10) { ctx.restore(); return; }
        const col = d.type === 'sl' ? '#ef4444' : d.type === 'tp' ? '#fbbf24' : d.type === 'entry' ? '#10b981' : '#94a3b8';
        ctx.strokeStyle = col; ctx.lineWidth = 1.5;
        ctx.setLineDash(d.type === 'hline' ? [5, 5] : []);
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(ctx.canvas.width - PAD.r, y); ctx.stroke();
        ctx.fillStyle = col; ctx.font = 'bold 9px Inter'; ctx.textAlign = 'left';
        ctx.fillText(d.type.toUpperCase() + ' ' + fmtP(d.price), 4, y - 3);
        ctx.setLineDash([]);
      }
      
      if (d.type === 'trendline') {
        const y1 = px(d.p1), y2 = px(d.p2);
        const x1 = d.t1 !== undefined ? tx(d.t1) : (PAD.l + (d.x1 - startIdx) * (cW / visible) + (cW / visible) / 2);
        const x2 = d.t2 !== undefined ? tx(d.t2) : (PAD.l + (d.x2 - startIdx) * (cW / visible) + (cW / visible) / 2);
        ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 1.5; ctx.setLineDash([]);
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        ctx.fillStyle = '#22d3ee';
        ctx.beginPath(); ctx.arc(x1, y1, 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x2, y2, 3, 0, Math.PI * 2); ctx.fill();
      }
      
      if (d.type === 'longsetup' || d.type === 'shortsetup') {
        const isLong = d.type === 'longsetup';
        const ye = px(d.entry), ys = px(d.sl), yt = px(d.tp);
        const x0 = d.t !== undefined ? tx(d.t) : PAD.l;
        const x1 = ctx.canvas.width - PAD.r;
        
        const slTop = Math.min(ye, ys), slBot = Math.max(ye, ys);
        ctx.fillStyle = 'rgba(239,68,68,0.12)';
        ctx.fillRect(x0, px(slTop < ys ? ys : slTop), x1 - x0, Math.abs(ye - ys));
        
        const tpTop = Math.min(ye, yt), tpBot = Math.max(ye, yt);
        ctx.fillStyle = 'rgba(16,185,129,0.12)';
        ctx.fillRect(x0, px(tpBot > yt ? yt : tpTop), x1 - x0, Math.abs(yt - ye));
        
        ctx.strokeStyle = '#10b981'; ctx.lineWidth = 1.5; ctx.setLineDash([]);
        ctx.beginPath(); ctx.moveTo(x0, ye); ctx.lineTo(x1, ye); ctx.stroke();
        
        ctx.strokeStyle = '#ef4444'; ctx.setLineDash([4, 3]);
        ctx.beginPath(); ctx.moveTo(x0, ys); ctx.lineTo(x1, ys); ctx.stroke();
        
        ctx.strokeStyle = '#fbbf24'; ctx.setLineDash([4, 3]);
        ctx.beginPath(); ctx.moveTo(x0, yt); ctx.lineTo(x1, yt); ctx.stroke();
        ctx.setLineDash([]);
        
        const risk = Math.abs(d.entry - d.sl);
        const reward = Math.abs(d.tp - d.entry);
        const rr = risk > 0 ? (reward / risk).toFixed(1) : '?';
        
        ctx.font = 'bold 9px Inter'; ctx.textAlign = 'left';
        ctx.fillStyle = '#10b981'; ctx.fillText((isLong ? '▲ LONG' : '▼ SHORT') + ' E:' + fmtP(d.entry), x0 + 4, ye - 3);
        ctx.fillStyle = '#ef4444'; ctx.fillText('SL:' + fmtP(d.sl), x0 + 4, ys + 9);
        ctx.fillStyle = '#fbbf24'; ctx.fillText('TP:' + fmtP(d.tp), x0 + 4, yt - 3);
        ctx.fillStyle = parseFloat(rr) >= 2 ? '#10b981' : '#fbbf24';
        ctx.textAlign = 'right';
        ctx.fillText('R:R 1:' + rr, x1 - 4, ye - 3);
      }
      ctx.restore();
    });

    // Preview
    if (g.current.isDragging && g.current.drawStart) {
      const { x: sx, y: sy, price: sPrice } = g.current.drawStart;
      const { crossX: cx, crossY: cy } = g.current;
      
      if (drawTool === 'trendline') {
        ctx.strokeStyle = 'rgba(34,211,238,0.5)'; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(cx, cy); ctx.stroke();
        ctx.setLineDash([]);
      }
      if (drawTool === 'long' || drawTool === 'short') {
        const isLong = drawTool === 'long';
        const ye = sy, ys = cy;
        const x0 = sx, x1 = ctx.canvas.width - PAD.r;
        const slP = loP + (1 - (cy - PAD.t) / (ch - PAD.t - PAD.b)) * priceRange; // canvasPrice
        
        const risk = Math.abs(sPrice - slP);
        const tpP = isLong ? sPrice + risk * 2 : sPrice - risk * 2;
        const yt = px(tpP);
        
        ctx.fillStyle = 'rgba(239,68,68,0.10)'; ctx.fillRect(x0, Math.min(ye, ys), x1 - x0, Math.abs(ye - ys));
        ctx.fillStyle = 'rgba(16,185,129,0.10)'; ctx.fillRect(x0, Math.min(ye, yt), x1 - x0, Math.abs(ye - yt));
        
        ctx.strokeStyle = '#10b981'; ctx.lineWidth = 1.5; ctx.setLineDash([]);
        ctx.beginPath(); ctx.moveTo(x0, ye); ctx.lineTo(x1, ye); ctx.stroke();
        
        ctx.strokeStyle = '#ef4444'; ctx.setLineDash([4, 3]);
        ctx.beginPath(); ctx.moveTo(x0, ys); ctx.lineTo(x1, ys); ctx.stroke();
        
        ctx.strokeStyle = '#fbbf24'; ctx.setLineDash([4, 3]);
        ctx.beginPath(); ctx.moveTo(x0, yt); ctx.lineTo(x1, yt); ctx.stroke();
        
        ctx.setLineDash([]);
        ctx.fillStyle = '#a5b4fc'; ctx.font = 'bold 9px Inter'; ctx.textAlign = 'left';
        ctx.fillText('R:R 1:2.0 (drag to adjust SL)', x0 + 4, ye - 4);
      }
    }
  }, [fmtP, drawTool]);

  const renderAll = useCallback(() => {
    if (!mainCvsRef.current || !ovCvsRef.current) return;
    const mctx = mainCvsRef.current.getContext('2d');
    const octx = ovCvsRef.current.getContext('2d');
    if (!mctx || !octx) return;

    const vs = getViewportState();
    if (!vs) return;

    const { arr, vis, visible, startIdx, cW, ch, loP, priceRange, bw, PAD } = vs;
    const cw = mainCvsRef.current.width;
    const px = (p: number) => PAD.t + (1 - (p - loP) / priceRange) * (ch - PAD.t - PAD.b);

    mctx.fillStyle = '#060b14'; mctx.fillRect(0, 0, cw, ch);

    const GRID_LINES = 8;
    mctx.strokeStyle = 'rgba(34,211,238,0.06)'; mctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID_LINES; i++) {
      const y = PAD.t + i * (ch - PAD.t - PAD.b) / GRID_LINES;
      mctx.beginPath(); mctx.moveTo(PAD.l, y); mctx.lineTo(cw - PAD.r, y); mctx.stroke();
      const price = loP + (1 - i / GRID_LINES) * priceRange;
      mctx.fillStyle = 'rgba(203,213,225,0.65)';
      mctx.font = 'bold 11px JetBrains Mono'; mctx.textAlign = 'right';
      mctx.fillText(fmtP(price), cw - 4, y + 4);
    }

    if (indicators.vol) {
      const maxVol = Math.max(...vis.map(c => c.vol));
      const volH = (ch - PAD.t - PAD.b) * 0.15;
      vis.forEach((c, i) => {
        const x = PAD.l + i * (cW / visible) + (cW / visible - bw) / 2;
        const h = (c.vol / maxVol) * volH;
        mctx.fillStyle = c.c >= c.o ? 'rgba(16,185,129,0.18)' : 'rgba(239,68,68,0.18)';
        mctx.fillRect(x, ch - PAD.b - h, bw, h);
      });
    }

    vis.forEach((c, i) => {
      const x = PAD.l + i * (cW / visible) + (cW / visible - bw) / 2;
      const bull = c.c >= c.o;
      const col = bull ? '#10b981' : '#ef4444';
      const cy = px(c.c), oy = px(c.o);
      mctx.strokeStyle = col; mctx.lineWidth = Math.max(1, bw * 0.15);
      mctx.beginPath(); mctx.moveTo(x + bw / 2, px(c.h)); mctx.lineTo(x + bw / 2, px(c.l)); mctx.stroke();
      mctx.fillStyle = bull ? 'rgba(16,185,129,0.9)' : 'rgba(239,68,68,0.9)';
      const top = Math.min(cy, oy), h = Math.max(Math.abs(cy - oy), 1);
      mctx.fillRect(x, top, Math.max(bw, 1), h);
    });

    const closes = arr.map(c => c.c);
    if (indicators.ema9) drawEMA(mctx, closes, 9, '#a5b4fc', vis, startIdx, cW, visible, ch, loP, priceRange, bw, cw, PAD);
    if (indicators.ema21) drawEMA(mctx, closes, 21, '#fbbf24', vis, startIdx, cW, visible, ch, loP, priceRange, bw, cw, PAD);
    if (indicators.ema50) drawEMA(mctx, closes, 50, '#f472b6', vis, startIdx, cW, visible, ch, loP, priceRange, bw, cw, PAD);

    octx.clearRect(0, 0, ovCvsRef.current.width, ovCvsRef.current.height);
    renderDrawings(octx, vs);

    if (indicators.rsi) renderRSI(closes, PAD);

    const lastC = arr[arr.length - 1].c;
    g.current.lastC = lastC;
    const ly = px(lastC);
    mctx.fillStyle = '#22d3ee'; mctx.fillRect(cw - PAD.r, ly - 10, PAD.r - 2, 20);
    mctx.fillStyle = '#060b14'; mctx.font = 'bold 11px JetBrains Mono'; mctx.textAlign = 'center';
    mctx.fillText(fmtP(lastC), cw - PAD.r / 2 - 1, ly + 4);

    mctx.fillStyle = 'rgba(34,211,238,0.6)';
    mctx.font = 'bold 11px JetBrains Mono'; mctx.textAlign = 'right';
    
    // Countdown
    const tfMs = TF_CFG[tf].ms;
    const rem = Math.max(0, tfMs - (g.current.simClock - lastC));
    const h = Math.floor(rem / 3600000);
    const m = Math.floor((rem % 3600000) / 60000);
    const s = Math.floor((rem % 60000) / 1000);
    const cd = h > 0 ? `${h}h ${m}m` : (m > 0 ? `${m}m ` : '') + `${s}s`;
    
    mctx.fillText('\u23F1 ' + cd, cw - PAD.r - 6, PAD.t - 6);

    const isYManual = g.current.yOffset !== null || g.current.yScale !== null;
    mctx.fillStyle = isYManual ? 'rgba(34,211,238,0.35)' : 'rgba(148,163,184,0.15)';
    mctx.font = '9px Inter'; mctx.textAlign = 'right';
    mctx.fillText(isYManual ? '\u2195 dbl-click Y to reset' : '\u2195 drag Y axis', cw - 4, ch - PAD.b - 4);

    const timeStep = Math.max(1, Math.floor(vis.length / 7));
    mctx.fillStyle = 'rgba(203,213,225,0.55)'; mctx.font = 'bold 11px Inter'; mctx.textAlign = 'center';
    vis.forEach((c, i) => {
      if (i % timeStep !== 0) return;
      const x = PAD.l + i * (cW / visible) + (cW / visible) / 2;
      mctx.fillText(fmtT(c.t), x, ch - 6);
    });
  }, [getViewportState, indicators, fmtP, drawEMA, renderDrawings, renderRSI, fmtT, tf]);

  const scheduleRender = useCallback(() => {
    if (!g.current.rafPending) {
      g.current.rafPending = true;
      requestAnimationFrame(() => {
        g.current.rafPending = false;
        renderAll();
      });
    }
  }, [renderAll]);

  // Tick loop
  useEffect(() => {
    if (!isClient) return;

    const tickLive = () => {
      ensureBase(sym);
      g.current.simClock += 800;

      const m1 = g.current.baseData[sym].m1;
      const last1m = m1[m1.length - 1];
      const a = ASSETS[sym];
      const sigma = a.vol * Math.sqrt(60e3 / 864e5) * 0.4;
      last1m.c *= Math.exp(gaussRand() * sigma);
      last1m.h = Math.max(last1m.h, last1m.c);
      last1m.l = Math.min(last1m.l, last1m.c);
      last1m.vol += Math.random() * 10 + 5;

      const h1 = g.current.baseData[sym].h1;
      const lastH = h1[h1.length - 1];
      lastH.c = last1m.c;
      lastH.h = Math.max(lastH.h, last1m.c);
      lastH.l = Math.min(lastH.l, last1m.c);

      let invalidate = false;
      if (g.current.simClock - last1m.t >= 60e3) {
        const newT = last1m.t + 60e3;
        m1.push({ t: newT, o: last1m.c, h: last1m.c, l: last1m.c, c: last1m.c, vol: 0 });
        if (m1.length > 5000) m1.shift();
        lastH.vol += last1m.vol;
        if (g.current.simClock - lastH.t >= 3600e3) {
          const newHT = lastH.t + 3600e3;
          h1.push({ t: newHT, o: lastH.c, h: lastH.c, l: lastH.c, c: lastH.c, vol: 0 });
          if (h1.length > 1200) h1.shift();
        }
        invalidate = true;
      }

      if (invalidate) {
        Object.keys(g.current.tfCache).filter(k => k.startsWith(sym)).forEach(k => delete g.current.tfCache[k]);
      } else {
        const key = sym + tf;
        delete g.current.tfCache[key];
      }

      // Check pending orders here...
      setPendingOrders(prevPending => {
        let modified = false;
        let newPending = prevPending.filter(o => {
          if (o.sym !== sym) return true;
          const triggered = o.side === 'buy' ? last1m.c <= o.entry : last1m.c >= o.entry;
          if (!triggered) return true;
          
          const cost = o.entry * o.qty;
          setWallet(prevWallet => {
            if (o.side === 'buy' && cost > prevWallet) { 
              showToastMsg('❌ Pending order failed: Insufficient balance'); 
              return prevWallet; 
            }
            const newW = prevWallet + (o.side === 'buy' ? -cost : cost);
            
            setPositions(prevPos => [...prevPos, { sym: o.sym, side: o.side, qty: o.qty, entry: o.entry, sl: o.sl, tp: o.tp, t: Date.now() }]);
            showToastMsg(`✅ OCO triggered: ${o.side.toUpperCase()} ${o.qty} ${o.sym} @ ${fmtP(o.entry)}`);
            return newW;
          });
          modified = true;
          return false;
        });
        
        // Return unchanged if nothing happened to avoid re-renders
        return modified ? newPending : prevPending;
      });

      // Check Stop Loss / Take Profit
      setPositions(prevPos => {
        let modified = false;
        let newPos = prevPos.filter(pos => {
          if (pos.sym !== sym || !pos.sl || !pos.tp) return true;
          const slHit = pos.side === 'buy' ? last1m.c <= pos.sl : last1m.c >= pos.sl;
          const tpHit = pos.side === 'buy' ? last1m.c >= pos.tp : last1m.c <= pos.tp;
          if (slHit || tpHit) {
            const exitPrice = slHit ? pos.sl : pos.tp;
            const pnl = (exitPrice - pos.entry) * (pos.side === 'buy' ? 1 : -1) * pos.qty;
            
            setWallet(prevWallet => prevWallet + pos.qty * exitPrice);
            setHistory(prevHist => [{ sym: pos.sym, side: 'close', qty: pos.qty, entry: pos.entry, exit: exitPrice, pnl, t: Date.now() }, ...prevHist].slice(0, 100));
            showToastMsg(`${slHit ? '🛑 SL Hit' : '🎯 TP Hit'} ${pos.sym} | PnL: ${pnl >= 0 ? '+' : ''}${fmtP(pnl)}`);
            modified = true;
            return false;
          }
          return true;
        });
        return modified ? newPos : prevPos;
      });

      scheduleRender();
    };

    const interval = setInterval(tickLive, 800);
    return () => clearInterval(interval);
  }, [sym, tf, ensureBase, scheduleRender, showToastMsg, fmtP, isClient]);

  const canvasPrice = useCallback((y: number) => {
    const vs = getViewportState();
    if (!vs) return 0;
    return vs.loP + (1 - (y - vs.PAD.t) / (vs.ch - vs.PAD.t - vs.PAD.b)) * vs.priceRange;
  }, [getViewportState]);

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (!ovCvsRef.current) return;
    const r = ovCvsRef.current.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    
    const mx = clientX - r.left;
    const my = clientY - r.top;
    const price = canvasPrice(my);
    const vs = getViewportState();
    if (!vs) return;
    
    const candleIdx = vs.startIdx + Math.floor((mx - vs.PAD.l) / vs.cW * vs.visible);
    const candleTime = (vs.arr[candleIdx] || vs.arr[vs.arr.length - 1]).t;

    if (drawTool === 'none') {
      g.current.isPanning = true;
      g.current.panStart = { x: clientX, off: g.current.offset };
      return;
    }
    
    if (drawTool === 'hline') {
      g.current.drawings.push({ type: 'hline', price });
      scheduleRender(); return;
    }
    
    if (drawTool === 'entry') {
      g.current.planEntry = price;
      g.current.drawings = g.current.drawings.filter(d => d.type !== 'entry');
      g.current.drawings.push({ type: 'entry', price });
      scheduleRender(); return;
    }
    
    if (drawTool === 'sl') {
      g.current.planSL = price;
      g.current.drawings = g.current.drawings.filter(d => d.type !== 'sl');
      g.current.drawings.push({ type: 'sl', price });
      scheduleRender(); return;
    }
    
    if (drawTool === 'tp') {
      g.current.planTP = price;
      g.current.drawings = g.current.drawings.filter(d => d.type !== 'tp');
      g.current.drawings.push({ type: 'tp', price });
      scheduleRender(); return;
    }
    
    if (drawTool === 'trendline' || drawTool === 'long' || drawTool === 'short') {
      g.current.isDragging = true;
      g.current.drawStart = { x: mx, y: my, price, t: candleTime, idx: candleIdx };
    }
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!ovCvsRef.current) return;
    const r = ovCvsRef.current.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    
    const mx = clientX - r.left;
    const my = clientY - r.top;
    
    g.current.crossPrice = canvasPrice(my);
    g.current.crossX = mx;
    g.current.crossY = my;

    if (g.current.isPanning && drawTool === 'none' && g.current.panStart) {
      const vs = getViewportState();
      if (!vs) return;
      const dx = clientX - g.current.panStart.x;
      const barsPerPx = g.current.barsToShow / (mainCvsRef.current!.width - vs.PAD.l - vs.PAD.r);
      g.current.offset = Math.max(0, Math.min(vs.arr.length - 10, g.current.panStart.off + dx * barsPerPx));
      scheduleRender();
      return;
    }

    const octx = ovCvsRef.current.getContext('2d');
    if (octx) {
      octx.clearRect(0, 0, ovCvsRef.current.width, ovCvsRef.current.height);
      octx.strokeStyle = 'rgba(148,163,184,0.25)'; octx.lineWidth = 0.5; octx.setLineDash([4, 4]);
      octx.beginPath(); octx.moveTo(mx, 0); octx.lineTo(mx, ovCvsRef.current.height); octx.stroke();
      octx.beginPath(); octx.moveTo(0, my); octx.lineTo(ovCvsRef.current.width, my); octx.stroke();
      octx.setLineDash([]);
      
      const vs = getViewportState();
      if (vs) renderDrawings(octx, vs);
    }
  };

  const handlePointerUp = (e: React.MouseEvent | React.TouchEvent) => {
    if (drawTool === 'trendline' && g.current.isDragging && g.current.drawStart) {
      if (!ovCvsRef.current) return;
      const r = ovCvsRef.current.getBoundingClientRect();
      let clientY;
      if ('changedTouches' in e) {
        clientY = e.changedTouches[0].clientY;
      } else {
        clientY = (e as React.MouseEvent).clientY;
      }
      
      const my = clientY - r.top;
      const price2 = canvasPrice(my);
      const vs = getViewportState();
      if (vs) {
        // approximate time
        const t2 = vs.arr[vs.arr.length - 1].t;
        g.current.drawings.push({ type: 'trendline', p1: g.current.drawStart.price, p2: price2, t1: g.current.drawStart.t, t2 });
        scheduleRender();
      }
    }
    
    if ((drawTool === 'long' || drawTool === 'short') && g.current.isDragging && g.current.drawStart) {
      if (!ovCvsRef.current) return;
      const r = ovCvsRef.current.getBoundingClientRect();
      let clientY;
      if ('changedTouches' in e) {
        clientY = e.changedTouches[0].clientY;
      } else {
        clientY = (e as React.MouseEvent).clientY;
      }
      
      const my = clientY - r.top;
      const price2 = canvasPrice(my);
      
      const entryP = g.current.drawStart.price;
      const slP = price2;
      const risk = Math.abs(entryP - slP);
      const tpP = drawTool === 'long' ? entryP + risk * 2 : entryP - risk * 2;
      
      g.current.drawings.push({ type: drawTool === 'long' ? 'longsetup' : 'shortsetup', entry: entryP, sl: slP, tp: tpP, t: g.current.drawStart.t });
      
      g.current.planEntry = entryP; g.current.planSL = slP; g.current.planTP = tpP;
      g.current.drawings = g.current.drawings.filter(d => !['entry','sl','tp'].includes(d.type));
      g.current.drawings.push({type:'entry',price:entryP},{type:'sl',price:slP},{type:'tp',price:tpP});
      scheduleRender();
    }
    
    g.current.isDragging = false; g.current.drawStart = null;
    g.current.isPanning = false; g.current.panStart = null;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const arr = getCandles();
    if (e.ctrlKey || e.metaKey) {
      const factor = e.deltaY > 0 ? 1.12 : 0.88;
      g.current.yScale = (g.current.yScale !== null ? g.current.yScale : 1.0) * factor;
      g.current.yScale = Math.max(0.1, Math.min(20, g.current.yScale));
    } else if (e.shiftKey) {
      const vs = getViewportState();
      if (vs) {
        const pricePerPx = vs.priceRange / (vs.ch - vs.PAD.t - vs.PAD.b);
        g.current.yOffset = (g.current.yOffset !== null ? g.current.yOffset : 0) - e.deltaY * pricePerPx * 0.5;
      }
    } else {
      if (!mainCvsRef.current) return;
      const PAD = { l: 8, r: 80 };
      const sensitivity = g.current.barsToShow / (mainCvsRef.current.width - PAD.l - PAD.r) * 1.2;
      const delta = (e.deltaX !== 0 ? e.deltaX : e.deltaY) * sensitivity;
      g.current.offset = Math.max(0, Math.min(arr.length - 10, g.current.offset + delta));
    }
    scheduleRender();
  };

  const clearDrawings = () => {
    g.current.drawings = [];
    g.current.planEntry = g.current.planSL = g.current.planTP = null;
    scheduleRender();
  };

  const switchAsset = (s: string) => {
    setSym(s);
    g.current.offset = 0; g.current.barsToShow = 80; g.current.yOffset = null; g.current.yScale = null;
    g.current.planEntry = g.current.planSL = g.current.planTP = null;
    scheduleRender();
  };

  const changeTf = (t: string) => {
    setTf(t);
    g.current.offset = 0; g.current.yOffset = null; g.current.yScale = null;
    scheduleRender();
  };

  // Orders
  const placePendingOCO = () => {
    if (!g.current.planEntry || !g.current.planSL || !g.current.planTP) { showToastMsg('Set Entry, SL, and TP first'); return; }
    const q = parseFloat(qty) || 1;
    const order = { sym, side: orderSide, qty: q, entry: g.current.planEntry, sl: g.current.planSL, tp: g.current.planTP, id: Date.now() };
    setPendingOrders(prev => [...prev, order]);
    showToastMsg(`⏳ Pending ${orderSide.toUpperCase()} ${q} ${sym} @ ${fmtP(g.current.planEntry)}`);
  };

  const executeOrder = () => {
    const q = parseFloat(qty);
    if (!q || q <= 0) { showToastMsg('Enter valid quantity'); return; }
    const execPrice = orderType === 'limit' ? (parseFloat(limitPrice) || g.current.lastC) : g.current.lastC;
    const sl = g.current.planSL || null;
    const tp = g.current.planTP || null;

    if (orderSide === 'buy') {
      const cost = execPrice * q;
      if (cost > wallet) { showToastMsg('Insufficient balance!'); return; }
      setWallet(w => w - cost);
      setPositions(p => [...p, { sym, side: 'buy', qty: q, entry: execPrice, sl, tp, t: Date.now() }]);
      showToastMsg(`✅ Bought ${q} ${sym} @ ${fmtP(execPrice)}`);
    } else {
      const longIdx = positions.findIndex(p => p.sym === sym && p.side === 'buy');
      if (longIdx >= 0) {
        const pos = positions[longIdx];
        const pnl = (execPrice - pos.entry) * pos.qty;
        setWallet(w => w + pos.qty * execPrice);
        setHistory(h => [{ sym, side: 'sell', qty: pos.qty, entry: pos.entry, exit: execPrice, pnl, t: Date.now() }, ...h].slice(0, 100));
        setPositions(p => p.filter((_, i) => i !== longIdx));
        showToastMsg(`${pnl >= 0 ? '✅' : '❌'} Closed long ${pos.qty} ${sym} | PnL: ${pnl >= 0 ? '+' : ''}${fmtP(pnl)}`);
      } else {
        const margin = execPrice * q * 0.1;
        if (margin > wallet) { showToastMsg('Insufficient margin for short!'); return; }
        setWallet(w => w - margin);
        setPositions(p => [...p, { sym, side: 'sell', qty: q, entry: execPrice, sl, tp, margin, t: Date.now() }]);
        showToastMsg(`✅ Shorted ${q} ${sym} @ ${fmtP(execPrice)}`);
      }
    }
  };

  const closePosition = (i: number) => {
    const pos = positions[i];
    const last = g.current.lastC;
    let pnl = 0;
    if (pos.side === 'buy') {
      pnl = (last - pos.entry) * pos.qty;
      setWallet(w => w + pos.qty * last);
    } else {
      pnl = (pos.entry - last) * pos.qty;
      setWallet(w => w + (pos.margin || 0) + pnl);
    }
    setHistory(h => [{ sym: pos.sym, side: pos.side === 'buy' ? 'sell' : 'buy_cover', qty: pos.qty, entry: pos.entry, exit: last, pnl, t: Date.now() }, ...h].slice(0, 100));
    setPositions(p => p.filter((_, idx) => idx !== i));
    showToastMsg(`Closed ${pos.sym} ${pos.side.toUpperCase()} | PnL: ${pnl >= 0 ? '+' : ''}${fmtP(pnl)}`);
  };

  // Calculations for UI
  const qVal = parseFloat(qty) || 0;
  const isBuy = orderSide === 'buy';
  const reqMargin = isBuy ? (g.current.lastC * qVal) : (g.current.lastC * qVal * 0.1);
  const canAfford = reqMargin <= wallet;

  let totalOpenPnl = 0;
  positions.forEach(p => {
    const cur = p.sym === sym ? g.current.lastC : (ASSETS[p.sym]?.base || 0);
    totalOpenPnl += p.side === 'buy' ? (cur - p.entry) * p.qty : (p.entry - cur) * p.qty;
  });

  const rrRatio = (g.current.planEntry && g.current.planSL && g.current.planTP) 
    ? (Math.abs(g.current.planTP - g.current.planEntry) / Math.abs(g.current.planEntry - g.current.planSL)).toFixed(2)
    : null;

  if (!isClient) return null;

  return (
    <div className={styles.container}>
      <div className={styles.topbar}>
        <BackButton />
        <span className={styles.brand} style={{ marginLeft: 6 }}>VirtualTrade</span>
        <input 
          className={styles.assetSearch} 
          placeholder="Search symbol..." 
          value={searchQ}
          onChange={e => setSearchQ(e.target.value)} 
        />
        <div className={styles.assetChips}>
          {Object.entries(ASSETS).filter(([k, v]) => !searchQ || k.toLowerCase().includes(searchQ.toLowerCase()) || v.name.toLowerCase().includes(searchQ.toLowerCase())).map(([k, v]) => (
            <button 
              key={k}
              className={`${styles.assetChip} ${sym === k ? styles.active : ''}`}
              onClick={() => switchAsset(k)}
              title={`${v.name} (${v.cat})`}
            >
              {k}
            </button>
          ))}
        </div>
        <div className={styles.priceDisplay}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: 'var(--muted)', fontSize: '.65rem', fontWeight: 500 }}>BAL</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: 'var(--cyan)' }}>
              ₹{Math.round(wallet).toLocaleString('en-IN')}
            </span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: 'var(--muted)', fontSize: '.65rem', fontWeight: 500 }}>P&L</span>
            <span style={{ 
              fontFamily: "'JetBrains Mono', monospace", 
              fontWeight: 700, 
              color: totalOpenPnl > 0 ? '#10b981' : totalOpenPnl < 0 ? '#ef4444' : 'var(--muted)'
            }}>
              {totalOpenPnl >= 0 ? '+' : ''}{totalOpenPnl.toFixed(2)}
            </span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: 'var(--muted)', fontSize: '.65rem', fontWeight: 500 }}>{sym}</span>
            <span style={{ fontSize: '.72rem', fontWeight: 600 }}>{ASSETS[sym]?.currency}{fmtP(g.current.lastC)}</span>
          </span>
        </div>
      </div>

      <div className={styles.leftPanel}>
        <div className={styles.panelTitle}>Timeframe</div>
        <div className={styles.tfBar}>
          {['1m', '5m', '15m', '1h', '4h', '1d'].map(t => (
            <button key={t} className={`${styles.tfBtn} ${tf === t ? styles.active : ''}`} onClick={() => changeTf(t)}>{t.toUpperCase()}</button>
          ))}
        </div>
        <div className={styles.panelTitle}>Indicators</div>
        <div className={styles.indBar}>
          <button className={`${styles.indBtn} ${indicators.ema9 ? styles.on : ''}`} onClick={() => { setIndicators(i => ({...i, ema9: !i.ema9})); resizeCanvases(); }}>EMA 9</button>
          <button className={`${styles.indBtn} ${indicators.ema21 ? styles.on : ''}`} onClick={() => { setIndicators(i => ({...i, ema21: !i.ema21})); resizeCanvases(); }}>EMA 21</button>
          <button className={`${styles.indBtn} ${indicators.ema50 ? styles.on : ''}`} onClick={() => { setIndicators(i => ({...i, ema50: !i.ema50})); resizeCanvases(); }}>EMA 50</button>
          <button className={`${styles.indBtn} ${indicators.vol ? styles.on : ''}`} onClick={() => { setIndicators(i => ({...i, vol: !i.vol})); resizeCanvases(); }}>Volume</button>
          <button className={`${styles.indBtn} ${indicators.rsi ? styles.on : ''}`} onClick={() => { setIndicators(i => ({...i, rsi: !i.rsi})); resizeCanvases(); }}>RSI</button>
        </div>
        <div className={styles.panelTitle}>Drawing Tools</div>
        <div className={styles.drawBar} style={{ marginTop: 8 }}>
          <button className={`${styles.drawBtn} ${drawTool === 'none' ? styles.active : ''}`} onClick={() => setDrawTool('none')}>🎯 Select</button>
          <button className={`${styles.drawBtn} ${drawTool === 'trendline' ? styles.active : ''}`} onClick={() => setDrawTool('trendline')}>📈 Trend Line</button>
          <button className={`${styles.drawBtn} ${drawTool === 'hline' ? styles.active : ''}`} onClick={() => setDrawTool('hline')}>➖ Horizontal</button>
          <button className={`${styles.drawBtn} ${drawTool === 'entry' ? styles.active : ''}`} onClick={() => setDrawTool('entry')} style={{ color: '#10b981' }}>🟩 Entry</button>
          <button className={`${styles.drawBtn} ${drawTool === 'sl' ? styles.active : ''}`} onClick={() => setDrawTool('sl')} style={{ color: '#ef4444' }}>🟥 Stop Loss</button>
          <button className={`${styles.drawBtn} ${drawTool === 'tp' ? styles.active : ''}`} onClick={() => setDrawTool('tp')} style={{ color: '#fbbf24' }}>🟨 Target (TP)</button>
          <button className={`${styles.drawBtn} ${drawTool === 'long' ? styles.active : ''}`} onClick={() => setDrawTool('long')}>⬆️ Long Setup</button>
          <button className={`${styles.drawBtn} ${drawTool === 'short' ? styles.active : ''}`} onClick={() => setDrawTool('short')}>⬇️ Short Setup</button>
          <button className={styles.drawBtn} onClick={clearDrawings}>🗑️ Clear All</button>
        </div>
        <div style={{ margin: '8px 10px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border)', borderRadius: 8, padding: 9, fontSize: '.72rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: 'var(--muted)' }}>Entry</span><span style={{ fontFamily: 'JetBrains Mono', fontWeight: 600 }}>{g.current.planEntry ? fmtP(g.current.planEntry) : '—'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: 'var(--muted)' }}>Stop Loss</span><span style={{ fontFamily: 'JetBrains Mono', fontWeight: 600, color: '#ef4444' }}>{g.current.planSL ? fmtP(g.current.planSL) : '—'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: 'var(--muted)' }}>Target</span><span style={{ fontFamily: 'JetBrains Mono', fontWeight: 600, color: '#fbbf24' }}>{g.current.planTP ? fmtP(g.current.planTP) : '—'}</span>
          </div>
          <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid var(--border)', textAlign: 'center', fontWeight: 700, fontSize: '.85rem' }}>
            {rrRatio ? <span style={{ color: parseFloat(rrRatio) >= 2 ? '#10b981' : parseFloat(rrRatio) < 1 ? '#ef4444' : '#fbbf24' }}>R:R = 1:{rrRatio}</span> : 'Set levels to plan'}
          </div>
          {rrRatio && (
            <button onClick={placePendingOCO} style={{ width: '100%', marginTop: 8, padding: 7, borderRadius: 7, border: 'none', background: 'linear-gradient(135deg,#818cf8,#6366f1)', color: '#fff', fontWeight: 700, fontSize: '.78rem', cursor: 'pointer' }}>
              ⚡ Place OCO Pending Order
            </button>
          )}
        </div>
      </div>

      <div className={styles.chartWrap} ref={wrapRef} onWheel={handleWheel}>
        <canvas ref={mainCvsRef} className={styles.mainCanvas} />
        <canvas ref={rsiCvsRef} className={styles.rsiCanvas} />
        <canvas 
          ref={ovCvsRef} 
          className={styles.overlayCanvas}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
        <div className={styles.chartLabel} style={{ right: 1, top: g.current.crossY - 9, color: 'var(--cyan)' }}>{fmtP(g.current.crossPrice)}</div>
        <div className={styles.chartLabel} style={{ bottom: indicators.rsi ? 82 : 2, left: g.current.crossX, transform: 'translateX(-50%)', color: 'rgba(148, 163, 184, 0.7)' }}>{fmtT(g.current.simClock)}</div>
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.panelTitle}>Place Order</div>
        <div className={styles.orderForm}>
          <div className={styles.orderTabs}>
            <button className={`${styles.oTab} ${orderSide === 'buy' ? styles.activeBuy : ''}`} onClick={() => setOrderSide('buy')}>BUY</button>
            <button className={`${styles.oTab} ${orderSide === 'sell' ? styles.activeSell : ''}`} onClick={() => setOrderSide('sell')}>SELL / SHORT</button>
          </div>
          <label className={styles.formLabel}>Quantity (units)</label>
          <input className={styles.formInput} type="number" value={qty} onChange={e => setQty(e.target.value)} min="0.01" step="0.01" />
          
          <div className={`${styles.marginInfo} ${qty && qVal > 0 ? (canAfford ? styles.ok : styles.err) : ''}`}>
            {qty && qVal > 0 
              ? `${isBuy ? 'Cost: ' : 'Margin (10%): '} ₹${reqMargin.toLocaleString('en-IN', {maximumFractionDigits: 2})} | Bal: ₹${wallet.toLocaleString('en-IN', {maximumFractionDigits: 0})} ${canAfford ? '✓' : '✗ Insufficient'}` 
              : 'Enter quantity to see margin required'}
          </div>
          
          <label className={styles.formLabel} style={{ marginTop: 8 }}>Order Type</label>
          <select className={styles.formInput} value={orderType} onChange={e => setOrderType(e.target.value)}>
            <option value="market">Market</option>
            <option value="limit">Limit</option>
          </select>
          
          {orderType === 'limit' && (
            <>
              <label className={styles.formLabel}>Limit Price</label>
              <input className={styles.formInput} type="number" value={limitPrice} onChange={e => setLimitPrice(e.target.value)} step="0.01" />
            </>
          )}
          
          <button className={`${styles.execBtn} ${orderSide === 'buy' ? styles.buy : styles.sell}`} onClick={executeOrder}>
            {orderSide === 'buy' ? 'BUY NOW' : 'SELL / SHORT NOW'}
          </button>
          
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            <button onClick={() => setModal({type: 'deposit'})} style={{ flex: 1, padding: 6, borderRadius: 7, border: '1px solid rgba(34,211,238,0.25)', background: 'transparent', color: 'var(--cyan)', fontSize: '.7rem', fontWeight: 600, cursor: 'pointer' }}>+ Deposit</button>
            <button onClick={() => setModal({type: 'reset'})} style={{ flex: 1, padding: 6, borderRadius: 7, border: '1px solid rgba(239,68,68,0.25)', background: 'transparent', color: '#ef4444', fontSize: '.7rem', fontWeight: 600, cursor: 'pointer' }}>⚠️ Reset</button>
          </div>
        </div>

        <div className={styles.panelTitle}>Pending Orders</div>
        <div style={{ padding: '8px 10px' }}>
          {pendingOrders.length === 0 ? (
            <div style={{ color: 'var(--muted)', fontSize: '.72rem', padding: 6 }}>No pending orders</div>
          ) : (
            pendingOrders.map(o => (
              <div key={o.id} className={styles.posCard}>
                <div className={styles.posHeader}>
                  <span>{o.sym} <span style={{ color: '#fbbf24' }}>{o.side.toUpperCase()} PENDING</span></span>
                  <button className={styles.closePos} onClick={() => setPendingOrders(p => p.filter(po => po.id !== o.id))}>Cancel</button>
                </div>
                <div className={styles.posRow}><span>Qty: {o.qty}</span><span>@ {fmtP(o.entry)}</span></div>
                <div className={styles.posRow} style={{ marginTop: 3 }}>
                  <span style={{ color: '#ef4444' }}>SL {fmtP(o.sl)}</span><span style={{ color: '#fbbf24' }}>TP {fmtP(o.tp)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className={styles.panelTitle}>Open Positions</div>
        <div style={{ padding: '8px 10px' }}>
          {positions.length === 0 ? (
            <div style={{ color: 'var(--muted)', fontSize: '.72rem', padding: 6 }}>No open positions</div>
          ) : (
            positions.map((p, i) => {
              const cur = p.sym === sym ? g.current.lastC : (ASSETS[p.sym]?.base || 0);
              const pnl = p.side === 'buy' ? (cur - p.entry) * p.qty : (p.entry - cur) * p.qty;
              const col = pnl >= 0 ? '#10b981' : '#ef4444';
              return (
                <div key={i} className={styles.posCard}>
                  <div className={styles.posHeader}>
                    <span>{p.sym} <span style={{ color: p.side === 'buy' ? '#10b981' : '#ef4444' }}>{p.side === 'buy' ? 'LONG' : 'SHORT'}</span></span>
                    <button className={styles.closePos} onClick={() => closePosition(i)}>Close</button>
                  </div>
                  <div className={styles.posRow}><span>Qty: {p.qty}</span><span>Entry: {fmtP(p.entry)}</span></div>
                  <div className={styles.posRow} style={{ marginTop: 3 }}>
                    <span>Cur: {fmtP(cur)}</span>
                    <span className={styles.posPnl} style={{ color: col }}>{pnl >= 0 ? '+' : ''}{fmtP(pnl)}</span>
                  </div>
                  {p.sl && (
                    <div className={styles.posRow} style={{ marginTop: 2 }}>
                      <span style={{ color: '#ef4444', fontSize: '.65rem' }}>SL: {fmtP(p.sl)}</span>
                      <span style={{ color: '#fbbf24', fontSize: '.65rem' }}>TP: {fmtP(p.tp || 0)}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className={styles.panelTitle}>Trade History</div>
        <div style={{ padding: '8px 10px' }}>
          {history.length === 0 ? (
            <div style={{ color: 'var(--muted)', fontSize: '.72rem', padding: 6 }}>No trades yet</div>
          ) : (
            history.slice(0, 20).map((h, i) => (
              <div key={i} className={styles.histRow}>
                <span>{h.sym} {h.side.toUpperCase()}</span>
                <span style={{ color: h.pnl >= 0 ? '#10b981' : '#ef4444' }}>{h.pnl >= 0 ? '+' : ''}{fmtP(h.pnl)}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className={`${styles.toast} ${toast.visible ? styles.toastShow : ''}`}>{toast.msg}</div>

      {modal.type && (
        <div className={`${styles.modalOverlay} ${styles.modalOverlayShow}`} onClick={(e) => e.target === e.currentTarget && setModal({type: null})}>
          <div className={styles.modalBox}>
            {modal.type === 'deposit' ? (
              <>
                <h3>➕ Deposit Funds</h3>
                <p>Add virtual funds to your trading account.</p>
                <input 
                  className={styles.formInput} 
                  id="deposit-amount" 
                  type="number" 
                  min="1000" 
                  step="1000" 
                  placeholder="Amount (e.g. 50000)" 
                  autoFocus
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                  <button className={`${styles.modalBtn} ${styles.modalBtnConfirm}`} onClick={() => {
                    const amt = parseFloat((document.getElementById('deposit-amount') as HTMLInputElement).value);
                    if (amt > 0) {
                      setWallet(w => w + amt);
                      setModal({type: null});
                      showToastMsg(`✅ Deposited ₹${amt.toLocaleString('en-IN')}`);
                    }
                  }}>Deposit</button>
                  <button className={`${styles.modalBtn} ${styles.modalBtnCancel}`} onClick={() => setModal({type: null})}>Cancel</button>
                </div>
              </>
            ) : (
              <>
                <h3>⚠️ Reset All Data</h3>
                <p>This will permanently delete your balance, all open positions, pending orders, and trade history. You will start fresh with ₹1,00,000.</p>
                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                  <button className={`${styles.modalBtn} ${styles.modalBtnConfirm}`} style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)' }} onClick={() => {
                    setWallet(100000);
                    setPositions([]);
                    setHistory([]);
                    setPendingOrders([]);
                    g.current.drawings = [];
                    g.current.planEntry = g.current.planSL = g.current.planTP = null;
                    localStorage.removeItem('trade-wallet');
                    localStorage.removeItem('trade-pos');
                    localStorage.removeItem('trade-hist');
                    localStorage.removeItem('trade-pending');
                    setModal({type: null});
                    showToastMsg(`🔄 Account reset — starting fresh with ₹1,00,000`);
                  }}>Yes, Reset Everything</button>
                  <button className={`${styles.modalBtn} ${styles.modalBtnCancel}`} onClick={() => setModal({type: null})}>Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
