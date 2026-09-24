import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchHealth,
  fetchVersion,
  fetchAISummary,
  fetchSystemMetrics,
} from "@/lib/api";

/**
 * Individual hooks (clean, reusable)
 */

export function useHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: fetchHealth,
    refetchInterval: 30_000,
    staleTime: 10_000,
  });
}

export function useVersion() {
  return useQuery({
    queryKey: ["version"],
    queryFn: fetchVersion,
    staleTime: 60_000,
  });
}

export function useAISummary() {
  return useQuery({
    queryKey: ["ai-summary"],
    queryFn: fetchAISummary,
    staleTime: 60_000,
  });
}

export function useSystemMetrics() {
  return useQuery({
    queryKey: ["system"],
    queryFn: fetchSystemMetrics,
    refetchInterval: 30_000,
    staleTime: 10_000,
  });
}

export function useManualHealthCheck() {
  const queryClient = useQueryClient();

  const triggerHealthCheck = async () => {
    await queryClient.invalidateQueries({ queryKey: ["health"] });
    await queryClient.invalidateQueries({ queryKey: ["ai-summary"] });
  };

  return { triggerHealthCheck };
}

/**
 * ✅ Compatibility hook (REQUIRED by existing UI)
 * Do NOT remove — components depend on this
 */
export function usePulseOps() {
  const health = useHealth();
  const version = useVersion();
  const aiSummary = useAISummary();
  const manual = useManualHealthCheck();

  return {
    health,
    version,
    aiSummary,
    ...manual,
  };
}
