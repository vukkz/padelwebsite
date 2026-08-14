"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, LogOut, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/lib/admin-actions";
import { CLUB } from "@/lib/config";

const TABS = [
  { href: "/admin", label: "Dan", icon: CalendarDays },
  { href: "/admin/stalni-termini", label: "Stalni termini", icon: Repeat },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-green-900 text-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <span className="font-display text-base font-bold tracking-tight">
          {CLUB.name}
          <span className="ml-1.5 rounded bg-accent px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-on-accent">
            Admin
          </span>
        </span>

        <nav className="flex items-center gap-1" aria-label="Admin navigacija">
          {TABS.map((tab) => {
            const active = pathname === tab.href;
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                  active ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10",
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                <span className="hidden sm:inline">{tab.label}</span>
              </Link>
            );
          })}
        </nav>

        <form action={logoutAction} className="ml-auto">
          <button
            type="submit"
            className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <LogOut className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Odjava</span>
          </button>
        </form>
      </div>
    </header>
  );
}
