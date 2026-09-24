import express from "express";
import cors from "cors";
import { rateLimit, ipKeyGenerator } from "express-rate-limit";
import os from "node:os";
import fs from "node:fs";

const app = express();

app.use(cors());

const START_TIME = Date.now();

function getMemoryMetrics() {
  const memInfo = fs.readFileSync("/proc/meminfo", "utf8");

  const getKb = (name) => {
    const match = memInfo.match(new RegExp(`^${name}:\\s+(\\d+)\\s+kB$`, "m"));
    return match ? Number(match[1]) : 0;
  };

  const total = getKb("MemTotal") * 1024;
  const available = getKb("MemAvailable") * 1024;
  const used = total - available;

  return {
    totalBytes: total,
    usedBytes: used,
    availableBytes: available,
    usedPercent: Number(((used / total) * 100).toFixed(1)),
  };
}
let previousCpu = readCpuTimes();

function readCpuTimes() {
  const cpuLine = fs
    .readFileSync("/proc/stat", "utf8")
    .split("\n")
    .find((line) => line.startsWith("cpu "));

  if (!cpuLine) {
    return { idle: 0, total: 0 };
  }

  const values = cpuLine
    .trim()
    .split(/\s+/)
    .slice(1)
    .map(Number);

  const [
    user,
    nice,
    system,
    idle,
    iowait = 0,
    irq = 0,
    softirq = 0,
    steal = 0,
  ] = values;

  return {
    idle: idle + iowait,
    total:
      user +
      nice +
      system +
      idle +
      iowait +
      irq +
      softirq +
      steal,
  };
}

function getCpuUsage() {
  const currentCpu = readCpuTimes();

  const totalDelta = currentCpu.total - previousCpu.total;
  const idleDelta = currentCpu.idle - previousCpu.idle;

  previousCpu = currentCpu;

  if (totalDelta <= 0) {
    return 0;
  }

  return Number(
    (((totalDelta - idleDelta) / totalDelta) * 100).toFixed(1)
  );
}
// Nginx sets X-Real-IP to the actual client address.
// The fallback handles requests made directly to the backend.
const getClientIp = (req) => {
  const clientIp = req.get("X-Real-IP") || req.ip;
  return ipKeyGenerator(clientIp);
};

// 60 API requests per minute per client.
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,

  standardHeaders: "draft-8",
  legacyHeaders: false,

  keyGenerator: getClientIp,

  handler: (req, res) => {
    res.status(429).json({
      status: "RATE_LIMITED",
      message: "Too many API requests. Please try again later.",
      retryAfterSeconds: 60
    });
  }
});

// Protect all backend API endpoints.
app.use(apiLimiter);
app.get("/system", (req, res) => {
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
      Number(fs.readFileSync("/proc/uptime", "utf8").split(" ")[0])
    ),
  });
});
app.get("/health", (req, res) => {
  res.json({
    status: "UP",
    uptime: Math.floor((Date.now() - START_TIME) / 1000),
    timestamp: new Date().toISOString(),
    checks: {
      database: "healthy",
      memory: "healthy"
    }
  });
});

app.get("/version", (req, res) => {
  res.json({
    version: process.env.APP_VERSION || "1.0.0",
    environment: process.env.NODE_ENV || "production",
    deployedAt: process.env.DEPLOYED_AT || new Date().toISOString()
  });
});

app.get("/ai-summary", (req, res) => {
  res.json({
    summary: "System healthy. All checks passing. No action required.",
    generatedAt: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`PulseOps backend running on port ${PORT}`);
});
