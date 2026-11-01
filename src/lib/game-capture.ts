import type {PuzzleRun} from './training';
export type GameCapture={id:string;started:number;moves:number;undos:number;assisted:boolean};
export const emptyCapture=():GameCapture=>({id:'',started:0,moves:0,undos:0,assisted:false});
export function gameAction(capture:GameCapture){if(!capture.id){capture.id=crypto.randomUUID();capture.started=performance.now();}capture.moves++;}
export function gameResult(capture:GameCapture,slug:string,outcome:PuzzleRun['outcome']='solved',elapsedMs?:number){if(!capture.id)return;const run:PuzzleRun={id:capture.id,slug,completedAt:Date.now(),elapsedMs:Math.max(0,Math.floor(elapsedMs??performance.now()-capture.started)),moves:capture.moves,undos:capture.undos,restarts:0,revealed:false,helpUsed:capture.assisted,outcome};window.dispatchEvent(new CustomEvent('logic-game-result',{detail:run}));}
