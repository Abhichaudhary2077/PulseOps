import { Activity, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useManualHealthCheck } from "@/hooks/usePulseOps";
import { useState } from "react";

export function Header() {
  const { triggerHealthCheck } = useManualHealthCheck();
  const [isChecking, setIsChecking] = useState(false);

  const handleHealthCheck = async () => {
    setIsChecking(true);
    await triggerHealthCheck();
    setTimeout(() => setIsChecking(false), 1000);
  };

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Activity className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-mono text-xl font-bold tracking-tight text-foreground">
              PulseOps
            </h1>
            <p className="text-xs text-muted-foreground">
              System Health Dashboard
            </p>
          </div>
        </div>

        <Button
          onClick={handleHealthCheck}
          disabled={isChecking}
          variant="outline"
          className="gap-2 font-mono text-sm"
        >
          <RefreshCw className={`h-4 w-4 ${isChecking ? "animate-spin-slow" : ""}`} />
          {isChecking ? "Checking..." : "Run Health Check"}
        </Button>
      </div>
    </header>
  );
}
