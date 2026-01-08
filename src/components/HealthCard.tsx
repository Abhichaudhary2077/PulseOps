import { Activity, Database, HardDrive } from "lucide-react";
import { MetricCard } from "./MetricCard";
import { StatusBadge } from "./StatusBadge";
import { useHealth } from "@/hooks/usePulseOps";

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function HealthCard() {
  const { data, isLoading, error } = useHealth();

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
            <span className="text-sm text-muted-foreground">Uptime</span>
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
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Database</span>
                </div>
                <span className={`font-mono text-xs ${
                  data.checks.database === "healthy" 
                    ? "text-status-healthy" 
                    : "text-status-unhealthy"
                }`}>
                  {data.checks.database}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Memory</span>
                </div>
                <span className={`font-mono text-xs ${
                  data.checks.memory === "healthy" 
                    ? "text-status-healthy" 
                    : "text-status-unhealthy"
                }`}>
                  {data.checks.memory}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </MetricCard>
  );
}
