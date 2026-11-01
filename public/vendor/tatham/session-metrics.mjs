/* Length-prefixed native save data, interpreted only for observable interaction metrics. */
export function parseSave(text){
 if(typeof text!=='string'||text.length>2000000)throw new Error('Save data is unavailable.');
 const fields={},history=[];let pos=0;
 while(pos<text.length){while(text[pos]==='\r'||text[pos]==='\n')pos++;if(pos>=text.length)break;const key=text.slice(pos,pos+8).trim();if(text[pos+8]!==':')throw new Error('Invalid save header.');pos+=9;const end=text.indexOf(':',pos);if(end<0)throw new Error('Invalid save length.');const size=Number(text.slice(pos,end));if(!Number.isSafeInteger(size)||size<0||end+1+size>text.length)throw new Error('Invalid save record.');const value=text.slice(end+1,end+1+size);pos=end+1+size;if(['MOVE','SOLVE','RESTART'].includes(key))history.push({key,value});else fields[key]=value;}
 const statePos=Number(fields.STATEPOS),nStates=Number(fields.NSTATES);if(!Number.isInteger(statePos)||statePos<1||!Number.isInteger(nStates)||nStates<statePos||history.length!==nStates-1)throw new Error('Invalid native history.');
 const identity=[fields.GAME,fields.PARAMS,fields.CPARAMS,fields.DESC].join('|');
 return{identity,statePos,token:JSON.stringify(history.slice(0,statePos-1)),assisted:history.some(h=>h.key==='SOLVE')};
}
export function createMetrics(parsed,id){return{id,identity:parsed.identity,token:parsed.token,position:parsed.statePos,elapsedMs:0,moves:0,undos:0,restarts:0,revealed:parsed.assisted,started:false,reported:false};}
export function observeSave(state,parsed,id,command=''){
 if(!state||state.identity!==parsed.identity)return createMetrics(parsed,id);
 const changed=state.token!==parsed.token;
 let next=(state.reported||state.finished)&&changed?{...createMetrics(parsed,id),revealed:state.revealed||parsed.assisted}: {...state};
 if(changed){next.moves+=command==='restart'?1:Math.max(1,Math.abs(parsed.statePos-state.position));if(command==='restart')next.restarts++;else if(parsed.statePos<state.position)next.undos+=state.position-parsed.statePos;next.started=true;}
 next.revealed=next.revealed||parsed.assisted||command==='solve';next.token=parsed.token;next.position=parsed.statePos;return next;
}
export function tickMetrics(state,elapsed,visible){return state&&state.started&&!state.reported&&!state.finished&&visible?{...state,elapsedMs:Math.min(7*86400000,state.elapsedMs+Math.max(0,Math.min(5000,Math.floor(elapsed))))}:state;}
