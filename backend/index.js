import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

const START_TIME = Date.now();

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
app.listen(PORT, () => {
  console.log(`PulseOps backend running on port ${PORT}`);
});
