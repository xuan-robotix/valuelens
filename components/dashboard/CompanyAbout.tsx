import type { CompanyProfile } from "@/types/stock";
import { Card } from "@/components/ui/Card";
import { formatNumber, formatCurrency } from "@/utils/format";

/**
 * "About the company" — built entirely from the profile endpoint, which works
 * for far more tickers than the valuation ratios. So even when we can't score a
 * stock, we can still show its description and key facts (the "show what we can"
 * principle). Renders nothing if there's genuinely nothing to show.
 */
export function CompanyAbout({ profile }: { profile: CompanyProfile }) {
  const stats: Array<{ label: string; value: string }> = [];
  const add = (label: string, value: string | null | undefined) => {
    if (value) stats.push({ label, value });
  };

  add("Sector", profile.sector);
  add("Industry", profile.industry);
  add("52-Week Range", profile.range52w);
  if (profile.beta != null) add("Beta", profile.beta.toFixed(2));
  if (profile.avgVolume != null)
    add("Avg Volume", formatNumber(profile.avgVolume));
  if (profile.employees != null)
    add("Employees", formatNumber(profile.employees));
  add("IPO Date", profile.ipoDate);
  add("CEO", profile.ceo);
  add("Country", profile.country);
  if (profile.lastDividend != null && profile.lastDividend > 0)
    add("Last Dividend", formatCurrency(profile.lastDividend, profile.currency));

  if (!profile.description && stats.length === 0) return null;

  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
        About {profile.name}
      </h3>
      <Card className="space-y-5 p-5">
        {profile.description && (
          <p className="text-sm leading-relaxed text-fg/80">
            {profile.description}
          </p>
        )}

        {stats.length > 0 && (
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                  {s.label}
                </dt>
                <dd className="mt-0.5 text-sm font-medium tabular-nums">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {profile.website && (
          <a
            href={profile.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm text-brand hover:underline"
          >
            Visit website →
          </a>
        )}
      </Card>
    </section>
  );
}
