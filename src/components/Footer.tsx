import { ShoppingCart, Store, MessageCircle } from "lucide-react";

interface FooterProps {
  onAddToCart: () => void;
  onBuyNow: () => void;
  onCartClick?: () => void;
  onStoreClick?: () => void;
  onChatClick?: () => void;
}

export const Footer = ({ onAddToCart, onBuyNow, onCartClick, onStoreClick, onChatClick }: FooterProps) => {
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[500px] z-50 bg-card border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
      <div className="flex items-center h-[56px] px-3">
        <button onClick={onStoreClick} className="flex flex-col items-center justify-center w-12 gap-0.5 active:scale-95 transition-transform">
          <Store className="w-[22px] h-[22px] text-muted-foreground" />
          <span className="text-[9px] text-muted-foreground">Loja</span>
        </button>

        <button onClick={onChatClick} className="flex flex-col items-center justify-center w-12 gap-0.5 relative active:scale-95 transition-transform">
          <MessageCircle className="w-[22px] h-[22px] text-primary" />
          <span className="text-[9px] text-primary font-medium">Chat</span>
          <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-[hsl(var(--tiktok-green))]" />
        </button>

        <button onClick={onCartClick || onAddToCart} className="flex flex-col items-center justify-center w-12 gap-0.5 relative active:scale-95 transition-transform">
          <ShoppingCart className="w-[22px] h-[22px] text-muted-foreground" />
          <span className="text-[9px] text-muted-foreground">Carrinho</span>
          <span className="absolute top-0 right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] flex items-center justify-center font-bold">
            3
          </span>
        </button>

        <div className="flex flex-1 gap-2 ml-3">
          <button
            onClick={onAddToCart}
            className="flex-1 tiktok-btn-outline h-11 rounded-full text-[14px] font-semibold active:scale-[0.97] transition-transform"
          >
            Adicionar
          </button>
          <button
            onClick={onBuyNow}
            className="flex-[1.3] tiktok-btn-primary h-11 rounded-full text-[14px] font-semibold active:scale-[0.97] transition-transform"
          >
            Comprar
          </button>
        </div>
      </div>
      <div className="h-[env(safe-area-inset-bottom,0px)]" />
    </div>
  );
};
