import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';

const TRADES = [
  { date: '18 Sep', open: 45788.29, netPL:   164.91, close: 45788.29, ret:  0.36 },
  { date: '19 Sep', open: 45788.29, netPL:   280.55, close: 46068.84, ret:  0.61 },
  { date: '22 Sep', open: 46068.84, netPL:    53.06, close: 46121.90, ret:  0.12 },
  { date: '23 Sep', open: 46121.90, netPL:  2578.46, close: 48700.35, ret:  5.59 },
  { date: '24 Sep', open: 48700.35, netPL:  -301.14, close: 48399.21, ret: -0.62 },
  { date: '25 Sep', open: 48399.21, netPL:  -299.14, close: 48100.07, ret: -0.62 },
  { date: '26 Sep', open: 48100.07, netPL:   848.15, close: 48948.22, ret:  1.76 },
  { date: '29 Sep', open: 48948.22, netPL:  3032.26, close: 50980.49, ret:  6.19 },
  { date: '30 Sep', open: 50980.49, netPL:  1535.79, close: 52516.28, ret:  3.01 },
  { date: '1 Oct',  open: 52516.28, netPL:  3467.31, close: 55983.59, ret:  6.60 },
  { date: '3 Oct',  open: 55983.59, netPL: -1453.02, close: 54530.57, ret: -2.60 },
  { date: '6 Oct',  open: 54530.57, netPL:  3306.75, close: 57837.32, ret:  6.06 },
  { date: '7 Oct',  open: 57837.32, netPL:  5105.77, close: 59943.09, ret:  8.83 },
  { date: '8 Oct',  open: 59943.09, netPL: -1868.31, close: 58074.78, ret: -3.12 },
  { date: '9 Oct',  open: 58074.78, netPL: -2923.17, close: 55151.62, ret: -5.03 },
  { date: '10 Oct', open: 55151.62, netPL:   794.03, close: 55945.65, ret:  1.44 },
  { date: '13 Oct', open: 55945.65, netPL: -1253.81, close: 54691.84, ret: -2.24 },
  { date: '14 Oct', open: 54691.84, netPL:  7514.92, close: 62206.77, ret: 13.74 },
  { date: '15 Oct', open: 62206.77, netPL:  -536.02, close: 59670.74, ret: -0.86 },
  { date: '16 Oct', open: 59670.74, netPL: -1700.17, close: 57970.57, ret: -2.85 },
  { date: '17 Oct', open: 57970.57, netPL:  8618.31, close: 66588.88, ret: 14.87 },
];

const PAD = { top: 10, right: 10, bottom: 16, left: 10 };

function drawChart(canvas, trades, hoveredIdx = null) {
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const W = rect.width || 400;
  const H = rect.height || 90;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const closes = trades.map(t => t.close);
  const minV = Math.min(...closes) * 0.998;
  const maxV = Math.max(...closes) * 1.002;

  const toX = i => PAD.left + i * (W - PAD.left - PAD.right) / (trades.length - 1);
  const toY = v => PAD.top + (1 - (v - minV) / (maxV - minV)) * (H - PAD.top - PAD.bottom);

  const pts = trades.map((t, i) => ({ x: toX(i), y: toY(t.close), t }));

  // Fill
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, 'rgba(16,185,129,0.18)');
  grad.addColorStop(1, 'rgba(16,185,129,0)');
  ctx.beginPath();
  ctx.moveTo(pts[0].x, H - PAD.bottom);
  pts.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.lineTo(pts[pts.length - 1].x, H - PAD.bottom);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Line
  ctx.beginPath();
  pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 1.8;
  ctx.lineJoin = 'round';
  ctx.stroke();

  // Date labels
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.font = '9px Inter,sans-serif';
  const mi = Math.floor(trades.length / 2);
  ctx.textAlign = 'left';   ctx.fillText(trades[0].date, PAD.left, H - 3);
  ctx.textAlign = 'center'; ctx.fillText(trades[mi].date, pts[mi].x, H - 3);
  ctx.textAlign = 'right';  ctx.fillText(trades[trades.length - 1].date, W - PAD.right, H - 3);

  // Hover crosshair
  if (hoveredIdx !== null) {
    const p = pts[hoveredIdx];
    const pos = p.t.netPL >= 0;
    ctx.save();
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = pos ? 'rgba(16,185,129,0.5)' : 'rgba(239,68,68,0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(p.x, PAD.top); ctx.lineTo(p.x, H - PAD.bottom); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(PAD.left, p.y); ctx.lineTo(W - PAD.right, p.y); ctx.stroke();
    ctx.restore();
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = pos ? '#10b981' : '#ef4444';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.fill();
    ctx.stroke();
  }

  return pts;
}

function EquityChart() {
  const canvasRef = useRef(null);
  const ptsRef = useRef([]);
  const tipRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.style.height = '90px';
    const draw = () => {
      ptsRef.current = drawChart(canvas, TRADES);
    };
    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, []);

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const tip = tipRef.current;
    const card = cardRef.current;
    if (!canvas || !ptsRef.current.length) return;
    const cRect = canvas.getBoundingClientRect();
    const kRect = card.getBoundingClientRect();
    const mx = e.clientX - cRect.left;
    let best = 0, bd = Infinity;
    ptsRef.current.forEach((p, i) => { const d = Math.abs(p.x - mx); if (d < bd) { bd = d; best = i; } });
    ptsRef.current = drawChart(canvas, TRADES, best);
    const p = ptsRef.current[best];
    const t = p.t;
    const pos = t.netPL >= 0;
    const plColor = pos ? '#34d399' : '#f87171';
    const plSign = pos ? '+' : '';
    tip.innerHTML =
      `<span style="color:#94a3b8;font-size:9px">${t.date}</span><br>` +
      `<span style="font-weight:700">\u20B9${t.close.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span><br>` +
      `<span style="color:${plColor};font-weight:600">${plSign}${t.ret.toFixed(2)}%&nbsp;&nbsp;${plSign}\u20B9${Math.abs(t.netPL).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>`;
    tip.style.display = 'block';
    const dotLX = (e.clientX - cRect.left) + (cRect.left - kRect.left);
    const dotLY = p.y + (cRect.top - kRect.top);
    const TW = 130, TH = 58;
    let tx = dotLX + 12;
    let ty = dotLY - TH - 8;
    if (tx + TW > kRect.width) tx = dotLX - TW - 12;
    if (ty < 4) ty = dotLY + 10;
    tip.style.left = tx + 'px';
    tip.style.top = ty + 'px';
  };

  const handleMouseLeave = () => {
    if (tipRef.current) tipRef.current.style.display = 'none';
    drawChart(canvasRef.current, TRADES);
  };

  return (
    <div ref={cardRef} id="trading-card" className="col-span-1 sm:col-span-2 ach-card p-5 fade-up" style={{ animationDelay: '.06s', position: 'relative' }}>
      <div
        ref={tipRef}
        style={{
          display: 'none', position: 'absolute', zIndex: 20, pointerEvents: 'none',
          background: 'rgba(15,23,42,0.92)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 8, padding: '6px 10px', fontSize: 11, color: '#e2e8f0',
          lineHeight: 1.6, backdropFilter: 'blur(4px)'
        }}
      />
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-md flex-shrink-0">
            <i className="ri-stock-line text-white text-xl"></i>
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-[0.18em] uppercase block mb-0.5 text-emerald-400">Trading Challenge · Sep–Oct 2025</span>
            <h3 className="text-base font-extrabold leading-snug text-white">30-Day Live Trading Challenge</h3>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-2xl font-black leading-none text-emerald-400">+45.46%</p>
          <p className="text-[10px] mt-0.5 text-slate-400">21 trading days</p>
        </div>
      </div>
      <div className="border rounded-lg mb-3 bg-slate-800/60 border-slate-700/40">
        <canvas
          ref={canvasRef}
          style={{ width: '100%', display: 'block' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="border rounded-lg px-3 py-2 bg-white/[0.03] border-white/[0.06]">
          <p className="text-[10px] text-slate-400">Best Day</p>
          <p className="text-sm font-black text-emerald-400">+14.87%</p>
        </div>
        <div className="border rounded-lg px-3 py-2 bg-white/[0.03] border-white/[0.06]">
          <p className="text-[10px] text-slate-400">Worst Day</p>
          <p className="text-sm font-black text-red-400">−5.03%</p>
        </div>
        <div className="border rounded-lg px-3 py-2 bg-white/[0.03] border-white/[0.06]">
          <p className="text-[10px] text-slate-400">Win Rate</p>
          <p className="text-sm font-black text-cyan-400">62%</p>
        </div>
      </div>
      <p className="text-xs leading-relaxed text-slate-400">
        Live F&amp;O challenge using SMC/ICT methodology. <span className="font-semibold text-white">₹45,788 → ₹66,589</span> across 21 sessions.
      </p>
      <div className="mt-3 pt-3 border-t flex flex-wrap gap-1.5 border-slate-700/30">
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400"><i className="ri-line-chart-line"></i> SMC/ICT</span>
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400"><i className="ri-calendar-check-line"></i> Sep 18 – Oct 17, 2025</span>
      </div>
    </div>
  );
}

export default function AchievementsPage() {
  return (
    <>
      <SEOHead
        title="Achievements – Arpit Agarwala | Certifications & Milestones"
        description="A showcase of Arpit Agarwala's professional achievements, certifications, and milestones in UI/UX design and front-end web development."
        url="https://arpitagarwala.online/achievements"
        image="https://arpitagarwala.online/assets/images/my-miniature.png"
      />

      <style>{`
        .ach-card {
          background: rgba(30,41,59,0.55);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          backdrop-filter: blur(12px);
          transition: box-shadow 0.2s, transform 0.2s;
          overflow: hidden;
        }
        .ach-card:hover {
          box-shadow: 0 4px 32px rgba(0,0,0,0.22);
          transform: translateY(-2px);
        }
        .card-photo {
          width: 100%;
          height: 160px;
          object-fit: cover;
          display: block;
        }
        .ext-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 9999px;
          text-decoration: none;
          transition: opacity 0.15s;
        }
        .ext-link:hover { opacity: 0.75; }
        .stat {
          background: rgba(30,41,59,0.55);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          padding: 12px 16px;
          backdrop-filter: blur(8px);
        }
        .shimmer-underline {
          animation: shimmer-slide 2.5s linear infinite;
          background-size: 200% 100%;
        }
        @keyframes shimmer-slide {
          0%   { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
        .fade-up {
          animation: fadeUp 0.5s ease both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .fade-up { animation: none; }
        }
      `}</style>

      <div className="min-h-screen bg-slate-950 text-slate-200 overflow-x-hidden">
        {/* Background blobs */}
        <div style={{ position:'fixed', top:-200, left:-200, width:500, height:500, borderRadius:'50%', background:'rgba(245,158,11,0.07)', filter:'blur(80px)', pointerEvents:'none', zIndex:0 }} />
        <div style={{ position:'fixed', bottom:-200, right:-200, width:500, height:500, borderRadius:'50%', background:'rgba(234,179,8,0.07)', filter:'blur(80px)', pointerEvents:'none', zIndex:0 }} />

        {/* Back button */}
        <div className="fixed top-4 left-4 z-50">
          <Link to="/" className="w-10 h-10 flex items-center justify-center rounded-full backdrop-blur border transition-all shadow-lg hover:scale-105 active:scale-95 bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/80 text-white">
            <i className="ri-arrow-left-line text-lg"></i>
          </Link>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto pt-10 px-4 pb-10">
          {/* Header */}
          <div className="mb-10 fade-up">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-2">
              <div>
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none" style={{ background:'linear-gradient(135deg,#10b981,#22d3ee,#818cf8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Wins</h1>
                <div className="shimmer-underline" style={{ height:3, width:72, background:'linear-gradient(90deg,#10b981,#22d3ee)', borderRadius:99, marginTop:6 }} />
              </div>
              <p className="text-sm max-w-lg pb-1 leading-relaxed text-slate-400">Awards, certifications, trading milestones &amp; leadership wins across the journey.</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 fade-up" style={{ animationDelay: '.05s' }}>
            <div className="stat"><p className="text-2xl font-black text-cyan-400">8</p><p className="text-[10px] uppercase tracking-wider mt-0.5 text-slate-400">Total</p></div>
            <div className="stat"><p className="text-2xl font-black text-amber-400">4</p><p className="text-[10px] uppercase tracking-wider mt-0.5 text-slate-400">Awards</p></div>
            <div className="stat"><p className="text-2xl font-black text-emerald-400">+45.5%</p><p className="text-[10px] uppercase tracking-wider mt-0.5 text-slate-400">Trading Return</p></div>
            <div className="stat"><p className="text-2xl font-black text-violet-400">3</p><p className="text-[10px] uppercase tracking-wider mt-0.5 text-slate-400">Years Active</p></div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* Trading Card (full-width Canvas chart) */}
            <EquityChart />

            {/* Chairman Award */}
            <div className="ach-card fade-up" style={{ animationDelay: '.08s' }}>
              <img src="https://res.cloudinary.com/dxsja3wy5/image/upload/w_900,q_auto,f_auto/v1772858929/chairman-award_clz2ft.jpg" alt="Arpit receiving Chairman Award from Archana Puran Singh" className="card-photo" onError={e => e.target.style.display='none'} />
              <div className="p-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-amber-50/10"><i className="ri-award-line text-xl text-amber-400"></i></div>
                <span className="text-[10px] font-bold tracking-[0.18em] uppercase mb-1.5 block text-amber-400">Award · Sep 2023</span>
                <h3 className="text-base font-extrabold mb-1.5 leading-snug text-white">Chairman Award</h3>
                <p className="text-xs leading-relaxed text-slate-400">Presented by actress &amp; TV personality <span className="font-semibold text-white">Archana Puran Singh</span> at LK Singhania Education Centre's Annual Prize Giving Function for outstanding leadership as Head Boy.</p>
                <div className="mt-4 pt-3 border-t flex flex-wrap gap-1.5 border-slate-700/40">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400"><i className="ri-school-line"></i> LK Singhania</span>
                  <a href="https://www.facebook.com/share/p/1Mi9xyd8sV/" target="_blank" rel="noopener noreferrer" className="ext-link bg-blue-500/10 text-blue-400"><i className="ri-facebook-circle-fill"></i> View Post</a>
                </div>
              </div>
            </div>

            {/* Bhawanipur Scholar */}
            <div className="ach-card fade-up" style={{ animationDelay: '.11s' }}>
              <img src="https://res.cloudinary.com/dxsja3wy5/image/upload/w_900,q_auto,f_auto/v1772858929/bhawanipur-scholar_ylcf0y.jpg" alt="Arpit receiving The Bhawanipur Scholar 2023 award" className="card-photo" onError={e => e.target.style.display='none'} />
              <div className="p-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-violet-50/10"><i className="ri-star-line text-xl text-violet-400"></i></div>
                <span className="text-[10px] font-bold tracking-[0.18em] uppercase mb-1.5 block text-violet-400">Scholarship · 2023</span>
                <h3 className="text-base font-extrabold mb-1.5 leading-snug text-white">The Bhawanipur Scholar 2023</h3>
                <p className="text-xs leading-relaxed text-slate-400">Awarded the <span className="font-semibold text-white">Bhawanipur Scholar</span> title with a gold medal and merit certificate by Bhawanipur Education Society College for exceptional academic performance in BCom (Hons).</p>
                <div className="mt-4 pt-3 border-t flex flex-wrap gap-1.5 border-slate-700/40">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400"><i className="ri-graduation-cap-line"></i> Bhawanipur College</span>
                  <a href="https://www.thebges.edu.in/wp-content/uploads/2025/01/5.1.2-Additional-information.pdf#page=11" target="_blank" rel="noopener noreferrer" className="ext-link bg-violet-500/10 text-violet-400"><i className="ri-external-link-line"></i> Merit List</a>
                </div>
              </div>
            </div>

            {/* Head Boy */}
            <div className="ach-card fade-up" style={{ animationDelay: '.14s' }}>
              <img src="https://res.cloudinary.com/dxsja3wy5/image/upload/w_900,q_auto,f_auto/v1772858929/head-boy_exv4ka.jpg" alt="Arpit as Head Boy of LK Singhania Education Centre" className="card-photo" onError={e => e.target.style.display='none'} />
              <div className="p-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-emerald-50/10"><i className="ri-shield-star-line text-xl text-emerald-400"></i></div>
                <span className="text-[10px] font-bold tracking-[0.18em] uppercase mb-1.5 block text-emerald-400">Leadership · 2022–2023</span>
                <h3 className="text-base font-extrabold mb-1.5 leading-snug text-white">Head Boy of School</h3>
                <p className="text-xs leading-relaxed text-slate-400">Elected Head Boy of LK Singhania Education Centre, Gotan for 2022–23. Led school-wide initiatives, managed the student council, and represented the school at events.</p>
                <div className="mt-4 pt-3 border-t flex flex-wrap gap-1.5 border-slate-700/40">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400"><i className="ri-school-line"></i> LK Singhania</span>
                  <a href="https://www.lksec.org/student-council-list.php?year=2022-23" target="_blank" rel="noopener noreferrer" className="ext-link bg-emerald-500/10 text-emerald-400"><i className="ri-external-link-line"></i> Council List</a>
                </div>
              </div>
            </div>

            {/* IPSC UI/UX */}
            <div className="ach-card fade-up" style={{ animationDelay: '.17s' }}>
              <img src="https://res.cloudinary.com/dxsja3wy5/image/upload/w_900,q_auto,f_auto/v1772858928/ipsc-uiux_ssts9j.jpg" alt="IPSC IT E-Conclave 2021 Citation of Excellence for UI/UX Design" className="card-photo" style={{ objectPosition: 'center center' }} onError={e => e.target.style.display='none'} />
              <div className="p-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-pink-500/10"><i className="ri-trophy-line text-xl text-pink-400"></i></div>
                <span className="text-[10px] font-bold tracking-[0.18em] uppercase mb-1.5 block text-pink-400">Competition · Jul 2021</span>
                <h3 className="text-base font-extrabold mb-1.5 leading-snug text-white">IPSC UI/UX Design — 1st Place</h3>
                <p className="text-xs leading-relaxed text-slate-400">Secured <span className="font-semibold text-white">1st position</span> in the Ada Lovelace UI/UX Design event at IPSC IT E-Conclave 2021, hosted by BK Birla Centre for Education, Pune (Sarala Birla Group).</p>
                <div className="mt-4 pt-3 border-t flex flex-wrap gap-1.5 border-slate-700/40">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400"><i className="ri-building-line"></i> BK Birla, Pune</span>
                  <a href="https://www.figma.com/proto/UbZQ9BYBxX8aFp5ShM1jOv/bornfit?node-id=33-134&p=f&t=9NJHwR2pwj8cbIMo-1&scaling=scale-down&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=33%3A134&show-proto-sidebar=1" target="_blank" rel="noopener noreferrer" className="ext-link bg-purple-500/10 text-purple-400"><i className="ri-artboard-line"></i> Prototype</a>
                  <a href="https://www.facebook.com/share/18QVtTiKbz/" target="_blank" rel="noopener noreferrer" className="ext-link bg-blue-500/10 text-blue-400"><i className="ri-facebook-circle-fill"></i> Post</a>
                </div>
              </div>
            </div>

            {/* CA Foundation */}
            <div className="ach-card p-5 fade-up" style={{ animationDelay: '.20s' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-cyan-50/10"><i className="ri-medal-2-line text-xl text-cyan-400"></i></div>
              <span className="text-[10px] font-bold tracking-[0.18em] uppercase mb-2 block text-cyan-400">Certification · Dec 2023</span>
              <h3 className="text-base font-extrabold mb-1.5 leading-snug text-white">CA Foundation Cleared</h3>
              <p className="text-xs leading-relaxed text-slate-400">Cleared the ICAI CA Foundation exam in December 2023, qualifying to proceed to CA Intermediate — a key milestone in the Chartered Accountancy journey.</p>
              <div className="mt-4 pt-4 border-t border-slate-700/40">
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400"><i className="ri-building-line"></i> ICAI</span>
              </div>
            </div>

            {/* Founded IT Club */}
            <div className="ach-card p-5 fade-up" style={{ animationDelay: '.23s' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-blue-50/10"><i className="ri-computer-line text-xl text-blue-400"></i></div>
              <span className="text-[10px] font-bold tracking-[0.18em] uppercase mb-2 block text-blue-400">Milestone · 2022</span>
              <h3 className="text-base font-extrabold mb-1.5 leading-snug text-white">Founded School IT Club</h3>
              <p className="text-xs leading-relaxed text-slate-400">Founded and led the school's first IT Club — workshops to 40+ students in Photoshop, Figma, Arduino, and coding. Managed national-level conference representation.</p>
              <div className="mt-4 pt-4 border-t border-slate-700/40">
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400"><i className="ri-team-line"></i> 40+ Students</span>
              </div>
            </div>

            {/* Younity */}
            <div className="ach-card p-5 fade-up" style={{ animationDelay: '.26s' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-orange-500/10"><i className="ri-line-chart-line text-xl text-orange-400"></i></div>
              <span className="text-[10px] font-bold tracking-[0.18em] uppercase mb-2 block text-orange-400">Performance · 2023</span>
              <h3 className="text-base font-extrabold mb-1.5 leading-snug text-white">Top Performer — Younity.in</h3>
              <p className="text-xs leading-relaxed text-slate-400">Generated ₹10,000+ in revenue within the first month, outperforming 80% of teammates. Contract extended 3 months for exceptional results.</p>
              <div className="mt-4 pt-4 border-t border-slate-700/40">
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400"><i className="ri-building-2-line"></i> Younity.in</span>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="mt-6 text-center py-3.5 px-6 rounded-xl border text-sm bg-slate-800/50 border-slate-700/30 text-slate-500">
            &copy; 2026 Arpit Agarwala. Engineered with <span className="text-red-400">❤️</span>
          </div>
        </div>
      </div>
    </>
  );
}
