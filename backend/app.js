import express from "express";
import { rateLimit, ipKeyGenerator } from "express-rate-limit";
import os from "node:os";
import fs from "node:fs";

const app = express();
const START_TIME = Date.now();

function getMemoryMetrics() {
  const memInfo = fs.readFileSync("/proc/meminfo", "utf8");

  const getKb = (name) => {
    const match = memInfo.match(new RegExp(`^${name}:\\s+(\\d+)\\s+kB$`, "m"));
    return match ? Number(match[1]) : 0;
  };

  const totalBytes = getKb("MemTotal") * 1024;
  if (totalBytes <= 0) {
    throw new Error("Unable to read total system memory from /proc/meminfo");
  }

  const availableBytes = Math.min(
    totalBytes,
    Math.max(0, getKb("MemAvailable") * 1024),
  );
  const usedBytes = Math.max(0, totalBytes - availableBytes);

  return {
    totalBytes,
    usedBytes,
    availableBytes,
    usedPercent: Number(((usedBytes / totalBytes) * 100).toFixed(1)),
  };
}

function getMemoryStatus(memory) {
  if (!Number.isFinite(memory?.usedPercent)) return "unknown";
  if (memory.usedPercent >= 95) return "unhealthy";
  if (memory.usedPercent >= 85) return "warning";
  return "healthy";
}

function readCpuTimes() {
  const cpuLine = fs
    .readFileSync("/proc/stat", "utf8")
    .split("\n")
    .find((line) => line.startsWith("cpu "));

  if (!cpuLine) {
    return { idle: 0, total: 0 };
  }

  const values = cpuLine.trim().split(/\s+/).slice(1).map(Number);
  const [
    user = 0,
    nice = 0,
    system = 0,
    idle = 0,
    iowait = 0,
    irq = 0,
    softirq = 0,
    steal = 0,
  ] = values;

  return {
    idle: idle + iowait,
    total: user + nice + system + idle + iowait + irq + softirq + steal,
  };
}

let previousCpu = readCpuTimes();

function getCpuUsage() {
  const currentCpu = readCpuTimes();
  const totalDelta = currentCpu.total - previousCpu.total;
  const idleDelta = currentCpu.idle - previousCpu.idle;
  previousCpu = currentCpu;

  if (totalDelta <= 0) return 0;
  return Number((((totalDelta - idleDelta) / totalDelta) * 100).toFixed(1));
}

// NGINX overwrites X-Real-IP with the connecting client's address before proxying.
const getClientIp = (req) => ipKeyGenerator(req.get("X-Real-IP") || req.ip);

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  keyGenerator: getClientIp,
  handler: (_req, res) => {
    res.status(429).json({
      status: "RATE_LIMITED",
      message: "Too many API requests. Please try again later.",
      retryAfterSeconds: 60,
    });
  },
});

app.use(apiLimiter);

app.get("/health", (_req, res) => {
  let memoryStatus = "unknown";

  try {
    memoryStatus = getMemoryStatus(getMemoryMetrics());
  } catch (error) {
    console.error("Health check could not read memory metrics:", error);
  }

  res.json({
    status: memoryStatus === "healthy" ? "UP" : "DEGRADED",
    uptime: Math.floor((Date.now() - START_TIME) / 1000),
    timestamp: new Date().toISOString(),
    checks: {
      api: "healthy",
      database: "not_configured",
      memory: memoryStatus,
    },
  });
});

app.get("/version", (_req, res) => {
  res.json({
    version: process.env.APP_VERSION || "dev",
    environment: process.env.NODE_ENV || "production",
    gitCommit: process.env.GIT_COMMIT || "unknown",
    buildTimestamp: process.env.BUILD_TIMESTAMP || "unknown",
    deployedAt: process.env.DEPLOYED_AT || null,
  });
});

app.get("/ai-summary", (_req, res) => {
  let memoryStatus = "unknown";

  try {
    memoryStatus = getMemoryStatus(getMemoryMetrics());
  } catch (error) {
    console.error("Summary could not read memory metrics:", error);
  }

  let summary = "The API is responding, but memory status could not be determined.";
  if (memoryStatus === "healthy") {
    summary = "API is responding. Memory usage is within the healthy range. No database is configured.";
  } else if (memoryStatus === "warning") {
    summary = "API is responding, but memory usage is elevated. Monitor VM resources.";
  } else if (memoryStatus === "unhealthy") {
    summary = "API is responding, but memory pressure is high. Investigate VM processes and capacity.";
  }

  res.json({
    summary,
    status: memoryStatus === "healthy" ? "UP" : "DEGRADED",
    source: "rules",
    generatedAt: new Date().toISOString(),
  });
});

app.get("/system", (_req, res) => {
  const memory = getMemoryMetrics();
  const cpuUsagePercent = getCpuUsage();
  const loadAverage = os.loadavg();

  res.json({
    hostname: os.hostname(),
    platform: `${os.type()} ${os.release()}`,
    architecture: os.arch(),
    cpu: {
      cores: os.cpus().length,
      usagePercent: cpuUsagePercent,
    },
    memory,
    loadAverage: {
      oneMinute: Number(loadAverage[0].toFixed(2)),
      fiveMinutes: Number(loadAverage[1].toFixed(2)),
      fifteenMinutes: Number(loadAverage[2].toFixed(2)),
    },
    vmUptimeSeconds: Math.floor(
      Number(fs.readFileSync("/proc/uptime", "utf8").split(" ")[0]),
    ),
  });
});

export { app };
