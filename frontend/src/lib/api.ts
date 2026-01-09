// src/lib/api.ts

// Base URL for backend API
// In production: http://<EC2_PUBLIC_IP>:3000
// In local dev: http://localhost:3000
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not defined");
}

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
