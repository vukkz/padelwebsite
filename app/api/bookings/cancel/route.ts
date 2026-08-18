import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/supabase";
import { cancelByToken, cancellationDeadline } from "@/lib/cancellation";
import { sendCancellationNotification } from "@/lib/email";
import { CANCELLATION_HOURS } from "@/lib/config";
import { belgradeDateStr, belgradeTimeStr } from "@/lib/time";

const CancelInput = z.object({
  token: z.uuid("Neispravan link za otkazivanje."),
});

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Baza nije povezana. Proverite .env.local." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Neispravan zahtev." }, { status: 400 });
  }

  const parsed = CancelInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Neispravan link za otkazivanje." }, { status: 400 });
  }

  const result = await cancelByToken(parsed.data.token);

  if (!result.ok) {
    switch (result.reason) {
      case "not-found":
        // Deliberately the same answer as a token that never existed. There is
        // nothing to learn here by trying tokens.
        return NextResponse.json(
          { error: "Rezervacija nije pronađena. Link je možda istekao." },
          { status: 404 },
        );
      case "already-cancelled":
        return NextResponse.json(
          { error: "Ova rezervacija je već otkazana.", alreadyCancelled: true },
          { status: 409 },
        );
      case "too-late": {
        const deadline = cancellationDeadline(result.booking!.startsAt);
        return NextResponse.json(
          {
            error: `Otkazivanje online se zatvara ${CANCELLATION_HOURS} sata pre termina, u ${belgradeTimeStr(deadline)}. Pozovite klub.`,
            tooLate: true,
          },
          { status: 409 },
        );
      }
      default:
        return NextResponse.json(
          { error: "Otkazivanje nije uspelo. Pokušajte ponovo." },
          { status: 500 },
        );
    }
  }

  const { booking } = result;

  // The slot is already free. A failing email must never turn a released slot
  // into an error for the player, so this never throws.
  await sendCancellationNotification({
    customerName: booking.customerName,
    courtName: booking.courtName,
    dateLabel: booking.dateLabel,
    timeRange: booking.timeRange,
    shortDate: belgradeDateStr(booking.startsAt),
  });

  // The freed slot has to show as free on the very next load of the board.
  revalidatePath("/rezervacija");
  revalidatePath("/admin");

  return NextResponse.json({ ok: true, booking });
}
