'use client';

import React, { useState } from 'react';
import styles from './sip.module.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import PageHeader from '@/components/PageHeader/PageHeader';
import BackButton from '@/components/BackButton/BackButton';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function fmt(v: number) {
  if (v >= 1e7) return `₹${(v / 1e7).toFixed(2)} Cr`;
  if (v >= 1e5) return `₹${(v / 1e5).toFixed(2)} L`;
  return `₹${Math.round(v).toLocaleString('en-IN')}`;
}

function cagr(invested: number, maturity: number, years: number) {
  if (invested <= 0 || years <= 0) return 0;
  return (Math.pow(maturity / invested, 1 / years) - 1) * 100;
}

export default function SipClient() {
  const [compare, setCompare] = useState(false);
  const [stepUp, setStepUp] = useState(false);
  const [inflation, setInflation] = useState(false);

  const [stepPct, setStepPct] = useState(10);
  const [inflRate, setInflRate] = useState(6);

  const [amountA, setAmountA] = useState(5000);
  const [rateA, setRateA] = useState(12);
  const [yearsA, setYearsA] = useState(10);

  const [amountB, setAmountB] = useState(7000);
  const [rateB, setRateB] = useState(10);
  const [yearsB, setYearsB] = useState(15);

  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [tableOpen, setTableOpen] = useState(false);

  const calcGrowth = (p: number, r: number, n: number, isStepUp: boolean, stepRate: number) => {
    const mr = r / 12 / 100;
    let corpus = 0, invested = 0, monthly = p;
    const rows = [];
    for (let y = 1; y <= n; y++) {
      for (let m = 0; m < 12; m++) {
        // Fixed logic error from original code: Invest at beginning of month
        corpus = (corpus + monthly) * (1 + mr);
        invested += monthly;
      }
      rows.push({
        year: y,
        invested: Math.round(invested),
        corpus: Math.round(corpus),
        gains: Math.round(corpus - invested)
      });
      if (isStepUp) {
        monthly *= (1 + stepRate / 100);
      }
    }
    return rows;
  };

  const rowsA = calcGrowth(amountA, rateA, yearsA, stepUp, stepPct);
  const resA = rowsA[rowsA.length - 1] || { invested: 0, corpus: 0, gains: 0 };
  const cagrA = cagr(resA.invested, resA.corpus, yearsA);
  const realA = inflation ? resA.corpus / Math.pow(1 + inflRate / 100, yearsA) : 0;

  let rowsB: any[] = [];
  let resB = { invested: 0, corpus: 0, gains: 0 };
  let cagrB = 0;
  let realB = 0;

  if (compare) {
    rowsB = calcGrowth(amountB, rateB, yearsB, stepUp, stepPct);
    resB = rowsB[rowsB.length - 1] || { invested: 0, corpus: 0, gains: 0 };
    cagrB = cagr(resB.invested, resB.corpus, yearsB);
    realB = inflation ? resB.corpus / Math.pow(1 + inflRate / 100, yearsB) : 0;
  }

  const invPctA = resA.corpus > 0 ? Math.round((resA.invested / resA.corpus) * 100) : 0;
  const gainPctA = resA.corpus > 0 ? 100 - invPctA : 0;
  const invPctB = resB.corpus > 0 ? Math.round((resB.invested / resB.corpus) * 100) : 0;
  const gainPctB = resB.corpus > 0 ? 100 - invPctB : 0;

  const maxYears = compare ? Math.max(yearsA, yearsB) : yearsA;
  const labels = Array.from({ length: maxYears }, (_, i) => `Yr ${i + 1}`);

  const chartData = {
    labels,
    datasets: [
      {
        label: compare ? 'SIP A' : 'SIP',
        data: labels.map((_, i) => rowsA[i]?.corpus ?? null),
        borderColor: '#06b6d4',
        backgroundColor: chartType === 'line' ? 'rgba(6,182,212,0.12)' : 'rgba(6,182,212,0.7)',
        borderWidth: 2.5,
        fill: chartType === 'line',
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5
      },
      ...(compare
        ? [
            {
              label: 'SIP B',
              data: labels.map((_, i) => rowsB[i]?.corpus ?? null),
              borderColor: '#8b5cf6',
              backgroundColor: chartType === 'line' ? 'rgba(139,92,246,0.12)' : 'rgba(139,92,246,0.7)',
              borderWidth: 2.5,
              fill: chartType === 'line',
              tension: 0.4,
              pointRadius: 0,
              pointHoverRadius: 5
            }
          ]
        : [])
    ]
  };

  const chartOptions = {
    responsive: true,
    interaction: { intersect: false, mode: 'index' as const },
    plugins: {
      legend: { labels: { color: '#94a3b8', font: { size: 13, weight: 600 } } },
      tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ${fmt(ctx.parsed.y)}` } }
    },
    scales: {
      x: { ticks: { color: '#94a3b8', font: { size: 11 } }, grid: { display: false } },
      y: { ticks: { color: '#94a3b8', font: { size: 11 }, callback: (v: any) => fmt(v) }, grid: { display: false } }
    }
  };

  return (
    <div className={styles.container}>
      <BackButton />
      
      <PageHeader
        title="SIP Calculator"
        subtitle="Plan your wealth systematically. Visualise, compare and grow."
      />

      {/* Toggles */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <label className="flex items-center gap-3 cursor-pointer p-3 rounded-2xl bg-slate-800 border border-slate-700 hover:border-cyan-400 transition-colors">
          <div className={`${styles.toggleTrack} ${compare ? styles.on : ''}`}>
            <div className={`${styles.toggleThumb} ${compare ? styles.on : ''}`} />
          </div>
          <input type="checkbox" checked={compare} onChange={e => setCompare(e.target.checked)} className="sr-only" />
          <span className="text-sm font-semibold text-slate-300">Compare Two SIPs</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer p-3 rounded-2xl bg-slate-800 border border-slate-700 hover:border-cyan-400 transition-colors">
          <div className={`${styles.toggleTrack} ${stepUp ? styles.on : ''}`}>
            <div className={`${styles.toggleThumb} ${stepUp ? styles.on : ''}`} />
          </div>
          <input type="checkbox" checked={stepUp} onChange={e => setStepUp(e.target.checked)} className="sr-only" />
          <span className="text-sm font-semibold text-slate-300">Step-up SIP</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer p-3 rounded-2xl bg-slate-800 border border-slate-700 hover:border-cyan-400 transition-colors">
          <div className={`${styles.toggleTrack} ${inflation ? styles.on : ''}`}>
            <div className={`${styles.toggleThumb} ${inflation ? styles.on : ''}`} />
          </div>
          <input type="checkbox" checked={inflation} onChange={e => setInflation(e.target.checked)} className="sr-only" />
          <span className="text-sm font-semibold text-slate-300">Inflation Adjusted</span>
        </label>
      </div>

      {/* Extra Panels */}
      <div className="flex flex-wrap justify-center gap-4">
        {stepUp && (
          <div className="p-4 rounded-xl bg-slate-800 border border-cyan-500/40 w-full max-w-sm">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-cyan-400">Annual Step-up Rate</label>
              <div className="flex items-center gap-1">
                <input type="number" value={stepPct} onChange={e => setStepPct(clamp(Number(e.target.value), 1, 50))} className={styles.inputBox} />
                <span className="text-cyan-400 font-bold">%</span>
              </div>
            </div>
            <input type="range" min="1" max="50" value={stepPct} onChange={e => setStepPct(Number(e.target.value))} className={styles.range} />
          </div>
        )}
        {inflation && (
          <div className="p-4 rounded-xl bg-slate-800 border border-violet-500/40 w-full max-w-sm">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-violet-400">Expected Inflation</label>
              <div className="flex items-center gap-1">
                <input type="number" value={inflRate} step="0.5" onChange={e => setInflRate(clamp(Number(e.target.value), 1, 20))} className={styles.inputBox} />
                <span className="text-violet-400 font-bold">%</span>
              </div>
            </div>
            <input type="range" min="1" max="20" step="0.5" value={inflRate} onChange={e => setInflRate(Number(e.target.value))} className={`${styles.range} ${styles.rangeViolet}`} />
          </div>
        )}
      </div>

      {/* Input Cards */}
      <div className={compare ? styles.gridCols2 : 'max-w-2xl mx-auto w-full'}>
        <div className={styles.card}>
          <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
            <i className="ri-bar-chart-fill text-cyan-500"></i> {compare ? 'SIP A' : 'SIP'}
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2 items-center">
                <span className="text-sm text-slate-400">Monthly Investment</span>
                <input type="number" value={amountA} onChange={e => setAmountA(clamp(Number(e.target.value), 500, 100000))} step="100" className={styles.inputBox} />
              </div>
              <input type="range" min="500" max="100000" step="100" value={amountA} onChange={e => setAmountA(Number(e.target.value))} className={styles.range} />
            </div>
            <div>
              <div className="flex justify-between mb-2 items-center">
                <span className="text-sm text-slate-400">Expected Return (%)</span>
                <input type="number" value={rateA} onChange={e => setRateA(clamp(Number(e.target.value), 1, 30))} step="0.1" className={styles.inputBox} />
              </div>
              <input type="range" min="1" max="30" step="0.1" value={rateA} onChange={e => setRateA(Number(e.target.value))} className={styles.range} />
            </div>
            <div>
              <div className="flex justify-between mb-2 items-center">
                <span className="text-sm text-slate-400">Time Period (Yrs)</span>
                <input type="number" value={yearsA} onChange={e => setYearsA(clamp(Number(e.target.value), 1, 50))} className={styles.inputBox} />
              </div>
              <input type="range" min="1" max="50" value={yearsA} onChange={e => setYearsA(Number(e.target.value))} className={styles.range} />
            </div>
          </div>
        </div>

        {compare && (
          <div className={styles.card}>
            <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
              <i className="ri-bar-chart-2-fill text-violet-500"></i> SIP B
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2 items-center">
                  <span className="text-sm text-slate-400">Monthly Investment</span>
                  <input type="number" value={amountB} onChange={e => setAmountB(clamp(Number(e.target.value), 500, 100000))} step="100" className={`${styles.inputBox} ${styles.inputBoxViolet}`} />
                </div>
                <input type="range" min="500" max="100000" step="100" value={amountB} onChange={e => setAmountB(Number(e.target.value))} className={`${styles.range} ${styles.rangeViolet}`} />
              </div>
              <div>
                <div className="flex justify-between mb-2 items-center">
                  <span className="text-sm text-slate-400">Expected Return (%)</span>
                  <input type="number" value={rateB} onChange={e => setRateB(clamp(Number(e.target.value), 1, 30))} step="0.1" className={`${styles.inputBox} ${styles.inputBoxViolet}`} />
                </div>
                <input type="range" min="1" max="30" step="0.1" value={rateB} onChange={e => setRateB(Number(e.target.value))} className={`${styles.range} ${styles.rangeViolet}`} />
              </div>
              <div>
                <div className="flex justify-between mb-2 items-center">
                  <span className="text-sm text-slate-400">Time Period (Yrs)</span>
                  <input type="number" value={yearsB} onChange={e => setYearsB(clamp(Number(e.target.value), 1, 50))} className={`${styles.inputBox} ${styles.inputBoxViolet}`} />
                </div>
                <input type="range" min="1" max="50" value={yearsB} onChange={e => setYearsB(Number(e.target.value))} className={`${styles.range} ${styles.rangeViolet}`} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className={compare ? styles.gridCols2 : 'max-w-2xl mx-auto w-full'}>
        <div className="bg-gradient-to-br from-cyan-600 via-cyan-700 to-blue-700 p-6 rounded-3xl shadow-xl text-white">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-bold"><i className="ri-trophy-fill text-yellow-300 mr-2"></i> {compare ? 'SIP A Results' : 'Results'}</h3>
            <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full">CAGR {cagrA.toFixed(1)}%</span>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white/10 p-3 rounded-2xl text-center">
              <p className="text-[10px] uppercase tracking-widest opacity-70 mb-1">Invested</p>
              <p className="font-bold text-sm sm:text-base">{fmt(resA.invested)}</p>
            </div>
            <div className="bg-white/25 p-3 rounded-2xl text-center ring-2 ring-white/40">
              <p className="text-[10px] uppercase tracking-widest opacity-70 mb-1">Maturity</p>
              <p className="font-bold text-sm sm:text-base">{fmt(resA.corpus)}</p>
            </div>
            <div className="bg-white/10 p-3 rounded-2xl text-center">
              <p className="text-[10px] uppercase tracking-widest opacity-70 mb-1">Gains</p>
              <p className="font-bold text-sm sm:text-base text-green-300">{fmt(resA.gains)}</p>
            </div>
          </div>
          {inflation && (
            <div className="bg-white/10 p-3 rounded-xl text-center mb-4">
              <p className="text-xs opacity-70 mb-1">Inflation-Adjusted Value</p>
              <p className="font-bold text-yellow-200">{fmt(realA)}</p>
            </div>
          )}
          <div className="w-full h-2 rounded-full bg-white/20 flex overflow-hidden mt-4">
            <div style={{ width: `${invPctA}%` }} className="bg-white/50" />
            <div style={{ width: `${gainPctA}%` }} className="bg-green-400" />
          </div>
          <div className="flex justify-between text-[10px] opacity-75 mt-1">
            <span>Invested {invPctA}%</span>
            <span>Gains {gainPctA}%</span>
          </div>
        </div>

        {compare && (
          <div className="bg-gradient-to-br from-violet-600 via-violet-700 to-purple-700 p-6 rounded-3xl shadow-xl text-white">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold"><i className="ri-trophy-fill text-yellow-300 mr-2"></i> SIP B Results</h3>
              <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full">CAGR {cagrB.toFixed(1)}%</span>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-white/10 p-3 rounded-2xl text-center">
                <p className="text-[10px] uppercase tracking-widest opacity-70 mb-1">Invested</p>
                <p className="font-bold text-sm sm:text-base">{fmt(resB.invested)}</p>
              </div>
              <div className="bg-white/25 p-3 rounded-2xl text-center ring-2 ring-white/40">
                <p className="text-[10px] uppercase tracking-widest opacity-70 mb-1">Maturity</p>
                <p className="font-bold text-sm sm:text-base">{fmt(resB.corpus)}</p>
              </div>
              <div className="bg-white/10 p-3 rounded-2xl text-center">
                <p className="text-[10px] uppercase tracking-widest opacity-70 mb-1">Gains</p>
                <p className="font-bold text-sm sm:text-base text-yellow-200">{fmt(resB.gains)}</p>
              </div>
            </div>
            {inflation && (
              <div className="bg-white/10 p-3 rounded-xl text-center mb-4">
                <p className="text-xs opacity-70 mb-1">Inflation-Adjusted Value</p>
                <p className="font-bold text-yellow-200">{fmt(realB)}</p>
              </div>
            )}
            <div className="w-full h-2 rounded-full bg-white/20 flex overflow-hidden mt-4">
              <div style={{ width: `${invPctB}%` }} className="bg-white/50" />
              <div style={{ width: `${gainPctB}%` }} className="bg-yellow-300" />
            </div>
            <div className="flex justify-between text-[10px] opacity-75 mt-1">
              <span>Invested {invPctB}%</span>
              <span>Gains {gainPctB}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className={styles.card}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-200"><i className="ri-line-chart-line text-cyan-400 mr-2"></i> Growth Projection</h3>
          <div className="flex gap-1 bg-slate-700 p-1 rounded-xl">
            <button onClick={() => setChartType('line')} className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${chartType === 'line' ? 'bg-slate-800 text-cyan-400' : 'text-slate-300 hover:text-white'}`}>Line</button>
            <button onClick={() => setChartType('bar')} className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${chartType === 'bar' ? 'bg-slate-800 text-cyan-400' : 'text-slate-300 hover:text-white'}`}>Bar</button>
          </div>
        </div>
        <div className="w-full" style={{ minHeight: '300px' }}>
          {chartType === 'line' ? (
            <Line data={chartData as any} options={chartOptions as any} />
          ) : (
            <Bar data={chartData as any} options={chartOptions as any} />
          )}
        </div>
      </div>

      {/* Table */}
      <div className={styles.card}>
        <button onClick={() => setTableOpen(!tableOpen)} className="w-full flex justify-between items-center text-slate-200 font-bold p-2 hover:text-cyan-400 transition-colors">
          <span><i className="ri-table-line text-cyan-400 mr-2"></i> Year-by-Year Breakdown</span>
          <i className={`ri-arrow-down-s-line transition-transform duration-300 ${tableOpen ? 'rotate-180' : ''}`} />
        </button>
        {tableOpen && (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-slate-700/50 text-slate-300">
                  <th className="p-3">Year</th>
                  <th className="p-3 text-right">Invested</th>
                  <th className="p-3 text-right">Maturity</th>
                  <th className="p-3 text-right">Gains</th>
                  {compare && <th className="p-3 text-right text-violet-400">SIP B Maturity</th>}
                </tr>
              </thead>
              <tbody>
                {rowsA.map((r, i) => (
                  <tr key={i} className="border-t border-slate-700/30 hover:bg-slate-800/50">
                    <td className="p-3 font-semibold">Yr {r.year}</td>
                    <td className="p-3 text-right text-slate-400">{fmt(r.invested)}</td>
                    <td className="p-3 text-right text-cyan-400 font-semibold">{fmt(r.corpus)}</td>
                    <td className="p-3 text-right text-green-400">{fmt(r.gains)}</td>
                    {compare && <td className="p-3 text-right text-violet-400 font-semibold">{rowsB[i] ? fmt(rowsB[i].corpus) : '-'}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
