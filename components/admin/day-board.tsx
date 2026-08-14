"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Lock, Phone, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import {
  blockSlotAction,
  cancelBookingAction,
  unblockSlotAction,
} from "@/lib/admin-actions";

export type DayCell = {
  time: string;
  timeRange: string;
  courtId: string;
  status: "free" | "booked" | "blocked" | "cancelled-free";
  booking?: {
    id: string;
    name: string;
    phone: string;
    phoneHref: string;
    priceRsd: number;
    isRecurring: boolean;
  };
  block?: { id: string; reason: string; isSeries: boolean };
};

export type DayCourt = { id: string; name: string; cells: DayCell[] };

export function DayBoard({
  dateStr,
  courts,
  times,
}: {
  dateStr: string;
  courts: DayCourt[];
  times: string[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null);
  const [blockTarget, setBlockTarget] = useState<{
    courtId: string;
    courtName: string;
    time: string;
  } | null>(null);

  function run(id: string, fn: () => Promise<{ ok: boolean; message?: string; error?: string }>) {
    setBusyId(id);
    startTransition(async () => {
      const res = await fn();
      setToast({ text: res.message ?? res.error ?? "", ok: res.ok });
      setBusyId(null);
      router.refresh();
      setTimeout(() => setToast(null), 4000);
    });
  }

  function cancel(cell: DayCell) {
    if (!cell.booking) return;
    const ok = window.confirm(
      `Otkazati rezervaciju?\n\n${cell.booking.name} — ${cell.timeRange}\n\nTermin će odmah postati slobodan za nove rezervacije.`,
    );
    if (!ok) return;
    run(cell.booking.id, () => cancelBookingAction(cell.booking!.id));
  }

  return (
    <>
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            "animate-fade-in fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-xl px-4 py-3 text-sm font-medium shadow-lg",
            toast.ok ? "bg-primary text-on-primary" : "bg-destructive text-on-destructive",
          )}
        >
          {toast.text}
        </div>
      )}

      <div className="mt-4 overflow-x-auto">
        <div
          className="grid min-w-[720px] gap-2"
          style={{ gridTemplateColumns: `76px repeat(${courts.length}, minmax(0, 1fr))` }}
        >
          <div />
          {courts.map((c) => (
            <div
              key={c.id}
              className="rounded-xl bg-primary px-3 py-2 text-center text-base font-semibold text-on-primary"
            >
              {c.name}
            </div>
          ))}

          {times.map((time, rowIdx) => (
            <div key={time} className="contents">
              <div className="tabular flex items-start justify-end pr-1 pt-3 text-sm font-semibold text-muted-foreground">
                {time}
              </div>
              {courts.map((court) => {
                const cell = court.cells[rowIdx];
                if (!cell) return <div key={court.id} />;
                return (
                  <AdminCell
                    key={court.id}
                    cell={cell}
                    courtName={court.name}
                    busy={busyId !== null && pending}
                    busyId={busyId}
                    onCancel={() => cancel(cell)}
                    onUnblock={() =>
                      cell.block && run(cell.block.id, () => unblockSlotAction(cell.block!.id))
                    }
                    onBlock={() =>
                      setBlockTarget({
                        courtId: court.id,
                        courtName: court.name,
                        time: cell.time,
                      })
                    }
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {blockTarget && (
        <BlockDialog
          dateStr={dateStr}
          target={blockTarget}
          onClose={() => setBlockTarget(null)}
          onDone={(res) => {
            setBlockTarget(null);
            setToast({ text: res.message ?? res.error ?? "", ok: res.ok });
            router.refresh();
            setTimeout(() => setToast(null), 4000);
          }}
        />
      )}
    </>
  );
}

function AdminCell({
  cell,
  courtName,
  busy,
  busyId,
  onCancel,
  onUnblock,
  onBlock,
}: {
  cell: DayCell;
  courtName: string;
  busy: boolean;
  busyId: string | null;
  onCancel: () => void;
  onUnblock: () => void;
  onBlock: () => void;
}) {
  if (cell.status === "booked" && cell.booking) {
    const isBusy = busy && busyId === cell.booking.id;
    return (
      <div className="rounded-xl border border-primary/25 bg-green-50 p-2.5">
        <div className="flex items-start justify-between gap-1.5">
          <p className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
            {cell.booking.name}
          </p>
          <button
            type="button"
            onClick={onCancel}
            disabled={isBusy}
            aria-label={`Otkaži rezervaciju — ${cell.booking.name}, ${courtName}, ${cell.timeRange}`}
            title="Otkaži rezervaciju"
            className="-mr-1 -mt-1 flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive hover:text-on-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            {isBusy ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <X className="size-3.5" aria-hidden="true" />
            )}
          </button>
        </div>
        <a
          href={cell.booking.phoneHref}
          className="tabular mt-0.5 inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <Phone className="size-3" aria-hidden="true" />
          {cell.booking.phone}
        </a>
        <p className="tabular mt-1 text-xs font-medium text-muted-foreground">
          {cell.booking.priceRsd.toLocaleString("sr-RS")} RSD
        </p>
      </div>
    );
  }

  if (cell.status === "blocked" && cell.block) {
    const isBusy = busy && busyId === cell.block.id;
    return (
      <div className="rounded-xl border border-border bg-muted p-2.5">
        <div className="flex items-start justify-between gap-1.5">
          <p className="flex min-w-0 flex-1 items-center gap-1 text-xs font-medium text-muted-foreground">
            <Lock className="size-3 shrink-0" aria-hidden="true" />
            <span className="truncate">{cell.block.reason}</span>
          </p>
          <button
            type="button"
            onClick={onUnblock}
            disabled={isBusy}
            aria-label={`Oslobodi termin — ${cell.block.reason}, ${courtName}, ${cell.timeRange}`}
            title="Oslobodi termin"
            className="-mr-1 -mt-1 flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive hover:text-on-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            {isBusy ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Trash2 className="size-3.5" aria-hidden="true" />
            )}
          </button>
        </div>
        {cell.block.isSeries && (
          <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Deo serije
          </p>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onBlock}
      aria-label={`Blokiraj termin — ${courtName}, ${cell.timeRange}`}
      className="group flex min-h-[68px] cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border bg-card/50 p-2 text-muted-foreground transition-all hover:border-primary/50 hover:bg-green-50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Check className="size-3.5 text-success" aria-hidden="true" />
      <span className="text-xs font-medium">Slobodno</span>
      <span className="inline-flex items-center gap-0.5 text-[10px] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
        <Plus className="size-2.5" aria-hidden="true" />
        blokiraj
      </span>
    </button>
  );
}

function BlockDialog({
  dateStr,
  target,
  onClose,
  onDone,
}: {
  dateStr: string;
  target: { courtId: string; courtName: string; time: string };
  onClose: () => void;
  onDone: (res: { ok: boolean; message?: string; error?: string }) => void;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const PRESETS = ["Održavanje terena", "Turnir", "Škola padela", "Privatno"];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (reason.trim().length < 2) {
      setError("Unesite razlog.");
      return;
    }
    setSaving(true);
    const res = await blockSlotAction({
      courtId: target.courtId,
      dateStr,
      time: target.time,
      reason: reason.trim(),
    });
    setSaving(false);
    if (!res.ok) {
      setError(res.error ?? "Greška.");
      return;
    }
    onDone(res);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="block-title"
    >
      <button
        type="button"
        aria-label="Zatvori"
        onClick={onClose}
        className="animate-fade-in absolute inset-0 cursor-default bg-green-950/50"
      />
      <form
        onSubmit={submit}
        className="animate-sheet-up relative w-full max-w-sm space-y-4 rounded-t-3xl bg-card p-5 shadow-2xl sm:rounded-2xl"
      >
        <div>
          <h2 id="block-title" className="text-lg font-bold">
            Blokiraj termin
          </h2>
          <p className="text-sm text-muted-foreground">
            {target.courtName} · {target.time}
          </p>
        </div>

        <Field label="Razlog" htmlFor="razlog" required error={error ?? undefined}>
          <Input
            id="razlog"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            autoFocus
            maxLength={120}
            placeholder="npr. Održavanje terena"
          />
        </Field>

        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setReason(p)}
              className="cursor-pointer rounded-full border border-border px-3 py-1.5 text-xs transition-colors hover:border-primary hover:bg-green-50"
            >
              {p}
            </button>
          ))}
        </div>

        <div className="flex gap-2 pt-1">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Odustani
          </Button>
          <Button type="submit" variant="primary" className="flex-1" disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : "Blokiraj"}
          </Button>
        </div>
      </form>
    </div>
  );
}
