import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VersionResponse {
  version: string;
  buildTimestamp: string;
  environment: string;
  gitCommit: string;
  deployedAt: string;
}

// These would typically come from environment variables in a real deployment
const BUILD_TIMESTAMP = "2026-01-08T14:00:00Z";
const VERSION = "1.0.0";
const GIT_COMMIT = "a1b2c3d";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const versionResponse: VersionResponse = {
      version: Deno.env.get("APP_VERSION") || VERSION,
      buildTimestamp: Deno.env.get("BUILD_TIMESTAMP") || BUILD_TIMESTAMP,
      environment: Deno.env.get("ENVIRONMENT") || "production",
      gitCommit: Deno.env.get("GIT_COMMIT") || GIT_COMMIT,
      deployedAt: new Date().toISOString(),
    };

    return new Response(JSON.stringify(versionResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Version endpoint failed:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return new Response(
      JSON.stringify({
        error: "Failed to retrieve version information",
        message: errorMessage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
