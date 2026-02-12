import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-api-key",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = req.headers.get("x-api-key");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing x-api-key header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Look up user by API key
    const { data: keyRow, error: keyErr } = await supabaseAdmin
      .from("user_api_keys")
      .select("user_id")
      .eq("api_key", apiKey)
      .maybeSingle();

    if (keyErr || !keyRow) {
      return new Response(JSON.stringify({ error: "Invalid API key" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = keyRow.user_id;
    const body = await req.json();

    // Accept single trade or array of trades
    const trades: any[] = Array.isArray(body) ? body : [body];

    if (trades.length === 0) {
      return new Response(JSON.stringify({ error: "No trades provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rows = trades.map((t: any) => ({
      user_id: userId,
      symbol: t.symbol,
      market: t.market || "forex",
      trade_type: t.type === 1 ? "short" : "long", // MT5: 0=buy, 1=sell
      entry_price: t.entry_price,
      exit_price: t.exit_price ?? null,
      size: t.volume ?? t.size ?? 0,
      pnl: t.profit ?? t.pnl ?? null,
      entry_date: t.open_time ?? t.entry_date,
      exit_date: t.close_time ?? t.exit_date ?? null,
      status: t.exit_price != null ? "closed" : "open",
      strategy: t.comment ?? t.strategy ?? null,
      notes: t.magic != null ? `Magic: ${t.magic}` : null,
    }));

    const { data, error } = await supabaseAdmin
      .from("trades")
      .upsert(rows, { onConflict: "user_id,symbol,entry_date,entry_price" })
      .select("id");

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ success: true, count: data?.length ?? 0 }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
