import assert from "node:assert/strict";
import { after, before, test } from "node:test";

process.env.APP_VERSION = "test-version";
process.env.GIT_COMMIT = "0123456789abcdef0123456789abcdef01234567";
process.env.BUILD_TIMESTAMP = "2026-10-26T00:00:00.000Z";
process.env.NODE_ENV = "test";

const { app } = await import("../app.js");

let server;
let baseUrl;

before(async () => {
  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (!server) return;
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

async function getJson(path) {
  const response = await fetch(`${baseUrl}${path}`);
  return { response, body: await response.json() };
}

test("health endpoint reports configured and unconfigured checks honestly", async () => {
  const { response, body } = await getJson("/health");
  assert.equal(response.status, 200);
  assert.ok(["UP", "DEGRADED"].includes(body.status));
  assert.equal(body.checks.api, "healthy");
  assert.equal(body.checks.database, "not_configured");
  assert.ok(["healthy", "warning", "unhealthy", "unknown"].includes(body.checks.memory));
  assert.ok(Number.isFinite(body.uptime));
  assert.ok(Number.isFinite(Date.parse(body.timestamp)));
});

test("version endpoint exposes build metadata", async () => {
  const { response, body } = await getJson("/version");
  assert.equal(response.status, 200);
  assert.equal(body.version, "test-version");
  assert.equal(body.environment, "test");
  assert.equal(body.gitCommit, "0123456789abcdef0123456789abcdef01234567");
  assert.equal(body.buildTimestamp, "2026-10-26T00:00:00.000Z");
});

test("system endpoint returns numeric CPU, memory, load and uptime metrics", async () => {
  const { response, body } = await getJson("/system");
  assert.equal(response.status, 200);
  assert.ok(Number.isInteger(body.cpu.cores));
  assert.ok(Number.isFinite(body.cpu.usagePercent));
  assert.ok(Number.isFinite(body.memory.totalBytes));
  assert.ok(Number.isFinite(body.memory.usedPercent));
  assert.ok(Number.isFinite(body.loadAverage.oneMinute));
  assert.ok(Number.isFinite(body.vmUptimeSeconds));
});

test("summary clearly identifies itself as rules-based", async () => {
  const { response, body } = await getJson("/ai-summary");
  assert.equal(response.status, 200);
  assert.equal(body.source, "rules");
  assert.ok(["UP", "DEGRADED"].includes(body.status));
  assert.match(body.summary, /API is responding/i);
  assert.ok(Number.isFinite(Date.parse(body.generatedAt)));
});

test("rate limiter returns HTTP 429 after the configured limit", async () => {
  const statuses = [];
  for (let i = 0; i < 65; i += 1) {
    const response = await fetch(`${baseUrl}/health`);
    statuses.push(response.status);
    await response.arrayBuffer();
  }

  assert.ok(statuses.includes(429), "expected at least one rate-limited response");
});
