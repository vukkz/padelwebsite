import { Database } from "lucide-react";

/**
 * Shown instead of a stack trace when Supabase env vars are missing, so a fresh
 * clone renders something useful rather than an error page.
 */
export function SetupNotice() {
  return (
    <div className="mx-auto mt-8 max-w-lg rounded-2xl border border-border bg-card p-6">
      <div className="flex size-11 items-center justify-center rounded-xl bg-warning-soft">
        <Database className="size-5 text-warning" aria-hidden="true" />
      </div>
      <h2 className="font-display mt-4 text-xl font-bold">Baza još nije povezana</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Dodajte <code className="rounded bg-muted px-1.5 py-0.5 text-xs">.env.local</code> sa
        Supabase podacima, pokrenite migraciju iz{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
          supabase/migrations/0001_init.sql
        </code>
        , pa <code className="rounded bg-muted px-1.5 py-0.5 text-xs">npm run seed</code>.
      </p>
      <p className="mt-3 text-xs text-muted-foreground">
        Detaljna uputstva su u <span className="font-medium">README.md</span>.
      </p>
    </div>
  );
}
