import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchHealth, fetchVersion, fetchAISummary } from "@/lib/api";

export function useHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: fetchHealth,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    staleTime: 10000,
  });
}

export function useVersion() {
  return useQuery({
    queryKey: ["version"],
    queryFn: fetchVersion,
    staleTime: 60000, // Version doesn't change often
  });
}

export function useAISummary() {
  return useQuery({
    queryKey: ["ai-summary"],
    queryFn: fetchAISummary,
    staleTime: 60000,
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
