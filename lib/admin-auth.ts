import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "ph_admin";
const MAX_AGE_SECONDS = 60 * 60 * 12; // one working day

function secret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error(
      "ADMIN_SESSION_SECRET nije podešen (potrebno je najmanje 16 karaktera).",
    );
  }
  return s;
}

/** Constant-time compare that also tolerates differing lengths. */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  // Hash both sides first so timingSafeEqual always gets equal-length buffers
  // and the comparison doesn't leak the password length.
  const ah = createHmac("sha256", secret()).update(ab).digest();
  const bh = createHmac("sha256", secret()).update(bb).digest();
  return timingSafeEqual(ah, bh);
}

export function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return safeEqual(input, expected);
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

function makeToken(): string {
  const expires = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = String(expires);
  return `${payload}.${sign(payload)}`;
}

function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = sign(payload);
  const a = Buffer.from(signature, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  return Number(payload) > Date.now();
}

export async function createSession(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, makeToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function isAdmin(): Promise<boolean> {
  try {
    const store = await cookies();
    return verifyToken(store.get(COOKIE_NAME)?.value);
  } catch {
    // Missing secret or a malformed cookie: fail closed rather than 500 the page.
    return false;
  }
}

/** True when the admin panel has everything it needs to sign someone in. */
export function isAdminConfigured(): boolean {
  return Boolean(
    process.env.ADMIN_PASSWORD && (process.env.ADMIN_SESSION_SECRET?.length ?? 0) >= 16,
  );
}

/**
 * Guard for admin *pages*. Redirects to the login screen when not signed in.
 */
export async function requireAdminPage(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/prijava");
}

/**
 * Guard for admin *API routes*. Returns a 401 body to return early, or null.
 *
 * Every /api/admin/* handler must call this. Gating only the pages would leave
 * customer names and phone numbers readable by anyone who guesses a URL.
 */
export async function requireAdminApi(): Promise<Response | null> {
  if (await isAdmin()) return null;
  return Response.json({ error: "Niste prijavljeni." }, { status: 401 });
}
