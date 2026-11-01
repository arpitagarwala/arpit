'use client';
import {createContext,useContext,useEffect,useRef,type ComponentProps} from 'react';
import Link from 'next/link';
import {usePathname,useRouter} from 'next/navigation';
import {isProductivityFeature,suiteNavigationAction} from '@/lib/suite-navigation';
const KEY='__arpitProductivity';
type Navigation={navigate:(href:string)=>void;backToOverview:()=>boolean};
const Context=createContext<Navigation|null>(null);
export function useSuiteNavigation(){return useContext(Context);}
function marker(path:string){const value=window.history.state?.[KEY];return value?.path===path&&value.anchored===true;}
export function SuiteNavigationProvider({children}:{children:React.ReactNode}){
 const path=usePathname(),router=useRouter(),previous=useRef<string|null>(null),anchored=useRef(false);
 useEffect(()=>{
  if(isProductivityFeature(path)){
   const saved=window.history.state?.[KEY];
   if(saved?.path===path)anchored.current=saved.anchored===true;
   else if(previous.current==='/productivity')anchored.current=true;
   else if(!previous.current||!isProductivityFeature(previous.current))anchored.current=false;
  }else anchored.current=false;
  // Preserve Next's router state; add only our small per-entry navigation marker.
  window.history.replaceState({...window.history.state,[KEY]:{path,anchored:anchored.current}},'');previous.current=path;
 },[path]);
 function backToOverview(){if(!isProductivityFeature(path))return false;if(anchored.current||marker(path))router.back();else router.replace('/productivity');return true;}
 function navigate(href:string){
  const destination=href.split(/[?#]/)[0].replace(/\/$/,'')||'/',action=suiteNavigationAction(path,destination);
  if(action==='none')return;if(action==='overview'){backToOverview();return;}
  if(path==='/productivity'&&isProductivityFeature(destination))anchored.current=true;
  if(action==='replace')router.replace(href);else router.push(href);
 }
 return <Context.Provider value={{navigate,backToOverview}}>{children}</Context.Provider>;
}
export default function SuiteLink({href,...props}:Omit<ComponentProps<typeof Link>,'replace'|'onNavigate'>){const navigation=useSuiteNavigation();return <Link {...props} href={href} onNavigate={event=>{if(navigation&&typeof href==='string'&&href.startsWith('/')&&!href.startsWith('//')){event.preventDefault();navigation.navigate(href);}}}/>;}
