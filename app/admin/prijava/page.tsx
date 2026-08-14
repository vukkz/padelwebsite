import { redirect } from "next/navigation";
import { KeyRound, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import {
  checkPassword,
  createSession,
  isAdmin,
  isAdminConfigured,
} from "@/lib/admin-auth";
import { CLUB } from "@/lib/config";

export const metadata = { title: "Prijava — Admin" };

export default async function LoginPage({ searchParams }: PageProps<"/admin/prijava">) {
  if (await isAdmin()) redirect("/admin");
  const params = await searchParams;
  const failed = params.greska === "1";
  const configured = isAdminConfigured();

  async function login(formData: FormData) {
    "use server";
    // Re-checked here, not just in the disabled button: a Server Action is a
    // public endpoint and can be called without ever rendering this form.
    if (!isAdminConfigured()) redirect("/admin/prijava");
    const password = String(formData.get("lozinka") ?? "");
    if (!checkPassword(password)) redirect("/admin/prijava?greska=1");
    await createSession();
    redirect("/admin");
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary">
            <KeyRound className="size-6 text-on-primary" aria-hidden="true" />
          </div>
          <h1 className="font-display mt-4 text-2xl font-bold">Admin panel</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {CLUB.name} {CLUB.city}
          </p>
        </div>

        <form
          action={login}
          className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm"
        >
          {!configured && (
            <div
              role="alert"
              className="rounded-xl bg-warning-soft px-3.5 py-3 text-sm text-warning"
            >
              <p className="font-semibold">Admin panel nije podešen.</p>
              <p className="mt-1 leading-relaxed">
                Dodajte <code className="font-mono text-xs">ADMIN_PASSWORD</code> i{" "}
                <code className="font-mono text-xs">ADMIN_SESSION_SECRET</code> u{" "}
                <code className="font-mono text-xs">.env.local</code>, pa restartujte server.
              </p>
            </div>
          )}

          {failed && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-xl bg-destructive-soft px-3.5 py-3 text-sm font-medium text-destructive"
            >
              <ShieldAlert className="size-4 shrink-0" aria-hidden="true" />
              Pogrešna lozinka.
            </div>
          )}

          <Field label="Lozinka" htmlFor="lozinka" required>
            <Input
              id="lozinka"
              name="lozinka"
              type="password"
              autoComplete="current-password"
              autoFocus
              required
              disabled={!configured}
            />
          </Field>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={!configured}
          >
            Prijavi se
          </Button>
        </form>
      </div>
    </main>
  );
}
