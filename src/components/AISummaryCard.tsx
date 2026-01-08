import { Sparkles, RefreshCw } from "lucide-react";
import { MetricCard } from "./MetricCard";
import { useAISummary } from "@/hooks/usePulseOps";
import { format } from "date-fns";

export function AISummaryCard() {
  const { data, isLoading, error, refetch, isFetching } = useAISummary();

  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), "HH:mm:ss");
    } catch {
      return timestamp;
    }
  };

  return (
    <MetricCard
      title="AI System Summary"
      icon={Sparkles}
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
              {data.fallback && (
                <span className="rounded bg-status-warning/20 px-2 py-0.5 text-status-warning">
                  fallback
                </span>
              )}
              <span className="font-mono">
                Generated at {formatTimestamp(data.generatedAt)}
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
