'use client';

import { useState } from 'react';
import styles from './page.module.css';
import type {SiteConfig} from '@/lib/site-config';
import achievementSeeds from '@/data/site-achievements';

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

function TradingChart(){
 const [selected,setSelected]=useState(TRADES.length-1),[view,setView]=useState<'balance'|'returns'>('balance'),trade=TRADES[selected];
 const values=TRADES.map(t=>view==='balance'?t.close:t.ret),min=Math.min(...values,view==='returns'?0:Infinity),max=Math.max(...values,view==='returns'?0:-Infinity);
 const y=(value:number)=>16+(max-value)/(max-min||1)*132;
 const points=values.map((value,i)=>({x:16+i*568/(TRADES.length-1),y:y(value)}));
 const path=points.map((p,i)=>(i?'L':'M')+p.x+','+p.y).join(' '),point=points[selected];
 const money=(value:number)=>'₹'+value.toLocaleString('en-IN',{maximumFractionDigits:0});
 function pick(e:React.PointerEvent<SVGSVGElement>){const rect=e.currentTarget.getBoundingClientRect(),x=(e.clientX-rect.left)/rect.width*600;setSelected(Math.max(0,Math.min(TRADES.length-1,Math.round((x-16)/568*(TRADES.length-1)))));}
 return <div className={styles.chart}>
  <div className={styles.chartHeading}><span><i className="ri-line-chart-line" aria-hidden="true"/> The trading journey</span><div className={styles.chartTabs} role="group" aria-label="Chart view"><button type="button" aria-pressed={view==='balance'} onClick={()=>setView('balance')}>Balance</button><button type="button" aria-pressed={view==='returns'} onClick={()=>setView('returns')}>Daily return</button></div></div>
  <div className={styles.chartReadout}><div><span>{trade.date} 2025 <span className={styles.sessionNumber}>/ Session {selected+1} of {TRADES.length}</span></span><strong>{view==='balance'?money(trade.close):(trade.ret>=0?'+':'')+trade.ret.toFixed(2)+'%'}</strong><small>{view==='balance'?'Closing balance':'Reported session return'}</small></div><div className={styles.chartSecondary}><span>{view==='balance'?'Session return':'Closing balance'}</span><strong className={view==='balance'?(trade.ret>=0?styles.positive:styles.negative):undefined}>{view==='balance'?(trade.ret>=0?'+':'')+trade.ret.toFixed(2)+'%':money(trade.close)}</strong></div></div>
  <svg className={styles.equityPlot} viewBox="0 0 600 164" preserveAspectRatio="none" role="img" aria-label={view==='balance'?'Closing balance across 21 recorded trading sessions, from 45,788 to 66,589 rupees':'Reported daily returns across 21 recorded trading sessions, from minus 5.03 to plus 14.87 percent'} onPointerDown={pick} onPointerMove={e=>{if(e.pointerType==='mouse'||e.buttons)pick(e);}}>
   <defs><linearGradient id="achievement-equity" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#cbb580" stopOpacity=".2"/><stop offset="100%" stopColor="#cbb580" stopOpacity="0"/></linearGradient></defs>
   {[16,82,148].map(line=><line key={line} x1="16" x2="584" y1={line} y2={line} stroke="#605543" strokeOpacity=".25" strokeDasharray="3 6"/>)}
   {view==='balance'?<><path d={path+' L584,156 L16,156 Z'} fill="url(#achievement-equity)"/><path d={path} fill="none" stroke="#d9c48f" strokeWidth="2" vectorEffect="non-scaling-stroke"/><line x1={point.x} x2={point.x} y1="10" y2="156" stroke="#9c917d" strokeDasharray="3 5"/><circle cx={point.x} cy={point.y} r="4" fill="#f2dfb4" stroke="#30291d" strokeWidth="2"/></>:<><line x1="8" x2="592" y1={y(0)} y2={y(0)} stroke="#857867" strokeWidth="1"/>{points.map((p,i)=><rect key={i} x={p.x-7} y={Math.min(y(0),p.y)} width="14" height={Math.max(2,Math.abs(y(0)-p.y))} rx="2" fill={TRADES[i].ret>=0?'#93c9ae':'#df9d99'} opacity={selected===i?1:.5}/>)}</>}
  </svg>
  <div className={styles.chartDates}><span>18 Sep</span><span>{view==='balance'?'Closing balance · INR':'Session return · %'}</span><span>17 Oct 2025</span></div>
  <div className={styles.sessionControl}><button type="button" aria-label="Previous trading session" disabled={selected===0} onClick={()=>setSelected(i=>i-1)}><i className="ri-arrow-left-s-line" aria-hidden="true"/></button><label>Explore sessions<input type="range" min="0" max={TRADES.length-1} value={selected} aria-label="Trading session" aria-valuetext={trade.date+' 2025, closing balance '+trade.close+' rupees, reported return '+trade.ret+' percent'} onChange={e=>setSelected(Number(e.target.value))}/></label><button type="button" aria-label="Next trading session" disabled={selected===TRADES.length-1} onClick={()=>setSelected(i=>i+1)}><i className="ri-arrow-right-s-line" aria-hidden="true"/></button></div>
 </div>;
}
export default function AchievementsClient({content}:{content:SiteConfig['achievements']}) {
 const enabled=content.items.filter(item=>item.enabled);
  return (
    <>
      {/* Page header */}
      <div className={`${styles.header} fade-up`}>
        <p className={styles.eyebrow}>THE WORK. THE RECOGNITION.</p>
        <div className={styles.titleRow}>
          <div>
            <h1 className={styles.title}>{content.title}</h1>
            <div className={`${styles.underline} shimmer-underline`} />
          </div>
          <p className={styles.subtitle}>{content.description}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className={`${styles.statsRow} fade-up`} style={{animationDelay:'.05s'}}>
        {[[String(enabled.length),'Milestones'],[String(enabled.filter(item=>item.href).length),'Publication links']].map(([val,lbl]) => (
          <div key={lbl} className="stat">
            <p style={{fontSize:'1.5rem',fontWeight:900,color:'#e6cf9d'}}>{val}</p>
            <p style={{fontSize:'0.75rem',letterSpacing:'0.08em',textTransform:'uppercase',color:'#b8b7c4',marginTop:'0.125rem'}}>{lbl}</p>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className={styles.grid}>
        {content.items.filter(item=>item.enabled).map(item=>{
        if(item.id==='achievement-0')return (
 <div key={item.id} className={`ach-card ${styles.tradingCard} fade-up`}>
  {/* eslint-disable-next-line @next/next/no-img-element */}
  {item.bannerUrl&&<img src={item.bannerUrl} alt={item.bannerAlt||item.title} className="card-photo" loading="lazy"/>}
  <div className={styles.tradingHeader}><div className={styles.tradingIdentity}><span className={styles.tradingIcon}><i className="ri-stock-line" aria-hidden="true"/></span><div><p className={styles.tradingEyebrow}>{item.subtitle}{item.period?' · '+item.period:''}</p><h2>{item.title}</h2></div></div><div className={styles.tradingResult}><span>Challenge return</span><strong>+45.46%</strong><small>21 trading sessions</small></div></div>
  <TradingChart/>
  <div className={styles.tradingStats}>{[['ri-arrow-right-up-line','Best session','+14.87%',styles.positive],['ri-arrow-right-down-line','Worst session','−5.03%',styles.negative],['ri-focus-3-line','Winning sessions','62%',styles.warm]].map(([icon,label,value,color])=><div key={label}><i className={icon} aria-hidden="true"/><span>{label}</span><strong className={color}>{value}</strong></div>)}</div>
  <p className={styles.tradingDescription}>{item.detail===achievementSeeds[0].detail?<>Live F&amp;O challenge using SMC/ICT methodology. <strong>₹45,788 → ₹66,589</strong> across 21 sessions.</>:item.detail}</p>
  <div className={styles.cardFooter}><span style={{background:'rgba(147,201,174,.1)',color:'#acd5bc'}}><i className="ri-line-chart-line" aria-hidden="true"/> SMC/ICT</span><span style={{background:'rgba(217,196,143,.1)',color:'#d9c48f'}}><i className="ri-calendar-check-line" aria-hidden="true"/> Sep 18 – Oct 17, 2025</span>{item.href&&<a href={item.href} target="_blank" rel="noopener noreferrer" className="ext-link" style={{background:'rgba(217,196,143,.1)',color:'#d9c48f'}}><i className="ri-external-link-line" aria-hidden="true"/>{item.linkLabel||'View publication'}</a>}</div>
 </div>
        );
        if(item.id==='achievement-1')return (
<div key={item.id} className={`ach-card fade-up`} style={{animationDelay:'.08s'}}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {item.bannerUrl&&<img src={item.bannerUrl} alt={item.bannerAlt||item.title} className="card-photo" loading="lazy"/>}
          <div className={styles.cardBody} style={{padding:'1.25rem'}}>
            <div style={{width:'2.5rem',height:'2.5rem',borderRadius:'0.75rem',background:'rgba(245,158,11,0.1)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'0.75rem'}}><i className="ri-award-line" style={{fontSize:'1.25rem',color:'#fbbf24'}} /></div>
            <span style={{fontSize:'0.75rem',fontWeight:700,letterSpacing:'0.18em',textTransform:'uppercase',display:'block',marginBottom:'0.375rem',color:'#fbbf24'}}>{item.subtitle}{item.period?' · '+item.period:''}</span>
            <h2 style={{fontSize:'1rem',fontWeight:800,marginBottom:'0.375rem',color:'#fff'}}>{item.title}</h2>
            <p style={{fontSize:'0.9rem',lineHeight:1.8,color:'#b8b7c4',whiteSpace:'pre-line'}}>{item.detail===achievementSeeds[1].detail?<>Presented by actress &amp; TV personality <span style={{fontWeight:600,color:'#fff'}}>Archana Puran Singh</span> at LK Singhania Education Centre&apos;s Annual Prize Giving Function for outstanding leadership as Head Boy.</>:item.detail}</p>
            <div className={styles.cardFooter} style={{marginTop:'1rem',paddingTop:'0.75rem',borderTop:'1px solid rgba(51,65,85,0.4)',display:'flex',flexWrap:'wrap',gap:'0.375rem'}}>
              <span style={{display:'inline-flex',alignItems:'center',gap:'0.25rem',fontSize:'0.75rem',fontWeight:600,padding:'0.125rem 0.5rem',borderRadius:'9999px',background:'rgba(245,158,11,0.1)',color:'#fbbf24'}}><i className="ri-school-line" /> LK Singhania</span>
              {item.href&&<a href={item.href} target="_blank" rel="noopener noreferrer" className="ext-link" style={{background:'rgba(59,130,246,0.1)',color:'#60a5fa'}}><i className="ri-facebook-circle-fill" /> {item.linkLabel||'View publication'}</a>}
            </div>
          </div>
        </div>
        );
        if(item.id==='achievement-2')return (
<div key={item.id} className={`ach-card fade-up`} style={{animationDelay:'.11s'}}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {item.bannerUrl&&<img src={item.bannerUrl} alt={item.bannerAlt||item.title} className="card-photo" loading="lazy"/>}
          <div className={styles.cardBody} style={{padding:'1.25rem'}}>
            <div style={{width:'2.5rem',height:'2.5rem',borderRadius:'0.75rem',background:'rgba(139,92,246,0.1)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'0.75rem'}}><i className="ri-star-line" style={{fontSize:'1.25rem',color:'#a78bfa'}} /></div>
            <span style={{fontSize:'0.75rem',fontWeight:700,letterSpacing:'0.18em',textTransform:'uppercase',display:'block',marginBottom:'0.375rem',color:'#a78bfa'}}>{item.subtitle}{item.period?' · '+item.period:''}</span>
            <h2 style={{fontSize:'1rem',fontWeight:800,marginBottom:'0.375rem',color:'#fff'}}>{item.title}</h2>
            <p style={{fontSize:'0.9rem',lineHeight:1.8,color:'#b8b7c4',whiteSpace:'pre-line'}}>{item.detail===achievementSeeds[2].detail?<>Awarded the <span style={{fontWeight:600,color:'#fff'}}>Bhawanipur Scholar</span> title with a gold medal and merit certificate for exceptional academic performance in BCom (Hons).</>:item.detail}</p>
            <div className={styles.cardFooter} style={{marginTop:'1rem',paddingTop:'0.75rem',borderTop:'1px solid rgba(51,65,85,0.4)',display:'flex',flexWrap:'wrap',gap:'0.375rem'}}>
              <span style={{display:'inline-flex',alignItems:'center',gap:'0.25rem',fontSize:'0.75rem',fontWeight:600,padding:'0.125rem 0.5rem',borderRadius:'9999px',background:'rgba(139,92,246,0.1)',color:'#a78bfa'}}><i className="ri-graduation-cap-line" /> Bhawanipur College</span>
              {item.href&&<a href={item.href} target="_blank" rel="noopener noreferrer" className="ext-link" style={{background:'rgba(139,92,246,0.1)',color:'#a78bfa'}}><i className="ri-external-link-line" /> {item.linkLabel||'View publication'}</a>}
            </div>
          </div>
        </div>
        );
        if(item.id==='achievement-3')return (
<div key={item.id} className={`ach-card fade-up`} style={{animationDelay:'.14s'}}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {item.bannerUrl&&<img src={item.bannerUrl} alt={item.bannerAlt||item.title} className="card-photo" loading="lazy"/>}
          <div className={styles.cardBody} style={{padding:'1.25rem'}}>
            <div style={{width:'2.5rem',height:'2.5rem',borderRadius:'0.75rem',background:'rgba(16,185,129,0.1)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'0.75rem'}}><i className="ri-shield-star-line" style={{fontSize:'1.25rem',color:'#34d399'}} /></div>
            <span style={{fontSize:'0.75rem',fontWeight:700,letterSpacing:'0.18em',textTransform:'uppercase',display:'block',marginBottom:'0.375rem',color:'#34d399'}}>{item.subtitle}{item.period?' · '+item.period:''}</span>
            <h2 style={{fontSize:'1rem',fontWeight:800,marginBottom:'0.375rem',color:'#fff'}}>{item.title}</h2>
            <p style={{fontSize:'0.9rem',lineHeight:1.8,color:'#b8b7c4',whiteSpace:'pre-line'}}>{item.detail===achievementSeeds[3].detail?<>Elected Head Boy of LK Singhania Education Centre, Gotan for 2022–23. Led school-wide initiatives and represented the school at events.</>:item.detail}</p>
            <div className={styles.cardFooter} style={{marginTop:'1rem',paddingTop:'0.75rem',borderTop:'1px solid rgba(51,65,85,0.4)',display:'flex',flexWrap:'wrap',gap:'0.375rem'}}>
              <span style={{display:'inline-flex',alignItems:'center',gap:'0.25rem',fontSize:'0.75rem',fontWeight:600,padding:'0.125rem 0.5rem',borderRadius:'9999px',background:'rgba(16,185,129,0.1)',color:'#34d399'}}><i className="ri-school-line" /> LK Singhania</span>
              {item.href&&<a href={item.href} target="_blank" rel="noopener noreferrer" className="ext-link" style={{background:'rgba(16,185,129,0.1)',color:'#34d399'}}><i className="ri-external-link-line" /> {item.linkLabel||'View publication'}</a>}
            </div>
          </div>
        </div>
        );
        if(item.id==='achievement-4')return (
<div key={item.id} className={`ach-card fade-up`} style={{animationDelay:'.17s'}}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {item.bannerUrl&&<img src={item.bannerUrl} alt={item.bannerAlt||item.title} className="card-photo" loading="lazy"/>}
          <div className={styles.cardBody} style={{padding:'1.25rem'}}>
            <div style={{width:'2.5rem',height:'2.5rem',borderRadius:'0.75rem',background:'rgba(244,114,182,0.1)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'0.75rem'}}><i className="ri-trophy-line" style={{fontSize:'1.25rem',color:'#f472b6'}} /></div>
            <span style={{fontSize:'0.75rem',fontWeight:700,letterSpacing:'0.18em',textTransform:'uppercase',display:'block',marginBottom:'0.375rem',color:'#f472b6'}}>{item.subtitle}{item.period?' · '+item.period:''}</span>
            <h2 style={{fontSize:'1rem',fontWeight:800,marginBottom:'0.375rem',color:'#fff'}}>{item.title}</h2>
            <p style={{fontSize:'0.9rem',lineHeight:1.8,color:'#b8b7c4',whiteSpace:'pre-line'}}>{item.detail===achievementSeeds[4].detail?<>Secured <span style={{fontWeight:600,color:'#fff'}}>1st position</span> in Ada Lovelace UI/UX Design at IPSC IT E-Conclave 2021 hosted by BK Birla Centre for Education, Pune.</>:item.detail}</p>
            <div className={styles.cardFooter} style={{marginTop:'1rem',paddingTop:'0.75rem',borderTop:'1px solid rgba(51,65,85,0.4)',display:'flex',flexWrap:'wrap',gap:'0.375rem'}}>
              <span style={{display:'inline-flex',alignItems:'center',gap:'0.25rem',fontSize:'0.75rem',fontWeight:600,padding:'0.125rem 0.5rem',borderRadius:'9999px',background:'rgba(244,114,182,0.1)',color:'#f472b6'}}><i className="ri-building-line" /> BK Birla, Pune</span>
              {item.href&&<a href={item.href} target="_blank" rel="noopener noreferrer" className="ext-link" style={{background:'rgba(139,92,246,0.1)',color:'#a78bfa'}}><i className="ri-artboard-line" /> {item.linkLabel||'View publication'}</a>}
            </div>
          </div>
        </div>
        );
        if(item.id==='achievement-5')return (
<div key={item.id} className={`ach-card ${styles.simpleCard} fade-up`} style={{padding:'1.25rem',animationDelay:'.20s'}}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {item.bannerUrl&&<img src={item.bannerUrl} alt={item.bannerAlt||item.title} className="card-photo" loading="lazy"/>}
          <div style={{width:'2.5rem',height:'2.5rem',borderRadius:'0.75rem',background:'rgba(34,211,238,0.1)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'1rem'}}><i className="ri-medal-2-line" style={{fontSize:'1.25rem',color:'#22d3ee'}} /></div>
          <span style={{fontSize:'0.75rem',fontWeight:700,letterSpacing:'0.18em',textTransform:'uppercase',display:'block',marginBottom:'0.5rem',color:'#22d3ee'}}>{item.subtitle}{item.period?' · '+item.period:''}</span>
          <h2 style={{fontSize:'1rem',fontWeight:800,marginBottom:'0.375rem',color:'#fff'}}>{item.title}</h2>
          <p style={{fontSize:'0.9rem',lineHeight:1.8,color:'#b8b7c4',whiteSpace:'pre-line'}}>{item.detail===achievementSeeds[5].detail?<>Cleared the ICAI CA Foundation exam, qualifying to proceed to CA Intermediate.</>:item.detail}</p>
          <div className={styles.cardFooter} style={{marginTop:'1rem',paddingTop:'1rem',borderTop:'1px solid rgba(51,65,85,0.4)'}}>
            <span style={{display:'inline-flex',alignItems:'center',gap:'0.25rem',fontSize:'0.75rem',fontWeight:600,padding:'0.125rem 0.5rem',borderRadius:'9999px',background:'rgba(34,211,238,0.1)',color:'#22d3ee'}}><i className="ri-building-line" /> ICAI</span>
          </div>
        {item.href&&<a href={item.href} target="_blank" rel="noopener noreferrer" className="ext-link" style={{background:'rgba(34,211,238,0.1)',color:'#22d3ee',marginTop:'0.75rem'}}><i className="ri-external-link-line"/> {item.linkLabel||'View publication'}</a>}
</div>
        );
        if(item.id==='achievement-6')return (
<div key={item.id} className={`ach-card ${styles.simpleCard} fade-up`} style={{padding:'1.25rem',animationDelay:'.23s'}}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {item.bannerUrl&&<img src={item.bannerUrl} alt={item.bannerAlt||item.title} className="card-photo" loading="lazy"/>}
          <div style={{width:'2.5rem',height:'2.5rem',borderRadius:'0.75rem',background:'rgba(59,130,246,0.1)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'1rem'}}><i className="ri-computer-line" style={{fontSize:'1.25rem',color:'#60a5fa'}} /></div>
          <span style={{fontSize:'0.75rem',fontWeight:700,letterSpacing:'0.18em',textTransform:'uppercase',display:'block',marginBottom:'0.5rem',color:'#60a5fa'}}>{item.subtitle}{item.period?' · '+item.period:''}</span>
          <h2 style={{fontSize:'1rem',fontWeight:800,marginBottom:'0.375rem',color:'#fff'}}>{item.title}</h2>
          <p style={{fontSize:'0.9rem',lineHeight:1.8,color:'#b8b7c4',whiteSpace:'pre-line'}}>{item.detail===achievementSeeds[6].detail?<>Founded and led the school&apos;s first IT Club — workshops to 40+ students in Photoshop, Figma, Arduino, and coding.</>:item.detail}</p>
          <div className={styles.cardFooter} style={{marginTop:'1rem',paddingTop:'1rem',borderTop:'1px solid rgba(51,65,85,0.4)'}}>
            <span style={{display:'inline-flex',alignItems:'center',gap:'0.25rem',fontSize:'0.75rem',fontWeight:600,padding:'0.125rem 0.5rem',borderRadius:'9999px',background:'rgba(59,130,246,0.1)',color:'#60a5fa'}}><i className="ri-team-line" /> 40+ Students</span>
          </div>
        {item.href&&<a href={item.href} target="_blank" rel="noopener noreferrer" className="ext-link" style={{background:'rgba(34,211,238,0.1)',color:'#22d3ee',marginTop:'0.75rem'}}><i className="ri-external-link-line"/> {item.linkLabel||'View publication'}</a>}
</div>
        );
        if(item.id==='achievement-7')return (
<div key={item.id} className={`ach-card ${styles.simpleCard} fade-up`} style={{padding:'1.25rem',animationDelay:'.26s'}}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {item.bannerUrl&&<img src={item.bannerUrl} alt={item.bannerAlt||item.title} className="card-photo" loading="lazy"/>}
          <div style={{width:'2.5rem',height:'2.5rem',borderRadius:'0.75rem',background:'rgba(234,88,12,0.1)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'1rem'}}><i className="ri-line-chart-line" style={{fontSize:'1.25rem',color:'#fb923c'}} /></div>
          <span style={{fontSize:'0.75rem',fontWeight:700,letterSpacing:'0.18em',textTransform:'uppercase',display:'block',marginBottom:'0.5rem',color:'#fb923c'}}>{item.subtitle}{item.period?' · '+item.period:''}</span>
          <h2 style={{fontSize:'1rem',fontWeight:800,marginBottom:'0.375rem',color:'#fff'}}>{item.title}</h2>
          <p style={{fontSize:'0.9rem',lineHeight:1.8,color:'#b8b7c4',whiteSpace:'pre-line'}}>{item.detail===achievementSeeds[7].detail?<>Generated ₹10,000+ in revenue within the first month, outperforming 80% of teammates. Contract extended 3 months.</>:item.detail}</p>
          <div className={styles.cardFooter} style={{marginTop:'1rem',paddingTop:'1rem',borderTop:'1px solid rgba(51,65,85,0.4)'}}>
            <span style={{display:'inline-flex',alignItems:'center',gap:'0.25rem',fontSize:'0.75rem',fontWeight:600,padding:'0.125rem 0.5rem',borderRadius:'9999px',background:'rgba(234,88,12,0.1)',color:'#fb923c'}}><i className="ri-building-2-line" /> Younity.in</span>
          </div>
        {item.href&&<a href={item.href} target="_blank" rel="noopener noreferrer" className="ext-link" style={{background:'rgba(34,211,238,0.1)',color:'#22d3ee',marginTop:'0.75rem'}}><i className="ri-external-link-line"/> {item.linkLabel||'View publication'}</a>}
</div>
        );
        return <div key={item.id} className="ach-card fade-up">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {item.bannerUrl&&<img src={item.bannerUrl} alt={item.bannerAlt||item.title} className="card-photo" loading="lazy"/>}
          <div className={styles.cardBody} style={{padding:'1.25rem'}}>
            <div style={{width:'2.5rem',height:'2.5rem',borderRadius:'0.75rem',background:'rgba(34,211,238,0.1)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'0.75rem'}}><i className={item.icon} style={{fontSize:'1.25rem',color:'#22d3ee'}}/></div>
            <span style={{fontSize:'0.75rem',fontWeight:700,letterSpacing:'0.18em',textTransform:'uppercase',display:'block',marginBottom:'0.375rem',color:'#22d3ee'}}>{item.subtitle}{item.period?' · '+item.period:''}</span>
            <h2 style={{fontSize:'1rem',fontWeight:800,marginBottom:'0.375rem',color:'#fff'}}>{item.title}</h2>
            <p style={{fontSize:'0.9rem',lineHeight:1.8,color:'#b8b7c4',whiteSpace:'pre-line'}}>{item.detail}</p>
            {item.href&&<a href={item.href} target="_blank" rel="noopener noreferrer" className="ext-link" style={{background:'rgba(34,211,238,0.1)',color:'#22d3ee',marginTop:'0.75rem'}}><i className="ri-external-link-line"/> {item.linkLabel||'View publication'}</a>}
          </div>
        </div>;
        })}
      </div>
    </>
  );
}
