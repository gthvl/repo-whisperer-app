import { useState, useEffect } from "react";
import { Truck, ChevronRight, Shield, Check, Clock, MapPin } from "lucide-react";

interface ShippingSectionProps {
  method: string;
  estimate: string;
  cost: string;
}

export const ShippingSection = ({ method, estimate, cost }: ShippingSectionProps) => {
  const [location, setLocation] = useState("todo o Brasil");

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        if (data.city && data.region) {
          setLocation(`${data.city}, ${data.region}`);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="tiktok-section-padded space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--tiktok-green) / 0.1)' }}>
            <Truck className="w-4 h-4" style={{ color: 'hsl(var(--tiktok-green))' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-medium text-foreground">Envio {method}</span>
              {cost === "Grátis" && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: 'hsl(var(--tiktok-green) / 0.1)', color: 'hsl(var(--tiktok-green))' }}>
                  GRÁTIS
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-muted-foreground" />
              <p className="text-[11px] text-muted-foreground">
                Frete grátis para: <strong className="text-foreground">{location}</strong>
              </p>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <p className="text-[11px] text-muted-foreground">
                Estimativa: {estimate}
              </p>
            </div>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>

      <div className="tiktok-divider !mx-0" />

      <div className="bg-secondary/40 rounded-xl p-3.5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" style={{ color: 'hsl(var(--tiktok-green))' }} />
            <span className="text-[13px] font-semibold text-foreground">Proteção do cliente</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
          {[
            "Devolução gratuita",
            "Reembolso automático por danos",
            "Pagamento seguro",
            "Cupom por atraso na coleta",
          ].map((item) => (
            <div key={item} className="flex items-start gap-1.5">
              <Check className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: 'hsl(var(--tiktok-green))' }} />
              <span className="text-[11px] text-muted-foreground leading-tight">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
