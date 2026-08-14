"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CalendarPlus,
  CalendarRange,
  Check,
  Loader2,
  Repeat,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import {
  createRecurringAction,
  deleteSeriesAction,
  extendSeriesAction,
  previewRecurringAction,
  unblockSlotAction,
  type RecurringPreview,
} from "@/lib/admin-actions";
import { WEEKDAY_NAMES_SR } from "@/lib/time";

export type SeriesView = {
  recurrenceId: string;
  courtName: string;
  reason: string;
  weekdayLabel: string;
  time: string;
  timeRange: string;
  rangeLabel: string;
  total: number;
  upcoming: number;
  occurrences: Array<{ id: string; label: string; isPast: boolean }>;
};

export type CourtOption = { id: string; name: string };

export function RecurringManager({
  courts,
  times,
  series,
  defaultFrom,
  defaultTo,
}: {
  courts: CourtOption[];
  times: string[];
  series: SeriesView[];
  defaultFrom: string;
  defaultTo: string;
}) {
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null);

  function notify(text: string, ok: boolean) {
    setToast({ text, ok });
    setTimeout(() => setToast(null), 5000);
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

      <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:items-start">
        <CreateForm
          courts={courts}
          times={times}
          defaultFrom={defaultFrom}
          defaultTo={defaultTo}
          onDone={notify}
        />
        <SeriesList series={series} onDone={notify} />
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Create form — with a live preview before anything is written
// ---------------------------------------------------------------------------
function CreateForm({
  courts,
  times,
  defaultFrom,
  defaultTo,
  onDone,
}: {
  courts: CourtOption[];
  times: string[];
  defaultFrom: string;
  defaultTo: string;
  onDone: (text: string, ok: boolean) => void;
}) {
  const router = useRouter();
  const [courtId, setCourtId] = useState(courts[0]?.id ?? "");
  const [weekday, setWeekday] = useState("2"); // Tuesday
  const [time, setTime] = useState(times[times.length - 1] ?? "15:30");
  const [fromDate, setFromDate] = useState(defaultFrom);
  const [toDate, setToDate] = useState(defaultTo);
  const [reason, setReason] = useState("");

  const [preview, setPreview] = useState<RecurringPreview | null>(null);
  const [loadingPreview, startPreview] = useTransition();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflictList, setConflictList] = useState<string[] | null>(null);

  // `reason` is deliberately excluded: it doesn't affect which dates get
  // created, so typing a name shouldn't re-run the preview on every keystroke.
  const schedule = useMemo(
    () => ({ courtId, weekday, time, fromDate, toDate }),
    [courtId, weekday, time, fromDate, toDate],
  );

  // Recompute the preview whenever the schedule changes. The owner sees exactly
  // which dates will be created — and which are already taken — before committing.
  useEffect(() => {
    if (!courtId || !fromDate || !toDate) return;
    startPreview(async () => {
      const res = await previewRecurringAction(schedule);
      setPreview(res);
    });
  }, [schedule, courtId, fromDate, toDate]);

  /** Any schedule edit invalidates a stale conflict prompt from a previous attempt. */
  function edit<T>(setter: (v: T) => void) {
    return (value: T) => {
      setError(null);
      setConflictList(null);
      setter(value);
    };
  }

  async function submit(e: React.FormEvent, skipConflicts = false) {
    e.preventDefault();
    setError(null);
    if (reason.trim().length < 2) {
      setError("Unesite naziv termina — npr. „Stalni termin — Marko Petrović\".");
      return;
    }

    setSaving(true);
    const res = await createRecurringAction({
      courtId,
      weekday,
      time,
      fromDate,
      toDate,
      reason: reason.trim(),
      skipConflicts,
    });
    setSaving(false);

    if (!res.ok) {
      setError(res.error ?? "Greška.");
      setConflictList(res.conflicts ?? null);
      return;
    }

    setReason("");
    setConflictList(null);
    onDone(res.message ?? "Serija je kreirana.", true);
    router.refresh();
  }

  const conflictCount = preview?.conflicts.length ?? 0;
  const willCreate = (preview?.total ?? 0) - conflictCount;

  return (
    <form
      onSubmit={(e) => submit(e, false)}
      className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm lg:sticky lg:top-20"
    >
      <div className="flex items-center gap-2.5">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary">
          <CalendarPlus className="size-4.5 text-on-primary" aria-hidden="true" />
        </div>
        <h2 className="text-lg font-bold">Novi stalni termin</h2>
      </div>

      <Field label="Teren" htmlFor="teren" required>
        <Select
          id="teren"
          value={courtId}
          onChange={(e) => edit(setCourtId)(e.target.value)}
        >
          {courts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Dan u nedelji" htmlFor="dan" required>
          <Select
            id="dan"
            value={weekday}
            onChange={(e) => edit(setWeekday)(e.target.value)}
          >
            {[1, 2, 3, 4, 5, 6, 0].map((d) => (
              <option key={d} value={d}>
                {WEEKDAY_NAMES_SR[d]}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Vreme" htmlFor="vreme" required>
          <Select id="vreme" value={time} onChange={(e) => edit(setTime)(e.target.value)}>
            {times.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Od datuma" htmlFor="od" required>
          <Input
            id="od"
            type="date"
            value={fromDate}
            onChange={(e) => edit(setFromDate)(e.target.value)}
          />
        </Field>
        <Field label="Do datuma" htmlFor="do" required>
          <Input
            id="do"
            type="date"
            value={toDate}
            onChange={(e) => edit(setToDate)(e.target.value)}
          />
        </Field>
      </div>

      <Field
        label="Naziv termina"
        htmlFor="naziv"
        required
        hint="Vidi se u rasporedu i u dnevnom pregledu."
      >
        <Input
          id="naziv"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={120}
          placeholder="Stalni termin — Marko Petrović"
        />
      </Field>

      {/* ---- Live preview ---- */}
      <div className="rounded-xl border border-border bg-muted/50 p-3.5">
        {loadingPreview ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Računam termine…
          </p>
        ) : !preview?.ok ? (
          <p className="text-sm text-muted-foreground">
            {preview?.error ?? "Izaberite period da vidite pregled."}
          </p>
        ) : (
          <>
            <p className="text-sm font-semibold">
              Kreiraće se{" "}
              <span className="tabular text-primary">
                {willCreate} {willCreate === 1 ? "termin" : "termina"}
              </span>
            </p>
            <p className="tabular mt-1 text-xs leading-relaxed text-muted-foreground">
              {preview.dates.slice(0, 10).join(" · ")}
              {preview.dates.length > 10 && ` … +${preview.dates.length - 10}`}
            </p>

            {conflictCount > 0 && (
              <div className="mt-3 rounded-lg bg-warning-soft p-2.5">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-warning">
                  <AlertTriangle className="size-3.5 shrink-0" aria-hidden="true" />
                  {conflictCount} {conflictCount === 1 ? "datum je" : "datuma su"} već zauzet
                  {conflictCount === 1 ? "" : "i"}
                </p>
                <ul className="tabular mt-1 space-y-0.5 text-[11px] text-warning/90">
                  {preview.conflicts.slice(0, 5).map((c, i) => (
                    <li key={i}>
                      {c.label} — {c.who}
                    </li>
                  ))}
                  {preview.conflicts.length > 5 && (
                    <li>… i još {preview.conflicts.length - 5}</li>
                  )}
                </ul>
              </div>
            )}
          </>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl bg-destructive-soft px-3.5 py-3 text-sm text-destructive"
        >
          <p className="font-semibold">{error}</p>
          {conflictList && (
            <>
              <ul className="tabular mt-1.5 space-y-0.5 text-xs">
                {conflictList.slice(0, 6).map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={(e) => submit(e as unknown as React.FormEvent, true)}
                  disabled={saving}
                >
                  Preskoči zauzete i kreiraj ostale
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setError(null);
                    setConflictList(null);
                  }}
                >
                  Odustani
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      <Button
        type="submit"
        variant="accent"
        size="lg"
        className="w-full"
        disabled={saving || !preview?.ok || willCreate < 1}
      >
        {saving ? (
          <>
            <Loader2 className="size-5 animate-spin" aria-hidden="true" />
            Kreiram…
          </>
        ) : (
          <>
            <Repeat className="size-4.5" aria-hidden="true" />
            Kreiraj seriju
          </>
        )}
      </Button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Existing series
// ---------------------------------------------------------------------------
function SeriesList({
  series,
  onDone,
}: {
  series: SeriesView[];
  onDone: (text: string, ok: boolean) => void;
}) {
  if (series.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted">
          <CalendarRange className="size-6 text-muted-foreground" aria-hidden="true" />
        </div>
        <h3 className="mt-3 text-lg font-semibold">Još nema stalnih termina</h3>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
          Kreirajte prvi nedeljni termin sa leve strane. Svi termini iz jedne serije se posle
          brišu ili produžavaju jednim klikom.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold">
        Aktivne serije{" "}
        <span className="tabular text-sm font-medium text-muted-foreground">
          ({series.length})
        </span>
      </h2>
      {series.map((s) => (
        <SeriesCard key={s.recurrenceId} s={s} onDone={onDone} />
      ))}
    </div>
  );
}

function SeriesCard({
  s,
  onDone,
}: {
  s: SeriesView;
  onDone: (text: string, ok: boolean) => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  async function remove() {
    const ok = window.confirm(
      `Obrisati celu seriju?\n\n${s.reason}\n${s.courtName} · ${s.weekdayLabel} u ${s.time}\n${s.total} termina (${s.rangeLabel})\n\nSvi ti termini postaju slobodni za rezervaciju.`,
    );
    if (!ok) return;
    setBusy("series");
    const res = await deleteSeriesAction(s.recurrenceId);
    setBusy(null);
    onDone(res.message ?? res.error ?? "", res.ok);
    router.refresh();
  }

  async function extend() {
    setBusy("extend");
    const res = await extendSeriesAction(s.recurrenceId, 8);
    setBusy(null);
    onDone(res.message ?? res.error ?? "", res.ok);
    router.refresh();
  }

  async function removeOne(id: string) {
    setBusy(id);
    const res = await unblockSlotAction(id);
    setBusy(null);
    onDone(res.message ?? res.error ?? "", res.ok);
    router.refresh();
  }

  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-green-50">
          <Repeat className="size-5 text-primary" aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold">{s.reason}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{s.courtName}</span> ·{" "}
            {s.weekdayLabel} · <span className="tabular">{s.timeRange}</span>
          </p>
          <p className="tabular mt-1 text-xs text-muted-foreground">
            {s.rangeLabel} · {s.total} {s.total === 1 ? "termin" : "termina"}
            {s.upcoming < s.total && ` · ${s.upcoming} predstojećih`}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          {expanded ? "Sakrij termine" : "Prikaži termine"}
        </Button>
        <Button size="sm" variant="outline" onClick={extend} disabled={busy === "extend"}>
          {busy === "extend" ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <CalendarPlus className="size-3.5" aria-hidden="true" />
          )}
          Produži 8 nedelja
        </Button>
        <Button
          size="sm"
          variant="destructive"
          className="ml-auto"
          onClick={remove}
          disabled={busy === "series"}
        >
          {busy === "series" ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <Trash2 className="size-3.5" aria-hidden="true" />
          )}
          Obriši seriju
        </Button>
      </div>

      {expanded && (
        <ul className="mt-3 grid gap-1.5 border-t border-border pt-3 sm:grid-cols-2">
          {s.occurrences.map((o) => (
            <li
              key={o.id}
              className={cn(
                "tabular flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-sm",
                o.isPast ? "text-muted-foreground/60" : "bg-muted/60",
              )}
            >
              <span className="flex items-center gap-1.5">
                {o.isPast ? (
                  <Check className="size-3.5 shrink-0" aria-hidden="true" />
                ) : (
                  <span
                    className="size-1.5 shrink-0 rounded-full bg-primary"
                    aria-hidden="true"
                  />
                )}
                {o.label}
              </span>
              {!o.isPast && (
                <button
                  type="button"
                  onClick={() => removeOne(o.id)}
                  disabled={busy === o.id}
                  aria-label={`Otkaži samo ${o.label}`}
                  title="Otkaži samo ovaj termin"
                  className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive hover:text-on-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                >
                  {busy === o.id ? (
                    <Loader2 className="size-3 animate-spin" aria-hidden="true" />
                  ) : (
                    <Trash2 className="size-3" aria-hidden="true" />
                  )}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
