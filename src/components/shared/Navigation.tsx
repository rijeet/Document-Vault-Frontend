"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, FolderOpen, Settings as SettingsIcon, LogOut } from "lucide-react";
import { cn } from "@/lib/cn";
import { useAuth } from "@/features/auth/AuthProvider";
import { useLogout } from "@/features/auth/hooks";

const NAV_ITEMS = [
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/categories", label: "Categories", icon: FolderOpen },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

export function Navigation() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { mutate: logout, isPending } = useLogout();

  return (
    <>
      {/* ── Desktop sidebar (md and up) ── */}
      <aside className="hidden md:sticky md:top-0 md:flex md:h-screen md:w-60 md:flex-col md:border-r md:border-border-subtle md:bg-surface">
        <div className="p-6">
          <h1 className="text-lg font-semibold text-text-primary">Document Vault</h1>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-ring",
                  active
                    ? "bg-accent-muted text-accent"
                    : "text-text-secondary hover:bg-hover hover:text-text-primary",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border-subtle p-3">
          <div className="flex items-center gap-3 rounded-md px-3 py-2">
            {user?.profilePicture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.profilePicture} alt="" className="h-8 w-8 rounded-full" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-xs text-text-secondary">
                {user?.name?.[0]?.toUpperCase() ?? "?"}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text-primary">{user?.name}</p>
              <p className="truncate text-xs text-text-muted">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            disabled={isPending}
            className="mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-hover hover:text-danger focus-ring disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />
            {isPending ? "Logging out…" : "Log out"}
          </button>
        </div>
      </aside>

      {/* ── Mobile top header (below md) ── */}
      <header className="flex items-center justify-between border-b border-border-subtle bg-surface px-4 py-3 md:hidden">
        <h1 className="text-base font-semibold text-text-primary">Document Vault</h1>
        <button
          onClick={() => logout()}
          disabled={isPending}
          aria-label="Log out"
          className="rounded-md p-2 text-text-secondary hover:bg-hover hover:text-danger focus-ring disabled:opacity-50"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </header>

      {/* ── Mobile bottom tab bar (below md) ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-border-subtle bg-surface md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors focus-ring",
                active ? "text-accent" : "text-text-secondary",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}