"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/courses", label: "コース一覧", icon: BookOpen },
  { href: "/progress", label: "学習進捗", icon: BarChart3 },
];

export function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="cursor-pointer text-lg font-bold tracking-tight text-[var(--color-primary)]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          learn-todai
        </Link>

        {/* Tablet nav (hidden on mobile + large desktop where sidebar shows) */}
        <nav className="hidden items-center gap-1 md:flex lg:hidden">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]/50 hover:text-[var(--color-text-primary)]"
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User area (desktop) */}
        <div className="hidden items-center gap-3 md:flex">
          {session?.user && (
            <>
              <div className="flex items-center gap-2">
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name}
                    className="h-7 w-7 rounded-full"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-bold text-white">
                    {session.user.name?.charAt(0) ?? "?"}
                  </div>
                )}
                <span className="text-sm font-medium text-[var(--color-text-primary)]">
                  {session.user.name}
                </span>
              </div>
              <button
                onClick={() =>
                  signOut({
                    fetchOptions: {
                      onSuccess: () => {
                        window.location.href = "/sign-in";
                      },
                    },
                  })
                }
                className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1.5 text-sm text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-border)]/50 hover:text-[var(--color-error)]"
              >
                <LogOut size={15} />
                <span>ログアウト</span>
              </button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex cursor-pointer items-center justify-center rounded-md p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]/50 md:hidden"
          aria-label="メニュー"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-[var(--color-border)] bg-[var(--color-surface)] md:hidden">
          <nav className="flex flex-col px-4 py-2">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex cursor-pointer items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]/50 hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  <item.icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          {session?.user && (
            <div className="border-t border-[var(--color-border)] px-4 py-3">
              <div className="mb-2 flex items-center gap-2">
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name}
                    className="h-7 w-7 rounded-full"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-bold text-white">
                    {session.user.name?.charAt(0) ?? "?"}
                  </div>
                )}
                <span className="text-sm font-medium text-[var(--color-text-primary)]">
                  {session.user.name}
                </span>
              </div>
              <button
                onClick={() =>
                  signOut({
                    fetchOptions: {
                      onSuccess: () => {
                        window.location.href = "/sign-in";
                      },
                    },
                  })
                }
                className="flex w-full cursor-pointer items-center gap-1.5 rounded-md px-3 py-2 text-sm text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-border)]/50 hover:text-[var(--color-error)]"
              >
                <LogOut size={15} />
                <span>ログアウト</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
