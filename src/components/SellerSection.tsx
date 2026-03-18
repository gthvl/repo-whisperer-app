import { ChevronRight, MessageCircle, Star, BadgeCheck } from "lucide-react";

interface SellerSectionProps {
  name: string;
  followers: string;
  products: number;
  rating: number;
  avatar: string;
  responseRate: string;
}

export const SellerSection = ({
  name,
  followers,
  products,
  rating,
  avatar,
  responseRate,
}: SellerSectionProps) => {
  return (
    <div className="tiktok-section-padded">
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            src={avatar}
            alt={name}
            className="w-12 h-12 rounded-full object-cover border-2 border-border"
          />
          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--tiktok-cyan))' }}>
            <BadgeCheck className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-[14px] font-semibold text-foreground truncate">{name}</h3>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] text-muted-foreground">{followers} seguidores</span>
            <span className="text-[11px] text-muted-foreground">·</span>
            <span className="text-[11px] text-muted-foreground">{products} produtos</span>
          </div>
        </div>
        <button className="tiktok-btn-outline px-4 h-8 text-[12px] rounded-full border active:scale-95 transition-transform">
          Seguir
        </button>
      </div>

      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 fill-tiktok-star tiktok-star" />
          <span className="text-[12px] font-medium text-foreground">{rating}</span>
          <span className="text-[11px] text-muted-foreground">Avaliação</span>
        </div>
        <div className="w-px h-3 bg-border" />
        <div className="flex items-center gap-1">
          <MessageCircle className="w-3 h-3 text-muted-foreground" />
          <span className="text-[12px] font-medium text-foreground">{responseRate}</span>
          <span className="text-[11px] text-muted-foreground">Resposta</span>
        </div>
        <div className="flex-1" />
        <button className="flex items-center text-[12px] text-muted-foreground active:opacity-70 transition-opacity">
          Ver loja
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
