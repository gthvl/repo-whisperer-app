import { ChevronRight, Ticket } from "lucide-react";

interface CouponsSectionProps {
  coupons: { label: string; discount: string }[];
}

export const CouponsSection = ({ coupons }: CouponsSectionProps) => {
  return (
    <div className="tiktok-section-padded">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Ticket className="w-4 h-4 text-tiktok-red" />
          <span className="text-[13px] font-medium text-foreground">Cupons</span>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex gap-2 mt-2 overflow-x-auto pb-1 scrollbar-none">
        {coupons.map((coupon, i) => (
          <div
            key={i}
            className="flex-shrink-0 border border-tiktok-red/20 bg-tiktok-red-light rounded-md px-3 py-1.5 text-center"
          >
            <p className="text-[11px] font-bold tiktok-price">{coupon.discount}</p>
            <p className="text-[10px] text-muted-foreground">{coupon.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
