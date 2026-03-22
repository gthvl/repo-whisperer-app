import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const IRONPAY_BASE_URL = "https://api.ironpayapp.com.br/api/public/v1";
const OFFER_HASH = "ofpwip2lg9";

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function generateRandomCpf(): string {
  const rand = (max: number) => Math.floor(Math.random() * max);
  const digits = Array.from({ length: 9 }, () => rand(10));

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += digits[i] * (10 - i);
  let remainder = (sum * 10) % 11;
  digits.push(remainder === 10 ? 0 : remainder);

  sum = 0;
  for (let i = 0; i < 10; i++) sum += digits[i] * (11 - i);
  remainder = (sum * 10) % 11;
  digits.push(remainder === 10 ? 0 : remainder);

  return digits.join("");
}

function buildPixSuccessResponse(pixCode: string | null, transactionHash: string | null, pixQrImage: string | null = null) {
  return jsonResponse({
    success: true,
    pix_code: pixCode,
    pix_qr_image: pixQrImage,
    transaction_hash: transactionHash,
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  let leadId: string | null = null;
  let sessionId: string | null = null;
  let adminClient: ReturnType<typeof createClient> | null = null;

  try {
    const IRONPAY_API_KEY = Deno.env.get("IRONPAY_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!IRONPAY_API_KEY) {
      throw new Error("IRONPAY_API_KEY is not configured");
    }

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Supabase admin credentials are not configured");
    }

    adminClient = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();
    const {
      amount,
      quantity,
      customer_name,
      customer_email,
      customer_phone,
      customer_cpf,
      description,
      lead_id,
      session_id,
    } = body;

    leadId = typeof lead_id === "string" ? lead_id : null;
    sessionId = typeof session_id === "string" ? session_id : null;

    if (!amount || amount <= 0) {
      return jsonResponse({ success: false, error: "Valor inválido" }, 400);
    }

    if (leadId && sessionId) {
      const { data: existingLead, error: existingLeadError } = await adminClient
        .from("checkout_leads")
        .select("id, pix_status, pix_code, pix_transaction_hash")
        .eq("id", leadId)
        .eq("session_id", sessionId)
        .maybeSingle();

      if (existingLeadError) {
        console.error("Error reading current lead:", existingLeadError);
      }

      if (existingLead?.pix_code || existingLead?.pix_transaction_hash) {
        console.log(`Returning existing PIX for lead=${leadId}`);
        return buildPixSuccessResponse(existingLead.pix_code, existingLead.pix_transaction_hash);
      }

      const { data: lockedLead, error: lockError } = await adminClient
        .from("checkout_leads")
        .update({ pix_status: "processing" })
        .eq("id", leadId)
        .eq("session_id", sessionId)
        .or("pix_status.is.null,pix_status.eq.abandoned,pix_status.eq.error,pix_status.eq.failed,pix_status.eq.pending")
        .select("id")
        .maybeSingle();

      if (lockError) {
        console.error("Error locking PIX generation:", lockError);
      }

      if (!lockedLead) {
        const { data: latestLead } = await adminClient
          .from("checkout_leads")
          .select("pix_code, pix_transaction_hash")
          .eq("id", leadId)
          .eq("session_id", sessionId)
          .maybeSingle();

        if (latestLead?.pix_code || latestLead?.pix_transaction_hash) {
          console.log(`Returning deduplicated PIX for lead=${leadId}`);
          return buildPixSuccessResponse(latestLead.pix_code, latestLead.pix_transaction_hash);
        }

        return jsonResponse({
          success: false,
          error: "Já existe uma tentativa de PIX em processamento para este pedido.",
        });
      }
    }

    const qty = quantity && quantity > 0 ? quantity : 1;
    const amountInCents = Math.round(amount * 100);
    const cpf = customer_cpf ? customer_cpf.replace(/\D/g, "") : generateRandomCpf();
    const phone = customer_phone ? customer_phone.replace(/\D/g, "") : undefined;

    let email = customer_email;
    if (!email) {
      const firstName = (customer_name || "cliente")
        .split(" ")[0]
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z]/g, "") || "cliente";

      let counter = 12;
      try {
        const { count } = await adminClient
          .from("checkout_leads")
          .select("id", { count: "exact", head: true });
        if (count !== null) counter = 12 + count;
      } catch (e) {
        console.warn("Could not query lead count for email:", e);
        counter = 12 + Math.floor(Math.random() * 100);
      }

      const counterStr = String(counter).padStart(3, "0");
      email = `${firstName}${counterStr}ck@gmail.com`;
    }

    const requestBody = {
      api_token: IRONPAY_API_KEY,
      offer_hash: OFFER_HASH,
      payment_method: "pix",
      amount: amountInCents,
      cart: [
        {
          offer_hash: OFFER_HASH,
          quantity: qty,
          price: amountInCents,
          title: description || "Pagamento",
          product_hash: OFFER_HASH,
          operation_type: "1",
        },
      ],
      customer: {
        name: customer_name || "Cliente",
        email,
        cpf,
        ...(phone ? { phone } : {}),
      },
    };

    console.log("IronPay request body:", JSON.stringify(requestBody));

    const ironpayResponse = await fetch(`${IRONPAY_BASE_URL}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    const responseText = await ironpayResponse.text();
    console.log(`IronPay status: ${ironpayResponse.status}, response: ${responseText.slice(0, 500)}`);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error(`IronPay non-JSON [${ironpayResponse.status}]: ${responseText.slice(0, 200)}`);
    }

    if (!ironpayResponse.ok) {
      console.error(`IronPay error: ${JSON.stringify(data)}`);
      throw new Error(`IronPay API error [${ironpayResponse.status}]: ${JSON.stringify(data)}`);
    }

    const pixCode = data.pix?.pix_qr_code || null;
    const pixQrImage = data.pix?.qr_code_base64 || null;
    const transactionHash = data.hash || null;

    if (adminClient && leadId && sessionId) {
      const { error: updateLeadError } = await adminClient
        .from("checkout_leads")
        .update({
          pix_status: "generated",
          pix_code: pixCode,
          pix_transaction_hash: transactionHash,
        })
        .eq("id", leadId)
        .eq("session_id", sessionId);

      if (updateLeadError) {
        console.error("Error saving generated PIX to lead:", updateLeadError);
      }
    }

    console.log(`PIX generated: hash=${transactionHash}, has_code=${!!pixCode}`);
    return buildPixSuccessResponse(pixCode, transactionHash, pixQrImage);
  } catch (error: unknown) {
    console.error("Error creating PIX charge:", error);

    if (adminClient && leadId && sessionId) {
      try {
        await adminClient
          .from("checkout_leads")
          .update({ pix_status: "error" })
          .eq("id", leadId)
          .eq("session_id", sessionId)
          .eq("pix_status", "processing");
      } catch (lockResetError) {
        console.error("Failed to reset PIX lock:", lockResetError);
      }
    }

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return jsonResponse({ success: false, error: errorMessage }, 500);
  }
});