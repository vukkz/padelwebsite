import { NextResponse } from "next/server";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/supabase";
import { findManyByToken } from "@/lib/cancellation";

/**
 * Resolve the tokens a device is holding into the bookings they name.
 *
 * POST rather than GET with a query string: these tokens are credentials, and a
 * URL is the one part of a request that reliably ends up in server logs, browser
 * history and any proxy in between.
 */
const LookupInput = z.object({
  tokens: z.array(z.string()).max(50),
});

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ bookings: [] });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Neispravan zahtev." }, { status: 400 });
  }

  const parsed = LookupInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Neispravan zahtev." }, { status: 400 });
  }

  // Unknown or malformed tokens are dropped, never reported. An empty result
  // and a result short by one look identical from the outside.
  const bookings = await findManyByToken(parsed.data.tokens);
  return NextResponse.json({ bookings });
}
