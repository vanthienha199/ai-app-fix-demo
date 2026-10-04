import { createHmac, timingSafeEqual } from "node:crypto";

const MAX_AGE = 60 * 60 * 8;

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET must be set to at least 32 characters");
  return s;
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createSession(user: string, now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({ u: user, exp: Math.floor(now / 1000) + MAX_AGE })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function readSession(token: string | undefined, now = Date.now()): { u: string } | null {
  if (!token || !token.includes(".")) return null;
  const [payload, sig] = token.split(".");
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    return data.exp * 1000 > now ? { u: data.u } : null;
  } catch {
    return null;
  }
}

export function passwordMatches(given: string) {
  const real = process.env.STAFF_PASSWORD;
  if (!real) return false;
  const a = createHmac("sha256", "cmp").update(given).digest();
  const b = createHmac("sha256", "cmp").update(real).digest();
  return timingSafeEqual(a, b);
}

export const SESSION_COOKIE = "mp_session";
export const SESSION_MAX_AGE = MAX_AGE;
