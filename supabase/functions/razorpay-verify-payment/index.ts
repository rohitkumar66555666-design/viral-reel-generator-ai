import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";
import { encode as hexEncode } from "https://deno.land/std@0.168.0/encoding/hex.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!RAZORPAY_KEY_SECRET) throw new Error("Razorpay secret not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) throw new Error("Unauthorized");

    const user = { id: claimsData.claims.sub as string };

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new Error("Missing payment verification data");
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(RAZORPAY_KEY_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
    const generatedSignature = new TextDecoder().decode(hexEncode(new Uint8Array(signature)));

    if (generatedSignature !== razorpay_signature) {
      throw new Error("Payment verification failed - invalid signature");
    }

    // Update payment record
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: payment } = await serviceClient
      .from("payments")
      .update({
        razorpay_payment_id,
        razorpay_signature,
        status: "paid",
        updated_at: new Date().toISOString(),
      })
      .eq("razorpay_order_id", razorpay_order_id)
      .select()
      .single();

    if (!payment) throw new Error("Payment record not found");

    // Update user subscription if it's a plan purchase
    if (payment.plan_name && payment.plan_name !== "credits") {
      const planLimits: Record<string, number> = {
        starter: 15,
        pro: 50,
        unlimited: 999,
      };

      const dailyLimit = planLimits[payment.plan_name] || 5;
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      // Upsert subscription
      const { data: existing } = await serviceClient
        .from("user_subscriptions")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (existing) {
        await serviceClient
          .from("user_subscriptions")
          .update({
            plan_name: payment.plan_name,
            daily_limit: dailyLimit,
            status: "active",
            starts_at: new Date().toISOString(),
            expires_at: expiresAt.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);
      } else {
        await serviceClient.from("user_subscriptions").insert({
          user_id: user.id,
          plan_name: payment.plan_name,
          daily_limit: dailyLimit,
          status: "active",
          expires_at: expiresAt.toISOString(),
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true, payment_id: razorpay_payment_id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("razorpay-verify error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
