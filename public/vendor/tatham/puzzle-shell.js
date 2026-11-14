/* Portfolio adapter: local progress, mobile input and frame sizing. MIT engine unchanged. */
(()=>{
 const slug=document.body.dataset.puzzle,canvas=document.getElementById('puzzlecanvas'),puzzle=document.getElementById('puzzle'),status=document.getElementById('save-status');
 let started=false,mark=false,timer,telemetry=()=>{};
 const profile=parent!==window&&/^arpit-puzzle:([\w-]{1,128})$/.exec(window.name);
 const prefix=profile?'arpit.account:'+profile[1]+':':'';
 const storageKey=prefix+'logic-room:'+slug+':v1';
 function height(){parent.postMessage({type:'puzzle-height',slug,height:document.documentElement.scrollHeight},location.origin);}
 new ResizeObserver(height).observe(document.body);
 function initialize(){
  if(started||puzzle.style.display==='none'||typeof window.Module?._get_save_file!=='function')return;started=true;
  const get=Module.cwrap('get_save_file','number',[]),free=Module.cwrap('free_save_file','void',['number']),load=Module.cwrap('load_game','void',[]);
  function save(){try{const ptr=get();let text;try{text=UTF8ToString(ptr);}finally{free(ptr);}telemetry(text);localStorage.setItem(storageKey,text);status.textContent='Progress saved on this device.';}catch{status.textContent='Device storage is unavailable. Your progress will only last for this visit.';}}
  try{const saved=localStorage.getItem(storageKey);if(saved&&!location.hash){const bytes=new TextEncoder().encode(saved);let pos=0;savefile_read_callback=(buf,len)=>{if(pos+len>bytes.length)return false;writeArrayToMemory(bytes.subarray(pos,pos+len),buf);pos+=len;return true;};try{load();status.textContent='Your last puzzle is ready to continue.';}finally{savefile_read_callback=null;}}}catch{status.textContent='Could not restore progress. You can start a new puzzle.';}
  import('./puzzle-sizing.mjs').then(({fitPuzzleBoard})=>{
   const container=document.getElementById('puzzlecanvascontain'),resize=Module.cwrap('resize_puzzle','void',['number','number']);
   let pending=0;
   const fit=()=>{cancelAnimationFrame(pending);pending=requestAnimationFrame(()=>fitPuzzleBoard(container,resize,window.devicePixelRatio));};
   // Observe the extrinsically sized container, not the canvas we resize (which would feed back).
   new ResizeObserver(fit).observe(container);
   window.addEventListener('resize',fit);
   document.addEventListener('fullscreenchange',fit);
   document.addEventListener('visibilitychange',()=>{if(!document.hidden)fit();});
   window.addEventListener('pageshow',fit);
   fit();
  }).catch(()=>{status.textContent='Automatic board sizing is unavailable. Try reloading the puzzle.';});
  import('./session-metrics.mjs').then(({parseSave,createMetrics,observeSave,tickMetrics})=>{
   const metaKey=storageKey+':metrics';let metrics=null,command='',lastClock=performance.now(),engaged=false;
   const gameStatus=Module.cwrap('puzzle_status','number',[]);
   function accrue(){const now=performance.now();metrics=tickMetrics(metrics,now-lastClock,engaged&&!document.hidden&&!wellbeingPaused);lastClock=now;}
   function snapshot(){return{id:metrics.id,slug,completedAt:Date.now(),elapsedMs:Math.floor(metrics.elapsedMs),moves:metrics.moves,undos:metrics.undos,restarts:metrics.restarts,revealed:metrics.revealed,reported:metrics.reported,outcome:metrics.solved&&!metrics.revealed?'solved':'practice'};}
   function emit(){if(metrics)parent.postMessage({type:'puzzle-metrics',slug,metrics:snapshot()},location.origin);}
   function persist(){try{if(metrics)localStorage.setItem(metaKey,JSON.stringify(metrics));}catch{/* The parent reports a recording failure if central progress cannot be saved. */}}
   function end(){if(!metrics||metrics.reported||!metrics.started)return;accrue();metrics={...metrics,finished:true};parent.postMessage({type:'puzzle-session-end',slug,run:snapshot()},location.origin);persist();emit();}
   telemetry=text=>{try{const parsed=parseSave(text);if(!metrics){try{const old=JSON.parse(localStorage.getItem(metaKey));if(old&&typeof old.id==='string'&&old.identity===parsed.identity&&old.token===parsed.token&&Number.isFinite(old.elapsedMs)&&old.elapsedMs>=0&&old.elapsedMs<=7*86400000&&['moves','undos','restarts'].every(k=>Number.isInteger(old[k])&&old[k]>=0)&&typeof old.revealed==='boolean'&&typeof old.started==='boolean'&&typeof old.reported==='boolean')metrics=old;}catch{}}
    if(metrics&&metrics.identity!==parsed.identity){end();engaged=false;}
    const changed=metrics&&metrics.identity===parsed.identity&&metrics.token!==parsed.token;
    accrue();metrics=observeSave(metrics,parsed,crypto.randomUUID(),command);
    if(changed&&command!=='restart')engaged=true;command='';
    if(gameStatus()>0){metrics={...metrics,solved:true,finished:true};if(metrics.started&&!metrics.reported)end();}
    persist();emit();
   }catch{parent.postMessage({type:'puzzle-metrics-error',slug},location.origin);}};
   for(const [id,type] of [['restart','restart'],['solve','solve']])document.getElementById(id)?.addEventListener('click',()=>{command=type;if(type==='solve'&&metrics){metrics.revealed=true;persist();emit();}},{capture:true});
   let wellbeingPaused=false;
   window.addEventListener('message',event=>{if(event.origin===location.origin&&event.source===parent&&event.data?.type==='puzzle-wellbeing'){wellbeingPaused=event.data.paused===true;lastClock=performance.now();}});
   window.addEventListener('message',event=>{if(event.origin===location.origin&&event.source===parent&&event.data?.slug===slug&&event.data.type==='puzzle-session-finish'){save();end();}if(event.origin===location.origin&&event.source===parent&&event.data?.slug===slug&&event.data.type==='puzzle-session-recorded'&&metrics?.id===event.data.id){metrics={...metrics,reported:true};persist();emit();}});
   const engage=event=>{if(!metrics||metrics.finished||engaged||!event.target.closest?.('#puzzlecanvas,.keypad'))return;engaged=true;metrics={...metrics,started:true};lastClock=performance.now();persist();emit();};
   document.addEventListener('pointerdown',engage,true);document.addEventListener('keydown',engage,true);
   setInterval(()=>{accrue();persist();emit();},250);
   document.addEventListener('visibilitychange',()=>{lastClock=performance.now();});window.addEventListener('pagehide',()=>{persist();});save();
  }).catch(()=>parent.postMessage({type:'puzzle-metrics-error',slug},location.origin));
  const queue=()=>{try{const ptr=get();try{telemetry(UTF8ToString(ptr));}finally{free(ptr);}}catch{/* Keep the puzzle playable if a snapshot is unavailable. */}clearTimeout(timer);timer=setTimeout(save,250);};
  document.addEventListener('pointerup',queue);document.addEventListener('keyup',queue);document.addEventListener('click',queue);window.addEventListener('pagehide',save);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)save();});
  document.getElementById('mark-mode').onclick=e=>{mark=!mark;e.currentTarget.setAttribute('aria-pressed',String(mark));e.currentTarget.textContent=mark?'Touch: mark / reverse':'Touch: normal move';};
  const previousDown=canvas.onpointerdown;
  function mouse(type,event){return new MouseEvent(type,{clientX:event.clientX,clientY:event.clientY,button:mark?2:0,buttons:mark?2:1,bubbles:true,cancelable:true});}
  canvas.onpointerdown=event=>{if(event.pointerType!=='touch'){previousDown?.call(canvas,event);return;}event.preventDefault();canvas.setPointerCapture(event.pointerId);canvas.onmousedown(mouse('mousedown',event));};
  canvas.onpointermove=event=>{if(event.pointerType==='touch'&&canvas.hasPointerCapture(event.pointerId)){event.preventDefault();canvas.onmousemove(mouse('mousemove',event));}};
  canvas.onpointerup=canvas.onpointercancel=event=>{if(event.pointerType==='touch'){event.preventDefault();canvas.onmouseup(mouse('mouseup',event));if(canvas.hasPointerCapture(event.pointerId))canvas.releasePointerCapture(event.pointerId);queue();}};
  for(const button of document.querySelectorAll('[data-key]'))button.onclick=()=>{const key=button.dataset.key;canvas.focus();canvas.onkeydown(new KeyboardEvent('keydown',{key,keyCode:key==='Backspace'?8:48+Number(key),bubbles:true,cancelable:true}));queue();};
  parent.postMessage({type:'puzzle-ready',slug},location.origin);height();
 }
 new MutationObserver(initialize).observe(puzzle,{attributes:true,attributeFilter:['style']});initialize();
})();
