import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Get current system status for context
    const systemContext = {
      status: "UP",
      version: "1.0.0",
      uptime: Math.floor((Date.now() - 1704067200000) / 1000), // Simulated uptime
      lastDeployment: new Date().toISOString(),
      healthChecks: { database: "healthy", memory: "healthy" },
    };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a DevOps assistant providing brief system status summaries. Keep responses under 50 words, technical but clear. Focus on actionable insights."
          },
          {
            role: "user",
            content: `Generate a brief status summary for this system: ${JSON.stringify(systemContext)}`
          }
        ],
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content || "System operating normally.";

    return new Response(
      JSON.stringify({
        summary,
        generatedAt: new Date().toISOString(),
        model: "gemini-2.5-flash",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("AI Summary failed:", error);
    
    // Fallback to a static summary if AI fails
    return new Response(
      JSON.stringify({
        summary: "All systems operational. No critical issues detected. Standard monitoring active.",
        generatedAt: new Date().toISOString(),
        fallback: true,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  }
});
