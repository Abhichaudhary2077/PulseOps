import { Package, GitBranch, Clock, Server } from "lucide-react";
import { MetricCard } from "./MetricCard";
import { useVersion } from "@/hooks/usePulseOps";
import { format } from "date-fns";

export function VersionCard() {
  const { data, isLoading, error } = useVersion();

  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), "MMM d, yyyy HH:mm");
    } catch {
      return timestamp;
    }
  };

  return (
    <MetricCard
      title="Deployment Info"
      icon={Package}
      isLoading={isLoading}
      error={error?.message}
    >
      {data && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Version</span>
            </div>
            <span className="font-mono text-lg font-bold text-primary">
              v{data.version}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Commit</span>
            </div>
            <code className="rounded bg-muted px-2 py-1 font-mono text-xs text-foreground">
              {data.gitCommit}
            </code>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Built</span>
            </div>
            <span className="font-mono text-xs text-muted-foreground">
              {formatTimestamp(data.buildTimestamp)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Environment</span>
            </div>
            <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-xs font-medium text-primary">
              {data.environment}
            </span>
          </div>
        </div>
      )}
    </MetricCard>
  );
}
