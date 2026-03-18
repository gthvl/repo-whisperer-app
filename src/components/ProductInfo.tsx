import { Star, TrendingUp, ShieldCheck } from "lucide-react";

interface ProductInfoProps {
  title: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviewCount: number;
  soldCount: number;
  badges: string[];
}

export const ProductInfo = ({
  title,
  rating,
  reviewCount,
  soldCount,
  badges,
}: ProductInfoProps) => {
  return (
    <div className="tiktok-section-padded">
      <h1 className="text-[15px] font-medium text-foreground leading-[1.4] mb-2">
        {title}
      </h1>

      <div className="flex items-center gap-1 mb-2.5">
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-3 h-3 ${
                i < Math.floor(rating)
                  ? "fill-tiktok-star tiktok-star"
                  : "text-muted"
              }`}
            />
          ))}
        </div>
        <span className="text-[12px] font-medium text-foreground ml-0.5">{rating}</span>
        <span className="text-[12px] text-muted-foreground mx-1">·</span>
        <span className="text-[12px] text-muted-foreground">
          {reviewCount.toLocaleString("pt-BR")} avaliações
        </span>
        <span className="text-[12px] text-muted-foreground mx-1">·</span>
        <span className="text-[12px] text-muted-foreground">
          {(soldCount / 1000).toFixed(1).replace(".", ",")}mil vendidos
        </span>
      </div>

      <div className="flex items-center gap-3 pt-2 border-t border-border">
        <div className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" style={{ color: 'hsl(var(--tiktok-green))' }} />
          <span className="text-[10px] text-muted-foreground">Compra protegida</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5" style={{ color: 'hsl(var(--tiktok-orange))' }} />
          <span className="text-[10px] text-muted-foreground">Top vendas</span>
        </div>
        {badges.map((badge) => (
          <span key={badge} className="tiktok-tag text-[10px]">{badge}</span>
        ))}
      </div>
    </div>
  );
};
