"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { signOut } from "@/app/actions/account";

/** Account dropdown (signed in) or a Sign-in link (signed out). Rendered only
 * when Supabase is configured — the Header decides that. */
export function UserMenu({ email }: { email: string | null }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!email) {
    return (
      <Link
        href="/login"
        className="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium transition-colors hover:bg-surface-2"
      >
        Sign in
      </Link>
    );
  }

  const initial = email[0]?.toUpperCase() ?? "?";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        aria-label="Account menu"
      >
        {initial}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-surface shadow-lg"
        >
          <div className="border-b border-border px-4 py-3">
            <p className="text-xs text-muted">Signed in as</p>
            <p className="truncate text-sm font-medium">{email}</p>
          </div>
          <nav className="py-1 text-sm">
            <MenuLink href="/watchlist" onClick={() => setOpen(false)}>
              Watchlist
            </MenuLink>
            <MenuLink href="/saved" onClick={() => setOpen(false)}>
              Saved analyses
            </MenuLink>
          </nav>
          <form action={signOut} className="border-t border-border">
            <button
              type="submit"
              className="w-full px-4 py-2.5 text-left text-sm text-expensive hover:bg-surface-2"
            >
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-4 py-2.5 hover:bg-surface-2"
      role="menuitem"
    >
      {children}
    </Link>
  );
}
