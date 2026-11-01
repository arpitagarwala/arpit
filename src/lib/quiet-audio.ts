import {SOUNDS,type Mix,type SoundId} from './quiet-space.ts';
// Decoded field recordings retain their native channel count and sample rate.
// Equal-power limiting and short boundary crossfades avoid clicks and hard seams.
export class QuietAudio{
 context:AudioContext;master:GainNode;limiter:DynamicsCompressorNode;
 buffers=new Map<SoundId,AudioBuffer>();tracks=new Map<SoundId,{source:AudioBufferSourceNode;gain:GainNode}>();
 pending=new Map<SoundId,Promise<AudioBuffer>>();generation=0;closed=false;
 constructor(){this.context=new AudioContext();this.master=this.context.createGain();this.master.gain.value=0;this.limiter=this.context.createDynamicsCompressor();this.limiter.threshold.value=-6;this.limiter.knee.value=6;this.limiter.ratio.value=12;this.limiter.attack.value=.003;this.limiter.release.value=.25;this.master.connect(this.limiter);this.limiter.connect(this.context.destination);}
 async resume(){this.generation++;await this.context.resume();if(this.context.state!=='running')throw new Error('Your browser paused audio. Press Play to resume.');}
 async buffer(id:SoundId){
  if(this.buffers.has(id))return this.buffers.get(id)!;
  if(this.pending.has(id))return this.pending.get(id)!;
  const task=(async()=>{
   let source:AudioBuffer;
   if(id==='brown'){source=this.context.createBuffer(2,this.context.sampleRate*24,this.context.sampleRate);for(let ch=0;ch<2;ch++){const data=source.getChannelData(ch);let last=0;for(let i=0;i<data.length;i++){last=(last+.02*(Math.random()*2-1))/1.02;data[i]=last*3.5;}}}
   else{const response=await fetch(`/audio/quiet-space/${id}.ogg`);if(!response.ok)throw new Error(`${SOUNDS.find(s=>s.id===id)?.name} could not load. Check your connection and try Play again.`);source=await this.context.decodeAudioData(await response.arrayBuffer());}
   const usable=Math.min(source.length,source.sampleRate*60),overlap=Math.min(Math.floor(source.sampleRate),Math.floor(usable/8)),length=usable-overlap,loop=this.context.createBuffer(source.numberOfChannels,length,source.sampleRate);
   for(let ch=0;ch<source.numberOfChannels;ch++){const input=source.getChannelData(ch),out=loop.getChannelData(ch);out.set(input.subarray(0,length));for(let i=0;i<overlap;i++){const t=i/overlap;out[i]=input[length+i]*(1-t)+input[i]*t;}}
   this.buffers.set(id,loop);return loop;
  })();this.pending.set(id,task);try{return await task;}finally{this.pending.delete(id);}
 }
 async sync(levels:Mix,volume:number,playing:boolean,fadeSeconds:number|null=null){
  const generation=++this.generation,active=SOUNDS.filter(s=>levels[s.id]>0),count=Math.max(1,active.length);
  if(playing)await Promise.all(active.map(s=>this.buffer(s.id)));
  if(this.closed||generation!==this.generation)return;
  const now=this.context.currentTime;
  if(playing)for(const s of active)if(!this.tracks.has(s.id)){const source=this.context.createBufferSource(),gain=this.context.createGain();source.buffer=this.buffers.get(s.id)!;source.loop=true;gain.gain.value=0;source.connect(gain);gain.connect(this.master);source.start();this.tracks.set(s.id,{source,gain});}
  for(const [id,{gain}]of this.tracks){gain.gain.cancelScheduledValues(now);gain.gain.setTargetAtTime(playing?levels[id]/100/Math.sqrt(count):0,now,.25);}
  this.master.gain.cancelScheduledValues(now);this.master.gain.setValueAtTime(this.master.gain.value,now);const target=playing?volume/100:0;
  if(playing&&fadeSeconds!==null&&fadeSeconds<8){this.master.gain.linearRampToValueAtTime(target*fadeSeconds/8,now+.15);this.master.gain.linearRampToValueAtTime(0,now+Math.max(.2,fadeSeconds));}
  else{this.master.gain.linearRampToValueAtTime(target,now+.5);if(playing&&fadeSeconds!==null){this.master.gain.setValueAtTime(target,now+Math.max(.5,fadeSeconds-8));this.master.gain.linearRampToValueAtTime(0,now+fadeSeconds);}}
 }
 pause(suspendAfter=650){const generation=++this.generation,now=this.context.currentTime;this.master.gain.cancelScheduledValues(now);this.master.gain.setTargetAtTime(0,now,.15);setTimeout(()=>{if(!this.closed&&generation===this.generation&&this.context.state==='running')void this.context.suspend().catch(()=>{});},suspendAfter);}
 chime(){if(this.context.state!=='running')return;const at=this.context.currentTime;for(const [i,f]of [523.25,659.25].entries()){const oscillator=this.context.createOscillator(),gain=this.context.createGain();oscillator.frequency.value=f;gain.gain.setValueAtTime(0,at+i*.3);gain.gain.linearRampToValueAtTime(.045,at+i*.3+.03);gain.gain.exponentialRampToValueAtTime(.001,at+i*.3+1.3);oscillator.connect(gain);gain.connect(this.context.destination);oscillator.start(at+i*.3);oscillator.stop(at+i*.3+1.4);}}
 async close(){this.closed=true;this.generation++;for(const track of this.tracks.values()){track.source.stop();track.source.disconnect();track.gain.disconnect();}this.tracks.clear();await this.context.close();}
}
