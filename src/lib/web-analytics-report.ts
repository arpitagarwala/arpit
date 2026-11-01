export type AnalyticsTotals={views:number;visitors:number;sessions:number;active:number;scroll:number;engaged:number;newVisitors:number};
export type AnalyticsReport={
 range:{start:number;end:number;previousStart:number;previousEnd:number;from:string;to:string};
 totals:AnalyticsTotals;previous:AnalyticsTotals;
 daily:{day:string;views:number;visitors:number;active:number}[];
 pages:{path:string;views:number;visitors:number;active:number;scroll:number;shortViews:number}[];
 sections:{path:string;section:string;active:number;views:number}[];
 devices:{label:string;views:number;visitors:number}[];browsers:{label:string;views:number;visitors:number}[];
 locations:{city:string;country:string;views:number;visitors:number}[];
 sources:{label:string;views:number;sessions:number}[];
 actions:{name:string;target:string;path:string;count:number}[];errors:{name:string;target:string;path:string;count:number}[];
 feedback:{path:string;value:string;count:number}[];reasons:{label:string;count:number}[];
 flows:{source:string;target:string;count:number}[];
 entryPages:{path:string;count:number}[];exitPages:{path:string;count:number}[];
 recent:{id:string;started:number;seen:number;views:number;active:number;city:string;country:string;device:string;browser:string;network:string}[];
 live:number;paths:string[];firstRecord:number|null;generated:number;
};
export function analyticsInsights(r:AnalyticsReport){
 const items:{title:string;body:string}[]=[];
 if(!r.totals.views)return[{title:'A clean starting point',body:'Real data appears after visitors allow optional analytics. No historical visits or sample traffic are added to your reports.'}];
 const top=r.pages[0];if(top)items.push({title:'The most visited page',body:`${top.path} received ${top.views} page views in this period. Compare active time and feedback before deciding what to improve.`});
 const friction=r.pages.find(p=>p.views>=20&&p.shortViews/p.views>=.7);if(friction)items.push({title:'A page worth reviewing',body:`${friction.path}: ${Math.round(friction.shortViews/friction.views*100)}% of page views have less than 10 seconds of active time. Quick answers, fresh visits and navigation can also explain this.`});
 const problems=r.errors.reduce((sum,v)=>sum+v.count,0);if(problems)items.push({title:'Check the reliability signals',body:`${problems} browser error event${problems===1?'':'s'} were reported. Error categories indicate where to investigate; they are not verified failed user actions.`});
 const votes=r.feedback.reduce((sum,v)=>sum+v.count,0),helpful=r.feedback.filter(v=>v.value==='helpful').reduce((sum,v)=>sum+v.count,0);
 items.push(votes>=5?{title:'What visitors explicitly said',body:`${helpful} of ${votes} latest page votes were Helpful. Feedback is voluntary, and is shown separately from passive engagement.`}:{title:'Keep listening',body:`${votes} page feedback vote${votes===1?'':'s'} so far. Gather more direct feedback before making preference claims.`});
 return items.slice(0,4);
}
export function sectionLabel(value:string){return value.split('/').map(part=>part.replaceAll('-',' ').replace(/^\w/,c=>c.toUpperCase())).join(' / ');}
