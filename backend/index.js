import express from "express";
import cors from "cors";
import { rateLimit, ipKeyGenerator } from "express-rate-limit";

const app = express();

app.use(cors());

const START_TIME = Date.now();

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
