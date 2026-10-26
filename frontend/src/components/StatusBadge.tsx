import { cn } from "@/lib/utils";

type ServiceStatus = "UP" | "DEGRADED" | "DOWN" | "UNKNOWN";

interface StatusBadgeProps {
  status: ServiceStatus;
  size?: "sm" | "md" | "lg";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const sizeClasses = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-4 w-4",
  };

  const statusClasses: Record<ServiceStatus, string> = {
    UP: "bg-status-healthy status-pulse",
    DEGRADED: "bg-status-warning",
    DOWN: "bg-status-unhealthy status-pulse-unhealthy",
    UNKNOWN: "bg-status-unknown",
  };

  const labelClasses: Record<ServiceStatus, string> = {
    UP: "text-status-healthy",
    DEGRADED: "text-status-warning",
    DOWN: "text-status-unhealthy",
    UNKNOWN: "text-status-unknown",
  };

  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "rounded-full",
          sizeClasses[size],
          statusClasses[status],
        )}
      />
      <span className={cn("font-mono text-sm font-semibold", labelClasses[status])}>
        {status}
      </span>
    </div>
  );
}
