export type MemoryDifficulty='easy'|'medium'|'hard';
export const MEMORY_LEVELS={easy:{pairs:6,cols:3,label:'Easy'},medium:{pairs:8,cols:4,label:'Medium'},hard:{pairs:10,cols:5,label:'Hard'}};
const symbols=['🚀','🌈','🎸','🦊','🌺','🍕','🎯','🦋','🌙','⚡','🎪','🦁','🐬','🎨','🍦','🏆','🌊','🎭','🦄','🎲'];
export type MemoryCard={id:number;emoji:string;grad:string;isFlipped:boolean;isMatched:boolean;isWrong:boolean};
export type MemoryRound={difficulty:MemoryDifficulty;cards:MemoryCard[];flipped:number[];moves:number;matched:number;combo:number;startedAt:number|null;endedAt:number|null};
function shuffle<T>(values:T[],random:()=>number){const result=[...values];for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;}
export function newMemoryRound(difficulty:MemoryDifficulty,random=Math.random):MemoryRound{
  const pool=shuffle(symbols,random).slice(0,MEMORY_LEVELS[difficulty].pairs);
  return {difficulty,cards:shuffle([...pool,...pool].map((emoji,id)=>({id,emoji,grad:'from-violet-600 to-indigo-700',isFlipped:false,isMatched:false,isWrong:false})),random),flipped:[],moves:0,matched:0,combo:0,startedAt:null,endedAt:null};
}
export function flipMemoryCard(round:MemoryRound,index:number,now:number):MemoryRound{
  const card=round.cards[index];
  if(!card||round.endedAt!==null||round.flipped.length===2||card.isFlipped||card.isMatched)return round;
  const flipped=[...round.flipped,index],cards=round.cards.map((c,i)=>i===index?{...c,isFlipped:true}:c);
  const next={...round,cards,flipped,startedAt:round.startedAt??now};
  if(flipped.length===1)return next;
  const [a,b]=flipped,match=cards[a].emoji===cards[b].emoji,matched=round.matched+(match?1:0);
  return {...next,moves:round.moves+1,matched,combo:match?round.combo+1:0,flipped:match?[]:flipped,
    cards:cards.map((c,i)=>i===a||i===b?{...c,isMatched:match,isWrong:!match}:c),
    endedAt:matched===MEMORY_LEVELS[round.difficulty].pairs?now:null};
}
export function closeMemoryPair(round:MemoryRound):MemoryRound{
  if(round.flipped.length!==2)return round;
  return {...round,flipped:[],cards:round.cards.map((c,i)=>round.flipped.includes(i)?{...c,isFlipped:false,isWrong:false}:c)};
}
export function memoryElapsed(round:MemoryRound,now:number){return round.startedAt===null?0:Math.max(0,(round.endedAt??now)-round.startedAt);}
