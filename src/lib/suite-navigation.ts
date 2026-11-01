export function isProductivityFeature(path:string){return /^\/productivity\/.+/.test(path);}
export function suiteNavigationAction(from:string,to:string):'push'|'replace'|'overview'|'none'{
 if(from===to)return'none';
 if(isProductivityFeature(from)&&to==='/productivity')return'overview';
 return isProductivityFeature(from)&&isProductivityFeature(to)?'replace':'push';
}
