import type {Question} from './training';

/** One input path for the touch pad and physical keyboard. */
export function mathInput(value:string,key:string):string {
 if(key==='Clear'||key==='Escape')return '';
 if(key==='Backspace')return value.slice(0,-1);
 return /^\d$/.test(key)&&value.length<8?value+key:value;
}
export function explainArithmetic(q:Pick<Question,'a'|'b'|'op'|'expected'>):string {
 const {a,b,op,expected}=q;
 if(op==='divide')return `Think multiplication: ${b} × ${expected} = ${a}, so ${a} ÷ ${b} = ${expected}.`;
 const tens=Math.floor(b/10)*10,ones=b%10;
 if(op==='multiply')return tens&&ones?`Split ${b} into ${tens} + ${ones}: ${a} × ${tens} + ${a} × ${ones} = ${a*tens} + ${a*ones} = ${expected}.`:`${a} groups of ${b} make ${expected}. Try recalling this multiplication fact.`;
 if(!tens||!ones)return `${a} ${op==='add'?'+':'−'} ${b} = ${expected}. ${op==='add'?'Count forward':'Count back'} by ${b}.`;
 return op==='add'?`Add in parts: ${a} + ${tens} = ${a+tens}, then + ${ones} = ${expected}.`:`Subtract in parts: ${a} − ${tens} = ${a-tens}, then − ${ones} = ${expected}.`;
}
