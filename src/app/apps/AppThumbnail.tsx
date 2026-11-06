import {useId, type ReactNode} from 'react';

/** Decorative product illustrations, rather than screenshots of live app data. */
export default function AppThumbnail({id}:{id:string}) {
  const gradient=useId();
  const themes:Record<string,[string,string,string]>={
    'ca-bhaiya':['#e9e1ff','#c7b2f0','#7652b5'],
    gurukul:['#e7eddf','#b6c99f','#50673e'],
    'vertex-suite':['#183858','#0b172b','#6db9ff'],
    gita:['#f3d7ac','#ce8955','#804e2f'],
    panchang:['#27213e','#51405c','#edc3a8'],
    informedecision:['#0d302f','#183e48','#6ae1b5'],
    portfolio:['#dce5b7','#a6bb75','#25372b'],
  };
  const [start,end,accent]=themes[id]??themes.portfolio;
  let scene:ReactNode;
  switch(id){
    case 'ca-bhaiya':scene=<>
      <rect x="48" y="26" width="344" height="224" rx="14" fill="#fcfaff"/>
      <rect x="48" y="26" width="78" height="224" rx="14" fill="#f1ebfb"/>
      <circle cx="73" cy="52" r="11" fill={accent}/><text x="73" y="56" fill="white" fontSize="10" textAnchor="middle">CA</text>
      <text x="63" y="89" fontSize="8" fill="#7a6b92">YOUR STUDY SPACE</text>
      {[106,131,156].map((y,i)=><g key={y}><rect x="60" y={y} width="54" height="19" rx="5" fill={i===0?'#ded0f4':'#eae2f5'}/><path d={`M68 ${y+9}h32`} stroke="#a08ab9" strokeWidth="2" strokeLinecap="round"/></g>)}
      <text x="144" y="58" fontSize="13" fontWeight="700" fill="#3d285d">CA Bhaiya</text><circle cx="367" cy="52" r="4" fill="#9bba81"/>
      <text x="145" y="83" fontSize="9" fill="#9282a4">A little clarity. A lot of confidence.</text>
      <rect x="200" y="102" width="171" height="31" rx="9" fill="#ece4f9"/><text x="212" y="121" fontSize="9" fill="#5a3e7b">Bhaiya, explain this concept?</text>
      <circle cx="153" cy="157" r="10" fill={accent}/><path d="m148 157 4 3 6-6" fill="none" stroke="white" strokeWidth="1.5"/>
      <rect x="171" y="145" width="200" height="48" rx="9" fill="#f3eef9"/><text x="183" y="163" fontSize="9" fill="#60467b">Chalo, step by step samajhte hain.</text><path d="M183 177h153m-153 7h112" stroke="#c9bada" strokeWidth="3" strokeLinecap="round"/>
      <rect x="144" y="209" width="227" height="24" rx="12" fill="white" stroke="#e0d4ee"/><text x="157" y="224" fontSize="8" fill="#9d8cad">Ask your next question…</text><circle cx="358" cy="221" r="8" fill={accent}/><path d="m355 222 3-3 3 3m-3-3v6" fill="none" stroke="white"/>
    </>;break;
    case 'gurukul':scene=<>
      <rect x="42" y="27" width="356" height="225" rx="13" fill="#fafbf5"/>
      <rect x="42" y="27" width="356" height="39" rx="13" fill="#edf0e4"/><text x="62" y="51" fill="#46623e" fontSize="14" fontWeight="700">gurukul.</text><text x="287" y="50" fill="#7f8a72" fontSize="8">YOUR INSTITUTE, CONNECTED</text>
      <text x="61" y="92" fill="#34432b" fontSize="16" fontWeight="600">A good day to learn.</text><text x="61" y="109" fill="#939a87" fontSize="8">A little structure makes room for more.</text>
      <rect x="61" y="124" width="169" height="104" rx="8" fill="#f0f3e8"/><text x="73" y="143" fill="#526747" fontSize="9" fontWeight="600">Your learning calendar</text>
      {Array.from({length:21},(_,i)=><rect key={i} x={74+i%7*21} y={155+Math.floor(i/7)*21} width="15" height="15" rx="4" fill={[2,6,8,9,16].includes(i)?'#b7cb96':'#e0e6d3'}/>)}
      <rect x="243" y="124" width="136" height="104" rx="8" fill="#536d46"/><text x="255" y="145" fill="#e6eedb" fontSize="9">Everything in its place</text>
      {['Batches & classes','Attendance','Learning progress'].map((t,i)=><g key={t}><circle cx="259" cy={164+i*22} r="5" fill="#9bb782"/><path d={`m256 ${164+i*22} 2 2 4-4`} stroke="#f2f6ec" fill="none"/><text x="270" y={167+i*22} fontSize="8" fill="#e6eedb">{t}</text></g>)}
    </>;break;
    case 'vertex-suite':scene=<>
      <rect x="36" y="30" width="368" height="224" rx="12" fill="#11273e" stroke="#36516b"/>
      <rect x="36" y="30" width="67" height="224" rx="12" fill="#0d1c2e"/><path d="m54 52 12 7 12-7-12-7zm0 7 12 7 12-7" fill="none" stroke={accent} strokeWidth="2"/>
      {[90,116,142,168].map((y,i)=><g key={y}><rect x="49" y={y} width="41" height="17" rx="4" fill={i===0?'#294765':'#152b42'}/><path d={`M57 ${y+8}h24`} stroke="#57738c" strokeWidth="2"/></g>)}
      <text x="121" y="58" fontSize="13" fontWeight="700" fill="#e0eafa">Vertex Suite</text><text x="121" y="77" fontSize="8" fill="#7d9bb6">Bring your business into focus.</text>
      <rect x="121" y="94" width="263" height="56" rx="7" fill="#1a3550"/>
      {[0,1,2].map(i=><g key={i}><rect x={133+i*86} y="105" width="44" height="4" rx="2" fill="#61819b"/><rect x={133+i*86} y="118" width="61" height="10" rx="3" fill={i===1?'#78b6e7':'#b8cde1'}/><rect x={133+i*86} y="136" width="27" height="3" rx="1" fill="#56728b"/></g>)}
      <rect x="121" y="163" width="159" height="74" rx="7" fill="#16324c"/>
      {[20,34,27,44,37,52,61].map((h,i)=><rect key={i} x={133+i*20} y={229-h} width="11" height={h} rx="2" fill={i===6?'#85c5fa':'#365f80'}/>)}
      <rect x="292" y="163" width="92" height="74" rx="7" fill="#1d3a55"/><circle cx="338" cy="200" r="23" fill="none" stroke="#315472" strokeWidth="8"/><circle cx="338" cy="200" r="23" fill="none" stroke="#91c8ef" strokeWidth="8" strokeDasharray="91 145" transform="rotate(-90 338 200)"/>
    </>;break;
    case 'gita':scene=<>
      <circle cx="341" cy="76" r="82" fill="#ffe9bd" opacity=".45"/><path d="M0 213Q95 155 195 213T440 207V250H0" fill="#b57d53" opacity=".3"/>
      <g transform="rotate(-8 130 145)"><rect x="57" y="52" width="145" height="191" rx="6" fill="#6d4932"/><rect x="63" y="48" width="145" height="191" rx="5" fill="#f5e7c9"/><path d="M76 48v191" stroke="#d4bd93"/><rect x="86" y="68" width="102" height="150" rx="2" fill="none" stroke="#b99662"/><circle cx="137" cy="114" r="24" fill="none" stroke="#bd945c"/><path d="M137 88v52m-26-26h52m-44-18 36 36m0-36-36 36" stroke="#bd945c" opacity=".6"/><text x="137" y="166" textAnchor="middle" fill="#815b35" fontSize="27" fontFamily="serif">गीता</text><text x="137" y="188" textAnchor="middle" fill="#94764c" fontSize="7" letterSpacing="1.5">FOR DAILY LIFE</text></g>
      <text x="235" y="111" fontFamily="Georgia, serif" fontSize="36" fill="#9a693d">“</text><text x="235" y="139" fontFamily="Georgia, serif" fontSize="18" fill="#63442d">A moment</text><text x="235" y="162" fontFamily="Georgia, serif" fontStyle="italic" fontSize="18" fill="#63442d">of perspective.</text><path d="M235 182h44" stroke="#987044"/><text x="235" y="201" fontSize="8" fill="#8c6341" letterSpacing="2">PAUSE. READ. REFLECT.</text>
    </>;break;
    case 'panchang':scene=<>
      <circle cx="104" cy="113" r="77" fill="none" stroke="#d3aa8c" opacity=".25"/><circle cx="104" cy="113" r="60" fill="none" stroke="#d3aa8c" opacity=".35"/>
      {Array.from({length:12},(_,i)=><path key={i} d="M104 28v8" transform={`rotate(${i*30} 104 113)`} stroke="#e9c3a1" opacity=".6"/>)}
      <circle cx="104" cy="113" r="32" fill="#eac9a2"/><circle cx="117" cy="102" r="29" fill="#353049"/>
      <text x="104" y="220" textAnchor="middle" fontSize="9" letterSpacing="3" fill="#d4b1a0">IN RHYTHM WITH TIME</text>
      <rect x="210" y="38" width="187" height="190" rx="11" fill="#f3e8dc"/><rect x="210" y="38" width="187" height="40" rx="11" fill="#dfc9b9"/><text x="303" y="64" textAnchor="middle" fontSize="13" fontFamily="serif" fill="#664c53">हिन्दू पंचांग</text>
      <text x="228" y="103" fontSize="8" letterSpacing="1" fill="#9a7c7c">THE TRADITIONAL CALENDAR</text>
      {['तिथि','नक्षत्र','योग'].map((t,i)=><g key={t}><text x="228" y={132+i*31} fontSize="12" fill="#6e505b">{t}</text><rect x="294" y={125+i*31} width={76-i*12} height="5" rx="2.5" fill="#c6aaa7"/><path d={`M228 ${143+i*31}h150`} stroke="#dccbc1"/></g>)}
      {[37,176,190,424,366].map((x,i)=><circle key={i} cx={x} cy={24+i*27} r="1.6" fill="#f7dfbd"/>)}
    </>;break;
    case 'informedecision':scene=<>
      <rect x="32" y="29" width="376" height="224" rx="12" fill="#10282e" stroke="#33535a"/><text x="52" y="55" fill="#d7eeeb" fontSize="13" fontWeight="650">InformeDecision</text><rect x="322" y="43" width="66" height="16" rx="8" fill="#24483f"/><text x="355" y="54" textAnchor="middle" fontSize="7" fill="#8bc9ac">MARKET TRACKER</text>
      <text x="52" y="83" fontSize="9" fill="#789d9e">A clearer picture of the markets.</text>
      {[109,141,173,205].map(y=><path key={y} d={`M52 ${y}h336`} stroke="#244248"/>)}
      <path d="m52 198 24-18 21 5 25-40 25 14 25-28 23 16 27-37 22 16 27-36 22 12 25-30 23 9 25-24 22 13V222H52Z" fill="#6ae1b5" opacity=".06"/>
      <path d="m52 198 24-18 21 5 25-40 25 14 25-28 23 16 27-37 22 16 27-36 22 12 25-30 23 9 25-24 22 13" fill="none" stroke="#7ad8b8" strokeWidth="2.5" strokeLinejoin="round"/>
      <circle cx="388" cy="110" r="4" fill="#a0f0cc"/>
      <rect x="65" y="94" width="108" height="42" rx="6" fill="#1d3d43" stroke="#35585b"/><text x="77" y="111" fontSize="8" fill="#8fb4b0">Follow the movement</text><path d="M77 122h55" stroke="#8ed6bd" strokeWidth="3" strokeLinecap="round"/>
      <text x="52" y="239" fontSize="7" fill="#779b9e" letterSpacing="1.5">OBSERVE</text><text x="180" y="239" fontSize="7" fill="#779b9e" letterSpacing="1.5">UNDERSTAND</text><text x="320" y="239" fontSize="7" fill="#779b9e" letterSpacing="1.5">DECIDE</text>
    </>;break;
    default:scene=<>
      <rect x="42" y="30" width="356" height="223" rx="12" fill="#101c1b"/><text x="61" y="59" fontSize="18" fontWeight="800" fill="#d5ed86">aa.</text><path d="M329 52h13m10 0h23" stroke="#6b7d67" strokeWidth="2"/>
      <text x="62" y="102" fontSize="23" fontWeight="600" fill="#f2f1e8">Hello there!</text><text x="62" y="124" fontSize="11" fill="#bdc8ad">I’m Arpit Agarwala.</text><path d="M62 140h135m-135 9h98" stroke="#3c5145" strokeWidth="3" strokeLinecap="round"/>
      <rect x="62" y="166" width="106" height="23" rx="5" fill="#d5ed86"/><text x="115" y="181" textAnchor="middle" fontSize="8" fill="#28392b">Explore my world ↗</text>
      <g transform="rotate(9 304 130)"><rect x="250" y="86" width="108" height="113" rx="14" fill="#25372e" stroke="#637a4d"/><text x="304" y="155" textAnchor="middle" fontFamily="Georgia, serif" fontStyle="italic" fontSize="48" fill="#d5ed86">aa</text></g>
      <path d="M62 211h315" stroke="#304437"/><text x="62" y="232" fontSize="8" letterSpacing="2" fill="#8c9c80">FINANCE · TECHNOLOGY · CURIOSITY</text>
    </>;
  }
  return <svg viewBox="0 0 440 250" width="440" height="250" focusable="false" aria-hidden="true" style={{display:'block',width:'100%',height:'100%'}}>
    <defs><linearGradient id={gradient} x2="1" y2="1"><stop stopColor={start}/><stop offset="1" stopColor={end}/></linearGradient></defs>
    <rect width="440" height="250" fill={`url(#${gradient})`}/>
    {scene}
  </svg>;
}
