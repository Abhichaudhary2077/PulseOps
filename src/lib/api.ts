import { supabase } from "@/integrations/supabase/client";

export interface HealthResponse {
  status: "UP" | "DOWN";
  timestamp: string;
  uptime: number;
  checks: {
    database: "healthy" | "unhealthy";
    memory: "healthy" | "unhealthy";
  };
}

export interface VersionResponse {
  version: string;
  buildTimestamp: string;
  environment: string;
  gitCommit: string;
  deployedAt: string;
}

export interface AISummaryResponse {
  summary: string;
  generatedAt: string;
  model?: string;
  fallback?: boolean;
}

export async function fetchHealth(): Promise<HealthResponse> {
  const { data, error } = await supabase.functions.invoke<HealthResponse>("health");
  
  if (error) {
    throw new Error(error.message || "Failed to fetch health status");
  }
  
  return data!;
}

export async function fetchVersion(): Promise<VersionResponse> {
  const { data, error } = await supabase.functions.invoke<VersionResponse>("version");
  
  if (error) {
    throw new Error(error.message || "Failed to fetch version info");
  }
  
  return data!;
}

export async function fetchAISummary(): Promise<AISummaryResponse> {
  const { data, error } = await supabase.functions.invoke<AISummaryResponse>("ai-summary");
  
  if (error) {
    throw new Error(error.message || "Failed to fetch AI summary");
  }
  
  return data!;
}
