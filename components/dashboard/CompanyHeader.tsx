import type { CompanyProfile } from "@/types/stock";
import { cn } from "@/utils/cn";
import {
  formatCurrency,
  formatChange,
  formatMarketCap,
} from "@/utils/format";

export function CompanyHeader({ profile }: { profile: CompanyProfile }) {
  const change = profile.changePercent;
  const up = (change ?? 0) >= 0;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-semibold tracking-tight">
            {profile.name}
          </h1>
          <span className="rounded-md border border-border bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted">
            {profile.ticker} · {profile.exchange}
          </span>
        </div>
        {(profile.sector || profile.industry) && (
          <p className="mt-1 text-sm text-muted">
            {[profile.sector, profile.industry].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>

      <div className="text-left sm:text-right">
        <div className="text-2xl font-semibold tabular-nums">
          {formatCurrency(profile.price, profile.currency)}
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-sm sm:justify-end">
          {change != null && (
            <span
              className={cn(
                "tabular-nums font-medium",
                up ? "text-attractive" : "text-expensive",
              )}
            >
              {up ? "▲" : "▼"} {formatChange(change)}
            </span>
          )}
          <span className="text-muted">
            Mkt Cap {formatMarketCap(profile.marketCap, profile.currency)}
          </span>
        </div>
      </div>
    </div>
  );
}
