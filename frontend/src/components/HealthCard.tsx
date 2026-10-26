import { Activity, Database, HardDrive } from "lucide-react";
import { MetricCard } from "./MetricCard";
import { StatusBadge } from "./StatusBadge";
import { useHealth } from "@/hooks/usePulseOps";

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function statusTextClass(status: string): string {
  if (status === "healthy") return "text-status-healthy";
  if (status === "warning") return "text-status-warning";
  if (status === "unhealthy") return "text-status-unhealthy";
  return "text-status-unknown";
}

export function HealthCard() {
  const { data, isLoading, error } = useHealth();
  const checks = data?.checks ?? {
    api: "unknown",
    database: "unknown",
    memory: "unknown",
  };

  return (
    <MetricCard
      title="System Health"
      icon={Activity}
      isLoading={isLoading}
      error={error?.message}
    >
      {data && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <StatusBadge status={data.status} size="lg" />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Process Uptime</span>
            <span className="font-mono text-sm font-medium text-foreground">
              {formatUptime(data.uptime)}
            </span>
          </div>

          <div className="mt-4 border-t border-border pt-4">
            <p className="mb-3 font-mono text-xs uppercase tracking-wide text-muted-foreground">
              Health Checks
            </p>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">API</span>
                </div>
                <span className={`font-mono text-xs ${statusTextClass(checks.api)}`}>
                  {checks.api}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Database</span>
                </div>
                <span className={`font-mono text-xs ${statusTextClass(checks.database)}`}>
                  {checks.database}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Memory</span>
                </div>
                <span className={`font-mono text-xs ${statusTextClass(checks.memory)}`}>
                  {checks.memory}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </MetricCard>
  );
}
