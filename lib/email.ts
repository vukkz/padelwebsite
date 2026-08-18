import "server-only";
import { Resend } from "resend";
import { CLUB } from "./config";
import { formatRsd } from "./time";

export type OwnerNotification = {
  customerName: string;
  customerPhone: string;
  courtName: string;
  /** "utorak, 18. avgust 2026." */
  dateLabel: string;
  /** "15:30 – 17:00" */
  timeRange: string;
  priceRsd: number;
  /** "2026-08-18" — used to deep-link the admin day view. */
  shortDate: string;
};

/**
 * Notify the club owner about a new booking.
 *
 * The player gets an on-screen confirmation only — no player email, by design.
 *
 * Never throws. It is called after the booking row is already committed, so a
 * Resend outage or a missing API key must not surface to the player as a failed
 * reservation. Failures are logged and swallowed.
 */
export async function sendOwnerNotification(n: OwnerNotification): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.OWNER_EMAIL;
  const from = process.env.RESEND_FROM ?? `${CLUB.name} <onboarding@resend.dev>`;

  if (!apiKey || !to) {
    console.warn(
      "[email] RESEND_API_KEY ili OWNER_EMAIL nisu podešeni — obaveštenje preskočeno.",
    );
    return;
  }

  const phoneDigits = n.customerPhone.replace(/[^\d+]/g, "");
  const subject = `Nova rezervacija — ${n.courtName}, ${n.dateLabel.split(", ")[1] ?? n.dateLabel} u ${n.timeRange.split(" ")[0]}`;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      subject,
      text: [
        "Nova rezervacija preko sajta",
        "",
        `Ime:      ${n.customerName}`,
        `Telefon:  ${n.customerPhone}`,
        `Teren:    ${n.courtName}`,
        `Datum:    ${n.dateLabel}`,
        `Vreme:    ${n.timeRange}`,
        `Cena:     ${formatRsd(n.priceRsd)}`,
      ].join("\n"),
      html: renderHtml(n, phoneDigits, siteUrl()),
    });

    if (error) console.error("[email] Resend je vratio grešku:", error);
  } catch (err) {
    console.error("[email] Slanje obaveštenja nije uspelo:", err);
  }
}

export type CancellationNotification = {
  customerName: string;
  courtName: string;
  dateLabel: string;
  timeRange: string;
  /** "2026-08-18" — used to deep-link the admin day view. */
  shortDate: string;
};

/**
 * Tell the club a player released a slot.
 *
 * The point is not politeness, it is inventory: a slot freed the evening before
 * is worth selling, and the club cannot sell what it does not know about. The
 * day board would show it eventually — this is what makes "eventually" now.
 *
 * Never throws, for the same reason as the booking notification: the row is
 * already updated and the slot is already free by the time this runs.
 */
export async function sendCancellationNotification(
  n: CancellationNotification,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.OWNER_EMAIL;
  const from = process.env.RESEND_FROM ?? `${CLUB.name} <onboarding@resend.dev>`;

  if (!apiKey || !to) {
    console.warn(
      "[email] RESEND_API_KEY ili OWNER_EMAIL nisu podešeni — obaveštenje preskočeno.",
    );
    return;
  }

  const day = n.dateLabel.split(", ")[1] ?? n.dateLabel;
  const subject = `Otkazan termin — ${n.courtName}, ${day} u ${n.timeRange.split(" ")[0]}`;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      subject,
      text: [
        "Igrač je otkazao rezervaciju preko sajta.",
        "",
        `Ime:    ${n.customerName}`,
        `Teren:  ${n.courtName}`,
        `Datum:  ${n.dateLabel}`,
        `Vreme:  ${n.timeRange}`,
        "",
        "Termin je odmah oslobođen i ponovo je dostupan za rezervaciju.",
      ].join("\n"),
      html: renderCancellationHtml(n, siteUrl()),
    });

    if (error) console.error("[email] Resend je vratio grešku:", error);
  } catch (err) {
    console.error("[email] Slanje obaveštenja o otkazivanju nije uspelo:", err);
  }
}

/** Absolute base URL, so the "pregled dana" link works from an inbox. */
function siteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

function renderHtml(n: OwnerNotification, phoneDigits: string, base: string): string {
  const row = (label: string, value: string, strong = false) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #e2e0d8;color:#5a6360;font-size:14px;">${label}</td>
      <td style="padding:10px 0;border-bottom:1px solid #e2e0d8;text-align:right;font-size:${strong ? "17px" : "15px"};font-weight:${strong ? 700 : 500};color:${strong ? "#0f3d2e" : "#10201a"};">${value}</td>
    </tr>`;

  return `<!doctype html>
<html lang="sr">
  <body style="margin:0;background:#faf9f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
    <div style="max-width:520px;margin:0 auto;padding:24px 16px;">
      <div style="background:#0f3d2e;border-radius:16px 16px 0 0;padding:20px 24px;">
        <p style="margin:0;color:#d9f24a;font-size:12px;letter-spacing:.12em;text-transform:uppercase;font-weight:600;">${CLUB.name}</p>
        <h1 style="margin:6px 0 0;color:#fff;font-size:22px;font-weight:700;">Nova rezervacija</h1>
      </div>
      <div style="background:#fff;border:1px solid #e2e0d8;border-top:none;border-radius:0 0 16px 16px;padding:8px 24px 24px;">
        <table style="width:100%;border-collapse:collapse;">
          ${row("Ime i prezime", escapeHtml(n.customerName))}
          ${row("Telefon", `<a href="tel:${phoneDigits}" style="color:#0f3d2e;text-decoration:none;font-weight:600;">${escapeHtml(n.customerPhone)}</a>`)}
          ${row("Teren", escapeHtml(n.courtName))}
          ${row("Datum", escapeHtml(n.dateLabel))}
          ${row("Vreme", escapeHtml(n.timeRange))}
          ${row("Cena", formatRsd(n.priceRsd), true)}
        </table>
        <p style="margin:20px 0 0;font-size:13px;color:#5a6360;line-height:1.6;">
          Termin je automatski upisan u raspored.
          <a href="${base}/admin?datum=${n.shortDate}" style="color:#0f3d2e;font-weight:600;">Pregled dana →</a>
        </p>
      </div>
    </div>
  </body>
</html>`;
}

function renderCancellationHtml(n: CancellationNotification, base: string): string {
  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #e2e0d8;color:#5a6360;font-size:14px;">${label}</td>
      <td style="padding:10px 0;border-bottom:1px solid #e2e0d8;text-align:right;font-size:15px;font-weight:500;color:#10201a;">${value}</td>
    </tr>`;

  return `<!doctype html>
<html lang="sr">
  <body style="margin:0;background:#faf9f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
    <div style="max-width:520px;margin:0 auto;padding:24px 16px;">
      <div style="background:#8a6420;border-radius:16px 16px 0 0;padding:20px 24px;">
        <p style="margin:0;color:#f7efdc;font-size:12px;letter-spacing:.12em;text-transform:uppercase;font-weight:600;">${CLUB.name}</p>
        <h1 style="margin:6px 0 0;color:#fff;font-size:22px;font-weight:700;">Otkazan termin</h1>
      </div>
      <div style="background:#fff;border:1px solid #e2e0d8;border-top:none;border-radius:0 0 16px 16px;padding:8px 24px 24px;">
        <table style="width:100%;border-collapse:collapse;">
          ${row("Ime i prezime", escapeHtml(n.customerName))}
          ${row("Teren", escapeHtml(n.courtName))}
          ${row("Datum", escapeHtml(n.dateLabel))}
          ${row("Vreme", escapeHtml(n.timeRange))}
        </table>
        <p style="margin:20px 0 0;font-size:13px;color:#5a6360;line-height:1.6;">
          Termin je odmah oslobođen i ponovo je dostupan za rezervaciju.
          <a href="${base}/admin?datum=${n.shortDate}" style="color:#0f3d2e;font-weight:600;">Pregled dana →</a>
        </p>
      </div>
    </div>
  </body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
