import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const IRONPAY_BASE_URL = "https://api.ironpayapp.com.br/api/public/v1";

// Generate a random valid CPF (Brazilian tax ID)
function generateRandomCpf(): string {
  const rand = (max: number) => Math.floor(Math.random() * max);
  const digits = Array.from({ length: 9 }, () => rand(10));

  // First check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += digits[i] * (10 - i);
  let remainder = (sum * 10) % 11;
  digits.push(remainder === 10 ? 0 : remainder);

  // Second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) sum += digits[i] * (11 - i);
  remainder = (sum * 10) % 11;
  digits.push(remainder === 10 ? 0 : remainder);

  const cpf = digits.join("");
  return `${cpf.slice(0,3)}.${cpf.slice(3,6)}.${cpf.slice(6,9)}-${cpf.slice(9)}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
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

    // Amount should be in centavos (cents)
    const amountInCents = Math.round(amount * 100);

    console.log(`Creating IronPay PIX charge: ${amountInCents} centavos`);

    const ironpayResponse = await fetch(`${IRONPAY_BASE_URL}/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_token: IRONPAY_API_KEY,
        amount: amountInCents,
        payment_method: "pix",
        customer_name: customer_name || "Cliente",
        customer_email: customer_email || undefined,
        customer_cpf: customer_cpf || undefined,
        description: description || "Pagamento via PIX",
      }),
    });

    const responseText = await ironpayResponse.text();
    console.log(`IronPay response status: ${ironpayResponse.status}`);
    console.log(`IronPay response body: ${responseText}`);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error(`IronPay returned non-JSON response [${ironpayResponse.status}]: ${responseText}`);
    }

    if (!ironpayResponse.ok) {
      throw new Error(`IronPay API error [${ironpayResponse.status}]: ${JSON.stringify(data)}`);
    }

    // Try to extract PIX data from response - adapt based on actual response structure
    const pixCode = data.pix_code || data.pix?.qr_code || data.qr_code || data.brcode || data.emv || data.copy_paste || null;
    const pixQrImage = data.pix_qr_image || data.pix?.qr_code_image || data.qr_code_image || data.qr_code_url || null;
    const transactionHash = data.transaction_hash || data.hash || data.id || null;

    return new Response(
      JSON.stringify({
        success: true,
        pix_code: pixCode,
        pix_qr_image: pixQrImage,
        transaction_hash: transactionHash,
        raw_response: data,
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
