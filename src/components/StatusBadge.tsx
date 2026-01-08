import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "UP" | "DOWN" | "UNKNOWN";
  size?: "sm" | "md" | "lg";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const sizeClasses = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-4 w-4",
  };

  const statusClasses = {
    UP: "bg-status-healthy status-pulse",
    DOWN: "bg-status-unhealthy status-pulse-unhealthy",
    UNKNOWN: "bg-status-unknown",
  };

  const labelClasses = {
    UP: "text-status-healthy",
    DOWN: "text-status-unhealthy",
    UNKNOWN: "text-status-unknown",
  };

  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "rounded-full",
          sizeClasses[size],
          statusClasses[status]
        )}
      />
      <span className={cn("font-mono text-sm font-semibold", labelClasses[status])}>
        {status}
      </span>
    </div>
  );
}
