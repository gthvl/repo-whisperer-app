import { Truck } from "lucide-react";
import { useGeoLocation } from "@/hooks/useGeoLocation";

export const FreeShippingBanner = () => {
  const { locationLabel } = useGeoLocation();

  return (
    <div
      className="w-full py-2 px-4 flex items-center justify-center gap-2 text-primary-foreground text-[12px] font-medium"
      style={{ background: "linear-gradient(135deg, hsl(var(--tiktok-green)), hsl(var(--tiktok-cyan)))" }}
    >
      <Truck className="w-3.5 h-3.5 flex-shrink-0" />
      <span>Frete grátis para: <strong>{locationLabel}</strong></span>
    </div>
  );
};
