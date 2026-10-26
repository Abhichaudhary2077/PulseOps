import { Activity, RefreshCw } from "lucide-react";
import { MetricCard } from "./MetricCard";
import { useAISummary } from "@/hooks/usePulseOps";
import { format } from "date-fns";

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  if (!Number.isFinite(date.getTime())) return "unknown";
  return format(date, "HH:mm:ss");
}

export function AISummaryCard() {
  const { data, isLoading, error, refetch, isFetching } = useAISummary();

  return (
    <MetricCard
      title="Operational Summary"
      icon={Activity}
      isLoading={isLoading}
      error={error?.message}
      className="md:col-span-2 lg:col-span-1"
    >
      {data && (
        <div className="space-y-4">
          <div className="rounded-md bg-terminal-bg border border-terminal-border p-4">
            <p className="font-mono text-sm leading-relaxed text-terminal-text terminal-glow">
              {data.summary}
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="rounded bg-status-warning/20 px-2 py-0.5 text-status-warning">
                rule-based
              </span>
              <span className="font-mono">
                Updated at {formatTimestamp(data.generatedAt)}
              </span>
            </div>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${isFetching ? "animate-spin-slow" : ""}`} />
              Refresh
            </button>
          </div>
        </div>
      )}
    </MetricCard>
  );
}
