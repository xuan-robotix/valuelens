"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toggleWatchlist, saveAnalysis } from "@/app/actions/account";
import { cn } from "@/utils/cn";

/**
 * Save / watchlist controls on the dashboard. Rendered only when accounts are
 * enabled. Logged-out users get sign-in prompts (the conversion hook); logged-in
 * users get real toggles backed by server actions.
 */
export function SaveActions({
  ticker,
  isAuthed,
  initialWatched,
}: {
  ticker: string;
  isAuthed: boolean;
  initialWatched: boolean;
}) {
  const [watched, setWatched] = useState(initialWatched);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!isAuthed) {
    const next = `/login?next=/stock/${ticker}`;
    return (
      <div className="flex flex-wrap gap-2">
        <Link href={next} className={btn("secondary")}>
          ☆ Sign in to watch
        </Link>
        <Link href={next} className={btn("secondary")}>
          Sign in to save
        </Link>
      </div>
    );
  }

  function onToggleWatch() {
    setWatched((w) => !w); // optimistic
    startTransition(async () => {
      try {
        await toggleWatchlist(ticker);
      } catch {
        setWatched((w) => !w); // revert on failure
      }
    });
  }

  function onSave() {
    startTransition(async () => {
      await saveAnalysis(ticker);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={onToggleWatch}
        disabled={pending}
        className={btn(watched ? "active" : "secondary")}
      >
        {watched ? "★ In watchlist" : "☆ Add to watchlist"}
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={pending}
        className={btn("secondary")}
      >
        {saved ? "✓ Saved" : "Save analysis"}
      </button>
    </div>
  );
}

function btn(kind: "secondary" | "active") {
  return cn(
    "inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
    "disabled:opacity-60",
    kind === "active"
      ? "border border-brand bg-brand-soft text-brand"
      : "border border-border bg-surface hover:bg-surface-2",
  );
}
