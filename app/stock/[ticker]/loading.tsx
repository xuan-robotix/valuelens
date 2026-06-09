import { Skeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";

/** Skeleton dashboard shown while the server fetches & scores. Mirrors the real
 * layout so the page doesn't jump when content arrives. */
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="space-y-8">
        {/* Company header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        {/* Verdict */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-9 w-64" />
              <Skeleton className="h-4 w-80" />
            </div>
            <Skeleton className="h-14 w-24" />
          </div>
        </Card>

        {/* Metric groups */}
        {[5, 2, 4].map((count, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-4 w-28" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: count }).map((_, j) => (
                <Card key={j} className="space-y-3 p-5">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-8 w-16" />
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
