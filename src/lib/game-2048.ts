export type Direction='left'|'right'|'up'|'down';
export type Board2048=number[][];
export type Round2048={board:Board2048;score:number;won:boolean;moves:number};
export function valid2048(value:unknown):value is Round2048{
 const r=value as Round2048;return Boolean(r&&Array.isArray(r.board)&&r.board.length===4&&r.board.every(row=>Array.isArray(row)&&row.length===4&&row.every(v=>Number.isSafeInteger(v)&&v>=0&&(v===0||v>=2&&Number.isInteger(Math.log2(v)))))&&Number.isSafeInteger(r.score)&&r.score>=0&&typeof r.won==='boolean'&&(r.moves===undefined||Number.isSafeInteger(r.moves)&&r.moves>=0));
}
export function slide2048(board:Board2048,direction:Direction){
 const next=board.map(row=>[...row]),merged:number[]=[],positions:number[]=[];const motions:{from:number;to:number;value:number}[]=[];let gain=0;
 for(let line=0;line<4;line++){
  const cells=Array.from({length:4},(_,i)=>direction==='left'?[line,i]:direction==='right'?[line,3-i]:direction==='up'?[i,line]:[3-i,line]);
  const entries=cells.map(([r,c])=>({value:board[r][c],from:r*4+c})).filter(e=>e.value),values=entries.map(e=>e.value),out:number[]=[];
  for(let i=0;i<values.length;i++){let n=values[i];const to=cells[out.length][0]*4+cells[out.length][1];motions.push({from:entries[i].from,to,value:n});if(n===values[i+1]){motions.push({from:entries[i+1].from,to,value:n});n*=2;i++;gain+=n;merged.push(n);positions.push(cells[out.length][0]*4+cells[out.length][1]);}out.push(n);}
  cells.forEach(([r,c],i)=>{next[r][c]=out[i]??0;});
 }
 return {board:next,gain,merged,positions,motions,changed:next.some((row,r)=>row.some((n,c)=>n!==board[r][c]))};
}
export function spawn2048(board:Board2048,random=Math.random){const cells=board.flatMap((row,r)=>row.flatMap((n,c)=>n===0?[[r,c]]:[])),next=board.map(row=>[...row]);if(!cells.length)return {board:next,index:-1};const [r,c]=cells[Math.floor(random()*cells.length)];next[r][c]=random()<.9?2:4;return {board:next,index:r*4+c};}
export function new2048(random=Math.random):Round2048{return {board:spawn2048(spawn2048(Array.from({length:4},()=>[0,0,0,0]),random).board,random).board,score:0,won:false,moves:0};}
export function blocked2048(board:Board2048){return !board.some((row,r)=>row.some((n,c)=>!n||c<3&&n===row[c+1]||r<3&&n===board[r+1][c]));}
export function move2048(round:Round2048,direction:Direction,random=Math.random){const slide=slide2048(round.board,direction);if(!slide.changed)return {round,index:-1,gain:0,positions:[]};const spawned=spawn2048(slide.board,random);return {round:{board:spawned.board,score:round.score+slide.gain,won:round.won||slide.board.some(row=>row.some(n=>n>=2048)),moves:(round.moves??0)+1},index:spawned.index,gain:slide.gain,positions:slide.positions};}
