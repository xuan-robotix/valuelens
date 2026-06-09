import type { MetricGroup as MetricGroupType } from "@/types/stock";
import type { MetricContext } from "@/lib/sectorContext";
import { MetricCard } from "./MetricCard";

export function MetricGroup({
  group,
  currency = "USD",
  contexts,
}: {
  group: MetricGroupType;
  currency?: string;
  contexts?: Record<string, MetricContext>;
}) {
  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
        {group.title}
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {group.metrics.map((m) => (
          <MetricCard
            key={m.key}
            metric={m}
            currency={currency}
            context={contexts?.[m.key]}
          />
        ))}
      </div>
    </section>
  );
}
