export const ADMIN_COOKIE = "admin_session";
function getSecret(){return process.env.ADMIN_SECRET||"dev-only-insecure-secret";}
function getPassword(){return process.env.ADMIN_PASSWORD||"church2024";}
async function computeToken(p:string):Promise<string>{
  const enc=new TextEncoder();
  const key=await crypto.subtle.importKey("raw",enc.encode(getSecret()),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  const sig=await crypto.subtle.sign("HMAC",key,enc.encode(p));
  return Array.from(new Uint8Array(sig)).map(b=>b.toString(16).padStart(2,"0")).join("");
}
function safeEqual(a:string,b:string):boolean{if(a.length!==b.length)return false;let d=0;for(let i=0;i<a.length;i++)d|=a.charCodeAt(i)^b.charCodeAt(i);return d===0;}
export async function expectedToken():Promise<string>{return computeToken(getPassword());}
export function checkPassword(p:string):boolean{return safeEqual(p,getPassword());}
export async function isValidToken(t:string|undefined):Promise<boolean>{if(!t)return false;return safeEqual(t,await expectedToken());}
