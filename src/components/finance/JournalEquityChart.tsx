'use client';
import { useEffect, useRef } from 'react';
import { createChart, AreaSeries, ColorType, type Time, type TickMarkType, type UTCTimestamp } from 'lightweight-charts';
import { journalTime } from '@/lib/trade-journal';
import js from './journal.module.css';
export default function JournalEquityChart({curve}:{curve:{at:string;net:number}[]}){
  const host=useRef<HTMLDivElement>(null);
  useEffect(()=>{if(!host.current||curve.length<2)return;const chart=createChart(host.current,{autoSize:true,height:300,layout:{background:{type:ColorType.Solid,color:'#141210'},textColor:'#e7d4ba',fontSize:14,attributionLogo:true},grid:{vertLines:{color:'#2d2823'},horzLines:{color:'#2d2823'}},timeScale:{tickMarkFormatter:(time:Time,type:TickMarkType)=>typeof time==='number'?new Intl.DateTimeFormat('en-IN',{timeZone:'Asia/Kolkata',...(type<3?{month:'short',day:'numeric'}:{hour:'2-digit',minute:'2-digit',hourCycle:'h23'})}).format(new Date(time*1000)):'',timeVisible:true},localization:{timeFormatter:(t:number)=>new Intl.DateTimeFormat('en-IN',{timeZone:'Asia/Kolkata',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(t*1000))}});
    const first=journalTime(curve[1].at)/1000;const series=chart.addSeries(AreaSeries,{lineColor:'#76e4c0',topColor:'#76e4c030',bottomColor:'#76e4c002',priceFormat:{type:'price',precision:2,minMove:.01}});series.setData(curve.map((c,i)=>({time:(i===0?first-60:journalTime(c.at)/1000) as UTCTimestamp,value:c.net})));series.createPriceLine({price:0,color:'#c49354',lineWidth:1,lineStyle:2,title:'Baseline',axisLabelVisible:true});chart.timeScale().fitContent();return()=>chart.remove();
  },[curve]);
  return <><p className={js.muted}>Cumulative net realised P&L · Drag to scroll, wheel / pinch to zoom</p><div ref={host} role="img" aria-label="Interactive cumulative net realised P&L chart" className={js.equityChart}/><a className={js.chartCredit} href="https://www.tradingview.com/" target="_blank" rel="noreferrer">TradingView Lightweight Charts™ · Copyright © 2025 TradingView, Inc.</a></>;
}
