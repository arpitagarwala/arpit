export type SudokuLevel='easy'|'medium'|'hard'|'expert';
export const SUDOKU_CLUES={easy:44,medium:35,hard:29,expert:25};
export type SudokuGame={givens:number[];solution:number[];values:number[];notes:number[][];errors:number;hints:number};
export function sudokuPeers(a:number,b:number){return a!==b&&(Math.floor(a/9)===Math.floor(b/9)||a%9===b%9||Math.floor(a/27)===Math.floor(b/27)&&Math.floor(a%9/3)===Math.floor(b%9/3));}
export function sudokuCandidates(values:number[],index:number){const taken=new Set(values.filter((_,i)=>sudokuPeers(index,i)));return [1,2,3,4,5,6,7,8,9].filter(n=>!taken.has(n));}
function pick(values:number[]){let found=-1,options:number[]=[];for(let i=0;i<81;i++)if(!values[i]){const candidates=sudokuCandidates(values,i);if(found<0||candidates.length<options.length){found=i;options=candidates;if(options.length<=1)break;}}return {index:found,options};}
export function countSudokuSolutions(input:number[],limit=2){if(input.length!==81||input.some((n,i)=>!Number.isInteger(n)||n<0||n>9||n>0&&input.some((v,j)=>sudokuPeers(i,j)&&v===n)))return 0;const values=[...input];let count=0;function visit(){if(count>=limit)return;const {index,options}=pick(values);if(index<0){count++;return;}for(const n of options){values[index]=n;visit();values[index]=0;if(count>=limit)return;}}visit();return count;}
function shuffle<T>(values:T[],random:()=>number){const a=[...values];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function generateSudoku(level:SudokuLevel,random=Math.random):SudokuGame{
 const groups=()=>shuffle([0,1,2],random).flatMap(b=>shuffle([0,1,2],random).map(r=>b*3+r)),rows=groups(),cols=groups(),digits=shuffle([1,2,3,4,5,6,7,8,9],random);
 const solution=rows.flatMap(r=>cols.map(c=>digits[(r*3+Math.floor(r/3)+c)%9])),givens=[...solution];let remaining=81;
 for(const i of shuffle(Array.from({length:81},(_,i)=>i),random)){if(remaining<=SUDOKU_CLUES[level])break;const n=givens[i];givens[i]=0;if(countSudokuSolutions(givens)===1)remaining--;else givens[i]=n;}
 return {givens,solution,values:[...givens],notes:Array.from({length:81},()=>[]),errors:0,hints:0};
}
export function solvedSudoku(game:SudokuGame){return game.values.every((n,i)=>n===game.solution[i]);}
export function enterSudoku(game:SudokuGame,index:number,n:number,notes=false):SudokuGame{
 if(index<0||index>=81||game.givens[index]||!Number.isInteger(n)||n<0||n>9||solvedSudoku(game))return game;
 if(notes&&n){if(game.values[index])return game;return {...game,notes:game.notes.map((a,i)=>i===index?(a.includes(n)?a.filter(v=>v!==n):[...a,n].sort()):a)};}
 if(game.values[index]===n&&!game.notes[index].length)return game;
 const values=game.values.map((v,i)=>i===index?n:v);
 return {...game,values,errors:game.errors+(n&&n!==game.solution[index]&&game.values[index]!==n?1:0),notes:game.notes.map((a,i)=>i===index?[]:n&&n===game.solution[index]&&sudokuPeers(index,i)?a.filter(v=>v!==n):a)};
}
export function validSudokuGame(value:unknown):value is SudokuGame{
 const g=value as SudokuGame,grid=(a:unknown):a is number[]=>Array.isArray(a)&&a.length===81&&a.every(n=>Number.isInteger(n)&&n>=0&&n<=9);
 return Boolean(g&&grid(g.givens)&&grid(g.values)&&grid(g.solution)&&g.solution.every((n,i)=>n>0&&!g.solution.some((v,j)=>sudokuPeers(i,j)&&v===n))&&g.givens.every((n,i)=>!n||n===g.solution[i]&&n===g.values[i])&&Array.isArray(g.notes)&&g.notes.length===81&&g.notes.every(a=>Array.isArray(a)&&a.length<=9&&new Set(a).size===a.length&&a.every(n=>Number.isInteger(n)&&n>=1&&n<=9))&&Number.isSafeInteger(g.errors)&&g.errors>=0&&Number.isInteger(g.hints)&&g.hints>=0&&g.hints<=3);
}
