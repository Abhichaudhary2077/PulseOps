import {
  Activity,
  Cpu,
  Gauge,
  MemoryStick,
  Server,
} from "lucide-react";
import { MetricCard } from "./MetricCard";
import { useSystemMetrics } from "@/hooks/usePulseOps";

function formatBytes(bytes: number): string {
  if (bytes < 1024 ** 3) {
    return `${(bytes / 1024 ** 2).toFixed(0)} MB`;
  }

  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function SystemMetricsCard() {
  const { data, isLoading, error } = useSystemMetrics();

  return (
    <MetricCard
      title="VM Resources"
      icon={Server}
      isLoading={isLoading}
      error={error?.message}
    >
      {data && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">CPU</span>
            </div>

            <span className="font-mono text-sm font-medium">
              {data.cpu.usagePercent}%
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MemoryStick className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Memory</span>
            </div>

            <span className="font-mono text-sm font-medium">
              {data.memory.usedPercent}%
            </span>
          </div>

          <div className="rounded-md bg-muted/40 p-3">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                RAM Usage
              </span>

              <span className="font-mono text-xs">
                {formatBytes(data.memory.usedBytes)} /{" "}
                {formatBytes(data.memory.totalBytes)}
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{
                  width: `${Math.min(data.memory.usedPercent, 100)}%`,
                }}
              />
            </div>

            <p className="mt-2 font-mono text-xs text-muted-foreground">
              {formatBytes(data.memory.availableBytes)} available
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Load</span>
            </div>

            <span className="font-mono text-sm">
              {data.loadAverage.oneMinute}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                VM Uptime
              </span>
            </div>

            <span className="font-mono text-sm">
              {formatUptime(data.vmUptimeSeconds)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              CPU Cores
            </span>

            <span className="font-mono text-xs">
              {data.cpu.cores}
            </span>
          </div>
        </div>
      )}
    </MetricCard>
  );
}
