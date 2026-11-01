'use client';
import {createContext,useContext} from 'react';
const Context=createContext<Record<string,boolean>>({});
const FooterContext=createContext({text:'© 2026 Arpit Agarwala. Engineered with ♥',enabled:true});
export function SiteFeatures({features,footer,children}:{features:Record<string,boolean>;footer:{text:string;enabled:boolean};children:React.ReactNode}){return <Context.Provider value={features}><FooterContext.Provider value={footer}>{children}</FooterContext.Provider></Context.Provider>;}
export function useSiteFeature(id:string){return useContext(Context)[id]!==false;}

export function useSiteFooter(){return useContext(FooterContext);}
