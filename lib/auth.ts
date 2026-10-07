export const ADMIN_COOKIE = "admin_session";

function getSecret(): string {
  const s = process.env.ADMIN_SECRET;
  if (!s) throw new Error("ADMIN_SECRET environment variable is not set.");
  return s;
}

function getPassword(): string {
  const p = process.env.ADMIN_PASSWORD;
  if (!p) throw new Error("ADMIN_PASSWORD environment variable is not set.");
  return p;
}

async function computeToken(p: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(p));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

export async function expectedToken(): Promise<string> { return computeToken(getPassword()); }
export function checkPassword(p: string): boolean { return safeEqual(p, getPassword()); }
export async function isValidToken(t: string | undefined): Promise<boolean> {
  if (!t) return false;
  try { return safeEqual(t, await expectedToken()); }
  catch { return false; }
}
