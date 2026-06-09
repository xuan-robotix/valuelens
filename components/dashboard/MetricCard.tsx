import type { DisplayMetric } from "@/types/stock";
import type { MetricContext } from "@/lib/sectorContext";
import { Card } from "@/components/ui/Card";
import { Tooltip } from "@/components/ui/Tooltip";
import { formatByKind } from "@/utils/format";
import { cn } from "@/utils/cn";

export function MetricCard({
  metric,
  currency = "USD",
  context,
}: {
  metric: DisplayMetric;
  currency?: string;
  context?: MetricContext;
}) {
  return (
    <Card className="flex flex-col gap-2 p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted">
          {metric.label}
        </span>
        <Tooltip text={metric.help} />
      </div>
      <span className="text-3xl font-semibold tabular-nums">
        {formatByKind(metric.value, metric.format, currency)}
      </span>
      {context && (
        <span
          className={cn(
            "text-xs font-medium",
            context.tone === "good" && "text-attractive",
            context.tone === "bad" && "text-expensive",
            context.tone === "neutral" && "text-muted",
          )}
        >
          {context.text}
        </span>
      )}
    </Card>
  );
}
