// src/lib/api.ts

// Instead of crashing if the variable is missing, we use "/api" as a backup.
// Your AWS Load Balancer is already set up to catch anything starting with "/api"!
const API_BASE_URL = "/api"; 

async function handleResponse(res: Response) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export async function fetchHealth() {
  const res = await fetch(`${API_BASE_URL}/health`);
  return handleResponse(res);
}

export async function fetchVersion() {
  const res = await fetch(`${API_BASE_URL}/version`);
  return handleResponse(res);
}

export async function fetchAISummary() {
  const res = await fetch(`${API_BASE_URL}/ai-summary`);
  return handleResponse(res);
}

export async function fetchSystemMetrics() {
  const res = await fetch(`${API_BASE_URL}/system`);
  return handleResponse(res);
}
