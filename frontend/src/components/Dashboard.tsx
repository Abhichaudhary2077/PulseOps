import { HealthCard } from "./HealthCard";
import { VersionCard } from "./VersionCard";
import { AISummaryCard } from "./AISummaryCard";
import { SystemMetricsCard } from "./SystemMetricsCard";

export function Dashboard() {
  return (
    <main className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h2 className="font-mono text-lg font-medium text-foreground">
          System Overview
        </h2>
        <p className="text-sm text-muted-foreground">
          Real-time visibility into application health and deployment status
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <HealthCard />
        <VersionCard />
        <AISummaryCard />
        <SystemMetricsCard />
      </div>

      <footer className="mt-12 border-t border-border pt-6">
        <div className="flex flex-col items-center justify-between gap-4 text-xs text-muted-foreground sm:flex-row">
          <p className="font-mono">
            Auto-refresh: <span className="text-primary">30s</span> | Last updated:{" "}
            {new Date().toLocaleTimeString()}
          </p>
          <p className="font-mono">
            Built for DevOps visibility
          </p>
        </div>
      </footer>
    </main>
  );
}