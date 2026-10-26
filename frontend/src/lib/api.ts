const API_BASE_URL = "/api";
const REQUEST_TIMEOUT_MS = 10_000;

export interface HealthResponse {
  status: "UP" | "DEGRADED";
  uptime: number;
  timestamp: string;
  checks: {
    api: string;
    database: string;
    memory: "healthy" | "warning" | "unhealthy" | "unknown";
  };
}

export interface VersionResponse {
  version: string;
  environment: string;
  gitCommit: string;
  buildTimestamp: string;
  deployedAt: string | null;
}

export interface SummaryResponse {
  summary: string;
  status: "UP" | "DEGRADED";
  source: "rules";
  generatedAt: string;
}

export interface SystemMetricsResponse {
  hostname: string;
  platform: string;
  architecture: string;
  cpu: {
    cores: number;
    usagePercent: number;
  };
  memory: {
    totalBytes: number;
    usedBytes: number;
    availableBytes: number;
    usedPercent: number;
  };
  loadAverage: {
    oneMinute: number;
    fiveMinutes: number;
    fifteenMinutes: number;
  };
  vmUptimeSeconds: number;
}

async function getJson<T>(endpoint: string): Promise<T> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS,
  );

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      let message = `Request failed with HTTP ${response.status}`;
      try {
        const body = await response.json();
        if (typeof body.message === "string" && body.message.length > 0) {
          message = body.message;
        }
      } catch {
        // Keep the HTTP status message when the server does not return JSON.
      }
      throw new Error(message);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("The API request timed out after 10 seconds.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export function fetchHealth() {
  return getJson<HealthResponse>("/health");
}

export function fetchVersion() {
  return getJson<VersionResponse>("/version");
}

export function fetchAISummary() {
  return getJson<SummaryResponse>("/ai-summary");
}

export function fetchSystemMetrics() {
  return getJson<SystemMetricsResponse>("/system");
}
