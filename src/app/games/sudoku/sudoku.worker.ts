import {generateSudoku,type SudokuLevel} from '@/lib/sudoku-game';
const scope=self as unknown as {onmessage:((event:MessageEvent<{level:SudokuLevel}>)=>void)|null;postMessage:(data:unknown)=>void};
scope.onmessage=event=>{try{scope.postMessage({game:generateSudoku(event.data.level)});}catch{scope.postMessage({error:'Could not create this puzzle. Please try again.'});}};
