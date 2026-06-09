"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { cn } from "@/utils/cn";

/**
 * Ticker search. On submit it validates the format client-side and navigates to
 * /stock/[ticker]. Two sizes: the oversized hero variant and a compact header one.
 */
export function SearchBar({
  size = "hero",
  autoFocus = false,
}: {
  size?: "hero" | "compact";
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const t = value.trim().toUpperCase();
    if (!/^[A-Z]{1,6}(\.[A-Z]{1,4})?$/.test(t)) {
      setError("Enter a valid ticker, e.g. AAPL.");
      return;
    }
    setError(null);
    router.push(`/stock/${t}`);
  }

  const hero = size === "hero";

  return (
    <form onSubmit={onSubmit} className={cn("w-full", hero && "max-w-xl")}>
      <div className="relative">
        <SearchIcon
          className={cn(
            "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted",
            hero ? "h-5 w-5" : "h-4 w-4 left-3",
          )}
        />
        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(null);
          }}
          autoFocus={autoFocus}
          spellCheck={false}
          autoCapitalize="characters"
          autoComplete="off"
          placeholder={hero ? "Enter a ticker — AAPL, MSFT, NVDA…" : "Search ticker…"}
          aria-label="Stock ticker"
          className={cn(
            "w-full rounded-xl border border-border bg-surface text-fg placeholder:text-muted",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:border-brand transition",
            hero
              ? "py-4 pl-12 pr-28 text-lg shadow-sm"
              : "py-2 pl-9 pr-3 text-sm w-44 sm:w-56",
          )}
        />
        {hero && (
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            Analyze
          </button>
        )}
      </div>
      {error && hero && (
        <p className="mt-2 text-sm text-expensive" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="m20 20-3-3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
