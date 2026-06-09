import type { ValuationHistoryPoint } from "@/types/stock";
import { Card } from "@/components/ui/Card";
import { cn } from "@/utils/cn";

/**
 * Valuation-over-time: a small SVG line chart of the P/E ratio across the last
 * few fiscal years, with the average as a reference line and a plain-English
 * "cheaper/pricier than its own history" caption. Pure, server-rendered.
 */
export function ValuationTrend({
  points,
}: {
  points: ValuationHistoryPoint[];
}) {
  const data = points.filter(
    (p): p is { year: string; peRatio: number; psRatio: number | null } =>
      typeof p.peRatio === "number" && isFinite(p.peRatio),
  );
  if (data.length < 2) return null;

  const values = data.map((d) => d.peRatio);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const latest = values[values.length - 1];
  const pctVsAvg = ((latest - avg) / avg) * 100;
  const pricier = latest > avg;

  // SVG geometry
  const W = 600;
  const H = 200;
  const padX = 36;
  const padTop = 24;
  const padBottom = 30;
  const plotW = W - padX * 2;
  const plotH = H - padTop - padBottom;
  const yMin = min - (max - min || 1) * 0.25;
  const yMax = max + (max - min || 1) * 0.15;

  const x = (i: number) => padX + (i / (data.length - 1)) * plotW;
  const y = (v: number) =>
    padTop + (1 - (v - yMin) / (yMax - yMin)) * plotH;

  const linePath = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(d.peRatio).toFixed(1)}`)
    .join(" ");
  const avgY = y(avg);

  return (
    <section>
      <h3 className="mb-1 text-sm font-semibold uppercase tracking-wider text-muted">
        Valuation over time
      </h3>
      <p className="mb-3 text-sm text-muted">
        P/E ratio by fiscal year — is it cheap or rich versus its own history?
      </p>

      <Card className="p-5">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          role="img"
          aria-label="P/E ratio over time"
        >
          {/* average reference line */}
          <line
            x1={padX}
            x2={W - padX}
            y1={avgY}
            y2={avgY}
            className="stroke-border"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
          <text
            x={W - padX}
            y={avgY - 5}
            textAnchor="end"
            className="fill-muted"
            fontSize="11"
          >
            avg {avg.toFixed(1)}
          </text>

          {/* trend line */}
          <path d={linePath} fill="none" className="stroke-brand" strokeWidth={2} />

          {/* points + labels */}
          {data.map((d, i) => (
            <g key={d.year}>
              <circle cx={x(i)} cy={y(d.peRatio)} r={3.5} className="fill-brand" />
              <text
                x={x(i)}
                y={y(d.peRatio) - 9}
                textAnchor="middle"
                className="fill-fg"
                fontSize="11"
                fontWeight="600"
              >
                {d.peRatio.toFixed(1)}
              </text>
              <text
                x={x(i)}
                y={H - 10}
                textAnchor="middle"
                className="fill-muted"
                fontSize="11"
              >
                {d.year}
              </text>
            </g>
          ))}
        </svg>

        <p className="mt-3 border-t border-border pt-3 text-sm">
          <span className="text-muted">Current P/E of </span>
          <span className="font-semibold tabular-nums">{latest.toFixed(1)}</span>
          <span className="text-muted"> is </span>
          <span
            className={cn(
              "font-semibold tabular-nums",
              pricier ? "text-expensive" : "text-attractive",
            )}
          >
            {Math.abs(pctVsAvg).toFixed(0)}% {pricier ? "above" : "below"}
          </span>
          <span className="text-muted">
            {" "}
            its {data.length}-year average of {avg.toFixed(1)} —{" "}
            {pricier ? "pricier" : "cheaper"} than its own history.
          </span>
        </p>
      </Card>
    </section>
  );
}
