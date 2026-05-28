'use client';

import { useEffect, useRef } from 'react';
import styles from './page.module.css';

const TRADES = [
  { date:'18 Sep', open:45788.29, netPL:  164.91, close:45788.29, ret:  0.36 },
  { date:'19 Sep', open:45788.29, netPL:  280.55, close:46068.84, ret:  0.61 },
  { date:'22 Sep', open:46068.84, netPL:   53.06, close:46121.90, ret:  0.12 },
  { date:'23 Sep', open:46121.90, netPL: 2578.46, close:48700.35, ret:  5.59 },
  { date:'24 Sep', open:48700.35, netPL: -301.14, close:48399.21, ret: -0.62 },
  { date:'25 Sep', open:48399.21, netPL: -299.14, close:48100.07, ret: -0.62 },
  { date:'26 Sep', open:48100.07, netPL:  848.15, close:48948.22, ret:  1.76 },
  { date:'29 Sep', open:48948.22, netPL: 3032.26, close:50980.49, ret:  6.19 },
  { date:'30 Sep', open:50980.49, netPL: 1535.79, close:52516.28, ret:  3.01 },
  { date:'1 Oct',  open:52516.28, netPL: 3467.31, close:55983.59, ret:  6.60 },
  { date:'3 Oct',  open:55983.59, netPL:-1453.02, close:54530.57, ret: -2.60 },
  { date:'6 Oct',  open:54530.57, netPL: 3306.75, close:57837.32, ret:  6.06 },
  { date:'7 Oct',  open:57837.32, netPL: 5105.77, close:59943.09, ret:  8.83 },
  { date:'8 Oct',  open:59943.09, netPL:-1868.31, close:58074.78, ret: -3.12 },
  { date:'9 Oct',  open:58074.78, netPL:-2923.17, close:55151.62, ret: -5.03 },
  { date:'10 Oct', open:55151.62, netPL:  794.03, close:55945.65, ret:  1.44 },
  { date:'13 Oct', open:55945.65, netPL:-1253.81, close:54691.84, ret: -2.24 },
  { date:'14 Oct', open:54691.84, netPL: 7514.92, close:62206.77, ret: 13.74 },
  { date:'15 Oct', open:62206.77, netPL: -536.02, close:59670.74, ret: -0.86 },
  { date:'16 Oct', open:59670.74, netPL:-1700.17, close:57970.57, ret: -2.85 },
  { date:'17 Oct', open:57970.57, netPL: 8618.31, close:66588.88, ret: 14.87 },
];

export default function AchievementsClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const ptsRef = useRef<{x:number,y:number,t:(typeof TRADES)[0]}[]>([]);

  const closes = TRADES.map((t) => t.close);
  const minV = Math.min(...closes) * 0.998;
  const maxV = Math.max(...closes) * 1.002;
  const PAD = { top: 10, right: 10, bottom: 16, left: 10 };

  function toY(v: number, h: number) {
    return PAD.top + (1 - (v - minV) / (maxV - minV)) * (h - PAD.top - PAD.bottom);
  }
  function toX(i: number, w: number) {
    return PAD.left + i * (w - PAD.left - PAD.right) / (TRADES.length - 1);
  }

  function drawChart() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth || 400;
    const H = canvas.offsetHeight || 90;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const pts = TRADES.map((t, i) => ({ x: toX(i, W), y: toY(t.close, H), t }));
    ptsRef.current = pts;
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, 'rgba(16,185,129,0.18)');
    grad.addColorStop(1, 'rgba(16,185,129,0)');
    ctx.beginPath();
    ctx.moveTo(pts[0].x, H - PAD.bottom);
    pts.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.lineTo(pts[pts.length - 1].x, H - PAD.bottom);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.beginPath();
    pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1.8;
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.font = '9px Inter,sans-serif';
    const mi = Math.floor(TRADES.length / 2);
    ctx.textAlign = 'left';   ctx.fillText(TRADES[0].date, PAD.left, H - 3);
    ctx.textAlign = 'center'; ctx.fillText(TRADES[mi].date, pts[mi].x, H - 3);
    ctx.textAlign = 'right';  ctx.fillText(TRADES[TRADES.length - 1].date, W - PAD.right, H - 3);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.style.height = '90px';
    setTimeout(drawChart, 0);
    window.addEventListener('resize', drawChart);
    return () => window.removeEventListener('resize', drawChart);
  }, []);

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const pts = ptsRef.current;
    if (!pts.length || !canvasRef.current || !tipRef.current || !cardRef.current) return;
    const cRect = canvasRef.current.getBoundingClientRect();
    const kRect = cardRef.current.getBoundingClientRect();
    const mx = e.clientX - cRect.left;
    let best = 0, bd = Infinity;
    pts.forEach((p, i) => { const d = Math.abs(p.x - mx); if (d < bd) { bd = d; best = i; } });
    const p = pts[best];
    const t = p.t;
    const pos = t.netPL >= 0;
    drawChart();
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      const H = canvasRef.current.offsetHeight;
      const W = canvasRef.current.offsetWidth;
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
    const plSign = pos ? '+' : '';
    const plColor = pos ? '#34d399' : '#f87171';
    tipRef.current.innerHTML =
      `<span style="color:#94a3b8;font-size:9px">${t.date}</span><br>` +
      `<span style="font-weight:700">₹${t.close.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span><br>` +
      `<span style="color:${plColor};font-weight:600">${plSign}${t.ret.toFixed(2)}%&nbsp;&nbsp;${plSign}₹${Math.abs(t.netPL).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>`;
    tipRef.current.style.display = 'block';
    const dotVX = cRect.left + p.x;
    const dotVY = cRect.top + p.y;
    const dotLX = dotVX - kRect.left;
    const dotLY = dotVY - kRect.top;
    const TW = 130, TH = 58;
    let tx = dotLX + 12;
    let ty = dotLY - TH - 8;
    if (tx + TW > kRect.width) tx = dotLX - TW - 12;
    if (ty < 4) ty = dotLY + 10;
    tipRef.current.style.left = tx + 'px';
    tipRef.current.style.top = ty + 'px';
  }

  function handleMouseLeave() {
    if (tipRef.current) tipRef.current.style.display = 'none';
    drawChart();
  }

  return (
    <>
      {/* Page header */}
      <div className={`${styles.header} fade-up`}>
        <div className={styles.titleRow}>
          <div>
            <h1 className={styles.title}>Wins</h1>
            <div className={`${styles.underline} shimmer-underline`} />
          </div>
          <p className={styles.subtitle}>Awards, certifications, trading milestones &amp; leadership wins across the journey.</p>
        </div>
      </div>

      {/* Stats row */}
      <div className={`${styles.statsRow} fade-up`} style={{animationDelay:'.05s'}}>
        {[['8','Total'],['4','Awards'],['+45.5%','Trading Return'],['3','Years Active']].map(([val,lbl],i) => (
          <div key={lbl} className="stat">
            <p style={{fontSize:'1.5rem',fontWeight:900,color:['#22d3ee','#fbbf24','#34d399','#a78bfa'][i]}}>{val}</p>
            <p style={{fontSize:'0.625rem',letterSpacing:'0.08em',textTransform:'uppercase',color:'#94a3b8',marginTop:'0.125rem'}}>{lbl}</p>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className={styles.grid}>
        {/* Trading challenge card */}
        <div ref={cardRef} className={`ach-card ${styles.tradingCard} fade-up`} style={{animationDelay:'.06s'}}>
          <div ref={tipRef} id="chart-tip" />
          <div className={styles.tradingHeader}>
            <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
              <div style={{width:'2.5rem',height:'2.5rem',borderRadius:'0.75rem',background:'linear-gradient(135deg,#10b981,#22d3ee)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <i className="ri-stock-line" style={{color:'#fff',fontSize:'1.25rem'}} />
              </div>
              <div>
                <span style={{fontSize:'0.625rem',fontWeight:700,letterSpacing:'0.18em',textTransform:'uppercase',display:'block',marginBottom:'0.125rem',color:'#34d399'}}>Trading Challenge · Sep–Oct 2025</span>
                <h3 style={{fontSize:'1rem',fontWeight:800,color:'#fff',lineHeight:1.3}}>30-Day Live Trading Challenge</h3>
              </div>
            </div>
            <div style={{textAlign:'right',flexShrink:0}}>
              <p style={{fontSize:'1.5rem',fontWeight:900,lineHeight:1,color:'#34d399'}}>+45.46%</p>
              <p style={{fontSize:'0.625rem',marginTop:'0.125rem',color:'#94a3b8'}}>21 trading days</p>
            </div>
          </div>
          <div ref={wrapRef} id="chart-wrap" style={{border:'1px solid rgba(51,65,85,0.4)',borderRadius:'0.5rem',marginBottom:'0.75rem',background:'rgba(30,41,59,0.6)'}}>
            <canvas ref={canvasRef} id="equity-canvas" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} />
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0.5rem',marginBottom:'0.75rem'}}>
            {[['Best Day','+14.87%','#34d399'],['Worst Day','−5.03%','#f87171'],['Win Rate','62%','#22d3ee']].map(([lbl,val,col])=>(
              <div key={lbl} style={{border:'1px solid rgba(255,255,255,0.06)',borderRadius:'0.5rem',padding:'0.5rem 0.75rem',background:'rgba(255,255,255,0.03)'}}>
                <p style={{fontSize:'0.625rem',color:'#94a3b8'}}>{lbl}</p>
                <p style={{fontSize:'0.875rem',fontWeight:900,color:col}}>{val}</p>
              </div>
            ))}
          </div>
          <p style={{fontSize:'0.75rem',lineHeight:1.6,color:'#94a3b8'}}>Live F&amp;O challenge using SMC/ICT methodology. <span style={{fontWeight:600,color:'#fff'}}>₹45,788 → ₹66,589</span> across 21 sessions.</p>
          <div style={{marginTop:'0.75rem',paddingTop:'0.75rem',borderTop:'1px solid rgba(51,65,85,0.3)',display:'flex',flexWrap:'wrap',gap:'0.375rem'}}>
            <span style={{display:'inline-flex',alignItems:'center',gap:'0.25rem',fontSize:'0.625rem',fontWeight:600,padding:'0.125rem 0.5rem',borderRadius:'9999px',background:'rgba(16,185,129,0.1)',color:'#34d399'}}><i className="ri-line-chart-line" /> SMC/ICT</span>
            <span style={{display:'inline-flex',alignItems:'center',gap:'0.25rem',fontSize:'0.625rem',fontWeight:600,padding:'0.125rem 0.5rem',borderRadius:'9999px',background:'rgba(34,211,238,0.1)',color:'#22d3ee'}}><i className="ri-calendar-check-line" /> Sep 18 – Oct 17, 2025</span>
          </div>
        </div>

        {/* Chairman Award */}
        <div className={`ach-card fade-up`} style={{animationDelay:'.08s'}}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://res.cloudinary.com/dxsja3wy5/image/upload/w_900,q_auto,f_auto/v1772858929/chairman-award_clz2ft.jpg" alt="Arpit receiving Chairman Award from Archana Puran Singh" className="card-photo" />
          <div style={{padding:'1.25rem'}}>
            <div style={{width:'2.5rem',height:'2.5rem',borderRadius:'0.75rem',background:'rgba(245,158,11,0.1)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'0.75rem'}}><i className="ri-award-line" style={{fontSize:'1.25rem',color:'#fbbf24'}} /></div>
            <span style={{fontSize:'0.625rem',fontWeight:700,letterSpacing:'0.18em',textTransform:'uppercase',display:'block',marginBottom:'0.375rem',color:'#fbbf24'}}>Award · Sep 2023</span>
            <h3 style={{fontSize:'1rem',fontWeight:800,marginBottom:'0.375rem',color:'#fff'}}>Chairman Award</h3>
            <p style={{fontSize:'0.75rem',lineHeight:1.6,color:'#94a3b8'}}>Presented by actress &amp; TV personality <span style={{fontWeight:600,color:'#fff'}}>Archana Puran Singh</span> at LK Singhania Education Centre's Annual Prize Giving Function for outstanding leadership as Head Boy.</p>
            <div style={{marginTop:'1rem',paddingTop:'0.75rem',borderTop:'1px solid rgba(51,65,85,0.4)',display:'flex',flexWrap:'wrap',gap:'0.375rem'}}>
              <span style={{display:'inline-flex',alignItems:'center',gap:'0.25rem',fontSize:'0.625rem',fontWeight:600,padding:'0.125rem 0.5rem',borderRadius:'9999px',background:'rgba(245,158,11,0.1)',color:'#fbbf24'}}><i className="ri-school-line" /> LK Singhania</span>
              <a href="https://www.facebook.com/share/p/1Mi9xyd8sV/" target="_blank" rel="noopener" className="ext-link" style={{background:'rgba(59,130,246,0.1)',color:'#60a5fa'}}><i className="ri-facebook-circle-fill" /> View Post</a>
            </div>
          </div>
        </div>

        {/* Bhawanipur Scholar */}
        <div className={`ach-card fade-up`} style={{animationDelay:'.11s'}}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://res.cloudinary.com/dxsja3wy5/image/upload/w_900,q_auto,f_auto/v1772858929/bhawanipur-scholar_ylcf0y.jpg" alt="Arpit receiving The Bhawanipur Scholar 2023 award" className="card-photo" />
          <div style={{padding:'1.25rem'}}>
            <div style={{width:'2.5rem',height:'2.5rem',borderRadius:'0.75rem',background:'rgba(139,92,246,0.1)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'0.75rem'}}><i className="ri-star-line" style={{fontSize:'1.25rem',color:'#a78bfa'}} /></div>
            <span style={{fontSize:'0.625rem',fontWeight:700,letterSpacing:'0.18em',textTransform:'uppercase',display:'block',marginBottom:'0.375rem',color:'#a78bfa'}}>Scholarship · 2023</span>
            <h3 style={{fontSize:'1rem',fontWeight:800,marginBottom:'0.375rem',color:'#fff'}}>The Bhawanipur Scholar 2023</h3>
            <p style={{fontSize:'0.75rem',lineHeight:1.6,color:'#94a3b8'}}>Awarded the <span style={{fontWeight:600,color:'#fff'}}>Bhawanipur Scholar</span> title with a gold medal and merit certificate for exceptional academic performance in BCom (Hons).</p>
            <div style={{marginTop:'1rem',paddingTop:'0.75rem',borderTop:'1px solid rgba(51,65,85,0.4)',display:'flex',flexWrap:'wrap',gap:'0.375rem'}}>
              <span style={{display:'inline-flex',alignItems:'center',gap:'0.25rem',fontSize:'0.625rem',fontWeight:600,padding:'0.125rem 0.5rem',borderRadius:'9999px',background:'rgba(139,92,246,0.1)',color:'#a78bfa'}}><i className="ri-graduation-cap-line" /> Bhawanipur College</span>
              <a href="https://www.thebges.edu.in/wp-content/uploads/2025/01/5.1.2-Additional-information.pdf#page=11" target="_blank" rel="noopener" className="ext-link" style={{background:'rgba(139,92,246,0.1)',color:'#a78bfa'}}><i className="ri-external-link-line" /> Merit List</a>
            </div>
          </div>
        </div>

        {/* Head Boy */}
        <div className={`ach-card fade-up`} style={{animationDelay:'.14s'}}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://res.cloudinary.com/dxsja3wy5/image/upload/w_900,q_auto,f_auto/v1772858929/head-boy_exv4ka.jpg" alt="Arpit as Head Boy" className="card-photo" />
          <div style={{padding:'1.25rem'}}>
            <div style={{width:'2.5rem',height:'2.5rem',borderRadius:'0.75rem',background:'rgba(16,185,129,0.1)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'0.75rem'}}><i className="ri-shield-star-line" style={{fontSize:'1.25rem',color:'#34d399'}} /></div>
            <span style={{fontSize:'0.625rem',fontWeight:700,letterSpacing:'0.18em',textTransform:'uppercase',display:'block',marginBottom:'0.375rem',color:'#34d399'}}>Leadership · 2022–2023</span>
            <h3 style={{fontSize:'1rem',fontWeight:800,marginBottom:'0.375rem',color:'#fff'}}>Head Boy of School</h3>
            <p style={{fontSize:'0.75rem',lineHeight:1.6,color:'#94a3b8'}}>Elected Head Boy of LK Singhania Education Centre, Gotan for 2022–23. Led school-wide initiatives and represented the school at events.</p>
            <div style={{marginTop:'1rem',paddingTop:'0.75rem',borderTop:'1px solid rgba(51,65,85,0.4)',display:'flex',flexWrap:'wrap',gap:'0.375rem'}}>
              <span style={{display:'inline-flex',alignItems:'center',gap:'0.25rem',fontSize:'0.625rem',fontWeight:600,padding:'0.125rem 0.5rem',borderRadius:'9999px',background:'rgba(16,185,129,0.1)',color:'#34d399'}}><i className="ri-school-line" /> LK Singhania</span>
              <a href="https://www.lksec.org/student-council-list.php?year=2022-23" target="_blank" rel="noopener" className="ext-link" style={{background:'rgba(16,185,129,0.1)',color:'#34d399'}}><i className="ri-external-link-line" /> Council List</a>
            </div>
          </div>
        </div>

        {/* IPSC */}
        <div className={`ach-card fade-up`} style={{animationDelay:'.17s'}}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://res.cloudinary.com/dxsja3wy5/image/upload/w_900,q_auto,f_auto/v1772858928/ipsc-uiux_ssts9j.jpg" alt="IPSC UI/UX 1st Place" className="card-photo" />
          <div style={{padding:'1.25rem'}}>
            <div style={{width:'2.5rem',height:'2.5rem',borderRadius:'0.75rem',background:'rgba(244,114,182,0.1)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'0.75rem'}}><i className="ri-trophy-line" style={{fontSize:'1.25rem',color:'#f472b6'}} /></div>
            <span style={{fontSize:'0.625rem',fontWeight:700,letterSpacing:'0.18em',textTransform:'uppercase',display:'block',marginBottom:'0.375rem',color:'#f472b6'}}>Competition · Jul 2021</span>
            <h3 style={{fontSize:'1rem',fontWeight:800,marginBottom:'0.375rem',color:'#fff'}}>IPSC UI/UX Design — 1st Place</h3>
            <p style={{fontSize:'0.75rem',lineHeight:1.6,color:'#94a3b8'}}>Secured <span style={{fontWeight:600,color:'#fff'}}>1st position</span> in Ada Lovelace UI/UX Design at IPSC IT E-Conclave 2021 hosted by BK Birla Centre for Education, Pune.</p>
            <div style={{marginTop:'1rem',paddingTop:'0.75rem',borderTop:'1px solid rgba(51,65,85,0.4)',display:'flex',flexWrap:'wrap',gap:'0.375rem'}}>
              <span style={{display:'inline-flex',alignItems:'center',gap:'0.25rem',fontSize:'0.625rem',fontWeight:600,padding:'0.125rem 0.5rem',borderRadius:'9999px',background:'rgba(244,114,182,0.1)',color:'#f472b6'}}><i className="ri-building-line" /> BK Birla, Pune</span>
              <a href="https://www.figma.com/proto/UbZQ9BYBxX8aFp5ShM1jOv/bornfit?node-id=33-134" target="_blank" rel="noopener" className="ext-link" style={{background:'rgba(139,92,246,0.1)',color:'#a78bfa'}}><i className="ri-artboard-line" /> Prototype</a>
            </div>
          </div>
        </div>

        {/* CA Foundation */}
        <div className={`ach-card fade-up`} style={{padding:'1.25rem',animationDelay:'.20s'}}>
          <div style={{width:'2.5rem',height:'2.5rem',borderRadius:'0.75rem',background:'rgba(34,211,238,0.1)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'1rem'}}><i className="ri-medal-2-line" style={{fontSize:'1.25rem',color:'#22d3ee'}} /></div>
          <span style={{fontSize:'0.625rem',fontWeight:700,letterSpacing:'0.18em',textTransform:'uppercase',display:'block',marginBottom:'0.5rem',color:'#22d3ee'}}>Certification · Dec 2023</span>
          <h3 style={{fontSize:'1rem',fontWeight:800,marginBottom:'0.375rem',color:'#fff'}}>CA Foundation Cleared</h3>
          <p style={{fontSize:'0.75rem',lineHeight:1.6,color:'#94a3b8'}}>Cleared the ICAI CA Foundation exam in December 2023, qualifying to proceed to CA Intermediate.</p>
          <div style={{marginTop:'1rem',paddingTop:'1rem',borderTop:'1px solid rgba(51,65,85,0.4)'}}>
            <span style={{display:'inline-flex',alignItems:'center',gap:'0.25rem',fontSize:'0.625rem',fontWeight:600,padding:'0.125rem 0.5rem',borderRadius:'9999px',background:'rgba(34,211,238,0.1)',color:'#22d3ee'}}><i className="ri-building-line" /> ICAI</span>
          </div>
        </div>

        {/* IT Club */}
        <div className={`ach-card fade-up`} style={{padding:'1.25rem',animationDelay:'.23s'}}>
          <div style={{width:'2.5rem',height:'2.5rem',borderRadius:'0.75rem',background:'rgba(59,130,246,0.1)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'1rem'}}><i className="ri-computer-line" style={{fontSize:'1.25rem',color:'#60a5fa'}} /></div>
          <span style={{fontSize:'0.625rem',fontWeight:700,letterSpacing:'0.18em',textTransform:'uppercase',display:'block',marginBottom:'0.5rem',color:'#60a5fa'}}>Milestone · 2022</span>
          <h3 style={{fontSize:'1rem',fontWeight:800,marginBottom:'0.375rem',color:'#fff'}}>Founded School IT Club</h3>
          <p style={{fontSize:'0.75rem',lineHeight:1.6,color:'#94a3b8'}}>Founded and led the school's first IT Club — workshops to 40+ students in Photoshop, Figma, Arduino, and coding.</p>
          <div style={{marginTop:'1rem',paddingTop:'1rem',borderTop:'1px solid rgba(51,65,85,0.4)'}}>
            <span style={{display:'inline-flex',alignItems:'center',gap:'0.25rem',fontSize:'0.625rem',fontWeight:600,padding:'0.125rem 0.5rem',borderRadius:'9999px',background:'rgba(59,130,246,0.1)',color:'#60a5fa'}}><i className="ri-team-line" /> 40+ Students</span>
          </div>
        </div>

        {/* Younity */}
        <div className={`ach-card fade-up`} style={{padding:'1.25rem',animationDelay:'.26s'}}>
          <div style={{width:'2.5rem',height:'2.5rem',borderRadius:'0.75rem',background:'rgba(234,88,12,0.1)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'1rem'}}><i className="ri-line-chart-line" style={{fontSize:'1.25rem',color:'#fb923c'}} /></div>
          <span style={{fontSize:'0.625rem',fontWeight:700,letterSpacing:'0.18em',textTransform:'uppercase',display:'block',marginBottom:'0.5rem',color:'#fb923c'}}>Performance · 2023</span>
          <h3 style={{fontSize:'1rem',fontWeight:800,marginBottom:'0.375rem',color:'#fff'}}>Top Performer — Younity.in</h3>
          <p style={{fontSize:'0.75rem',lineHeight:1.6,color:'#94a3b8'}}>Generated ₹10,000+ in revenue within the first month, outperforming 80% of teammates. Contract extended 3 months.</p>
          <div style={{marginTop:'1rem',paddingTop:'1rem',borderTop:'1px solid rgba(51,65,85,0.4)'}}>
            <span style={{display:'inline-flex',alignItems:'center',gap:'0.25rem',fontSize:'0.625rem',fontWeight:600,padding:'0.125rem 0.5rem',borderRadius:'9999px',background:'rgba(234,88,12,0.1)',color:'#fb923c'}}><i className="ri-building-2-line" /> Younity.in</span>
          </div>
        </div>
      </div>
    </>
  );
}
