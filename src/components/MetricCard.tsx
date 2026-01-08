import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
  isLoading?: boolean;
  error?: string | null;
}

export function MetricCard({
  title,
  icon: Icon,
  children,
  className,
  isLoading,
  error,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-6 transition-all duration-200",
        "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
        "animate-fade-in",
        className
      )}
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <h3 className="font-mono text-sm font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </h3>
      </div>
      
      {isLoading ? (
        <div className="space-y-2">
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
        </div>
      ) : error ? (
        <div className="rounded-md bg-destructive/10 p-3">
          <p className="font-mono text-sm text-destructive">{error}</p>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
