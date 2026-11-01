export type Mark='X'|'O';
export type InfinityRound={marks:Record<Mark,number[]>;current:Mark;moves:number;winner:{sym:Mark;line:number[]}|null};
const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
export const newInfinityRound=():InfinityRound=>({marks:{X:[],O:[]},current:'X',moves:0,winner:null});
export function infinityBoard(round:InfinityRound):(Mark|null)[]{const b:(Mark|null)[]=Array(9).fill(null);for(const sym of ['X','O'] as const)for(const index of round.marks[sym])b[index]=sym;return b;}
export function playInfinity(round:InfinityRound,index:number):InfinityRound{
  if(round.winner||!Number.isInteger(index)||index<0||index>8||infinityBoard(round)[index])return round;
  const sym=round.current,queue=[...round.marks[sym],index].slice(-3);
  const next:InfinityRound={marks:{...round.marks,[sym]:queue},current:sym==='X'?'O':'X',moves:round.moves+1,winner:null};
  const board=infinityBoard(next),line=lines.find(line=>line.every(i=>board[i]===sym));
  if(line)next.winner={sym,line};return next;
}
export function infinityAiMove(round:InfinityRound,depth=8):number{
  if(round.winner)return -1;
  const ai=round.current;
  function value(state:InfinityRound,left:number,alpha:number,beta:number):number{
    if(state.winner)return state.winner.sym===ai?1000+left:-1000-left;
    const board=infinityBoard(state);
    if(!left){let score=0;for(const line of lines){const a=line.filter(i=>board[i]===ai).length,b=line.filter(i=>board[i]&&board[i]!==ai).length;if(!b)score+=[0,1,7][a]??0;if(!a)score-=[0,1,9][b]??0;}return score;}
    const maximize=state.current===ai;let best=maximize?-Infinity:Infinity;
    for(const i of [4,0,2,6,8,1,3,5,7]){if(board[i])continue;const score=value(playInfinity(state,i),left-1,alpha,beta);best=maximize?Math.max(best,score):Math.min(best,score);if(maximize)alpha=Math.max(alpha,best);else beta=Math.min(beta,best);if(beta<=alpha)break;}return best;
  }
  let best=-Infinity,index=-1;const board=infinityBoard(round);
  for(const i of [4,0,2,6,8,1,3,5,7]){if(board[i])continue;const score=value(playInfinity(round,i),depth-1,-Infinity,Infinity);if(score>best){best=score;index=i;}}return index;
}
