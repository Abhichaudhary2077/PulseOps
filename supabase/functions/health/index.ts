import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface HealthResponse {
  status: "UP" | "DOWN";
  timestamp: string;
  uptime: number;
  checks: {
    database: "healthy" | "unhealthy";
    memory: "healthy" | "unhealthy";
  };
}

// Simulated start time for uptime calculation
const startTime = Date.now();

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const uptimeMs = Date.now() - startTime;
    const uptimeSeconds = Math.floor(uptimeMs / 1000);

    const healthResponse: HealthResponse = {
      status: "UP",
      timestamp: new Date().toISOString(),
      uptime: uptimeSeconds,
      checks: {
        database: "healthy",
        memory: "healthy",
      },
    };

    return new Response(JSON.stringify(healthResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Health check failed:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return new Response(
      JSON.stringify({
        status: "DOWN",
        timestamp: new Date().toISOString(),
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 503,
      }
    );
  }
});
