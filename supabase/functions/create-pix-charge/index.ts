import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const IRONPAY_BASE_URL = "https://api.ironpayapp.com.br/api/public/v1";
const OFFER_HASH = "ofpwip2lg9";

// Generate a random valid CPF (Brazilian tax ID)
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const IRONPAY_API_KEY = Deno.env.get("IRONPAY_API_KEY");
    if (!IRONPAY_API_KEY) {
      throw new Error("IRONPAY_API_KEY is not configured");
    }

    const body = await req.json();
    const { amount, customer_name, customer_email, customer_cpf, description } = body;

    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: "Valor inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // IronPay expects amount in centavos
    const amountInCents = Math.round(amount * 100);
    const cpf = customer_cpf ? customer_cpf.replace(/\D/g, "") : generateRandomCpf();
    const email = customer_email || `cliente${Date.now()}@checkout.com`;

    const requestBody = {
      api_token: IRONPAY_API_KEY,
      offer_hash: OFFER_HASH,
      payment_method: "pix",
      amount: amountInCents,
      cart: [
        {
          offer_hash: OFFER_HASH,
          quantity: 1,
          price: amountInCents,
          title: description || "Pagamento",
          product_hash: OFFER_HASH,
          operation_type: "1",
        },
      ],
      customer: {
        name: customer_name || "Cliente",
        email: email,
        cpf: cpf,
      },
    };

    console.log(`Creating IronPay PIX: ${amountInCents} centavos for ${customer_name}`);

    const ironpayResponse = await fetch(`${IRONPAY_BASE_URL}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    const responseText = await ironpayResponse.text();
    console.log(`IronPay status: ${ironpayResponse.status}`);

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

    // Extract PIX data from response
    const pixCode = data.pix?.pix_qr_code || null;
    const pixQrImage = data.pix?.qr_code_base64 || null;
    const transactionHash = data.hash || null;

    console.log(`PIX generated: hash=${transactionHash}, has_code=${!!pixCode}`);

    return new Response(
      JSON.stringify({
        success: true,
        pix_code: pixCode,
        pix_qr_image: pixQrImage,
        transaction_hash: transactionHash,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Error creating PIX charge:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
