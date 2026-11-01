export const SOUNDS=[{id:'rain',name:'Rain',detail:'Soft, steady rainfall',icon:'ri-rainy-line'},{id:'forest',name:'Forest',detail:'Birdsong among the trees',icon:'ri-leaf-line'},{id:'wind',name:'Wind',detail:'A light outdoor breeze',icon:'ri-windy-line'},{id:'water',name:'Stream',detail:'Gentle flowing water',icon:'ri-water-flash-line'},{id:'cafe',name:'Café',detail:'A little company, at a distance',icon:'ri-cup-line'},{id:'brown',name:'Brown noise',detail:'A warm, low, even texture',icon:'ri-sound-module-line'}] as const;
export type SoundId=typeof SOUNDS[number]['id'];
export type Mix=Record<SoundId,number>;
export const mix=(rain=0,forest=0,wind=0,water=0,cafe=0,brown=0):Mix=>({rain,forest,wind,water,cafe,brown});
export const PRESETS=[{id:'library',name:'Rainy Library',caption:'Rain outside. One clear task inside.',icon:'ri-book-open-line',levels:mix(75,0,10,0,15,0)},{id:'deep',name:'Deep Focus',caption:'A steady texture for demanding work.',icon:'ri-focus-3-line',levels:mix(25,0,0,0,0,65)},{id:'forest',name:'Forest Morning',caption:'Birdsong, a breeze, and breathing room.',icon:'ri-plant-line',levels:mix(0,50,20,35)},{id:'evening',name:'Evening Wind-down',caption:'Soft water for a slower ending.',icon:'ri-moon-line',levels:mix(30,0,10,45)}];
export type QuietSettings={version:1;levels:Mix;master:number;visual:'rain'|'still';dim:boolean;chime:boolean;linkFocus:boolean;breakAudio:'continue'|'quiet'|'off';saved:{id:string;name:string;levels:Mix}[]};
export function defaultQuiet():QuietSettings{return{version:1,levels:{...PRESETS[0].levels},master:45,visual:'rain',dim:false,chime:false,linkFocus:false,breakAudio:'quiet',saved:[]};}
export function validMix(value:unknown):value is Mix{return!!value&&typeof value==='object'&&SOUNDS.every(s=>{const v=(value as Mix)[s.id];return typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=100;});}
export function restoreQuiet(raw:string|null):QuietSettings{
 if(!raw)return defaultQuiet();const v=JSON.parse(raw) as QuietSettings;
 if(v.version!==1||!validMix(v.levels)||!Number.isFinite(v.master)||v.master<0||v.master>100||!['rain','still'].includes(v.visual)||!['continue','quiet','off'].includes(v.breakAudio)||!['dim','chime','linkFocus'].every(k=>typeof v[k as keyof QuietSettings]==='boolean')||!Array.isArray(v.saved)||v.saved.length>20||v.saved.some(s=>!s||typeof s.id!=='string'||typeof s.name!=='string'||!s.name.trim()||s.name.length>40||!validMix(s.levels)))throw new Error('Saved sound settings could not be read. They have been kept unchanged.');
 return v;
}
