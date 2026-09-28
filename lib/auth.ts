import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE = "admin_session";

function secret() {
  return process.env.ADMIN_SECRET || "dev-only-insecure-secret";
}

// Deterministic token derived from the admin password + secret.
// Simple and good enough for a single shared admin password use case.
export function expectedToken() {
  return createHmac("sha256", secret())
    .update(process.env.ADMIN_PASSWORD || "changeme123")
    .digest("hex");
}

export function checkPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD || "changeme123";
  if (password.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(password), Buffer.from(expected));
}

export function isValidToken(token: string | undefined) {
  if (!token) return false;
  const expected = expectedToken();
  if (token.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}
