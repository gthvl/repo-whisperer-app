import { useState } from "react";
import { X, Minus, Plus, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { productData } from "@/data/productData";

interface CartPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartPopup = ({ isOpen, onClose }: CartPopupProps) => {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);

  if (!isOpen) return null;

  const total = productData.price * quantity;

  const handleCheckout = () => {
    const params = new URLSearchParams({
      name: productData.title,
      price: productData.price.toString(),
      originalPrice: productData.originalPrice.toString(),
      variant: "",
      seller: productData.seller.name,
      image: productData.images[0],
    });
    if (quantity > 1) params.set("qty", quantity.toString());
    params.set("coupons", JSON.stringify(productData.coupons));
    onClose();
    navigate(`/checkout?${params.toString()}`);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <div
        className="absolute inset-0 bg-foreground/50 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />
      <div className="relative w-full max-w-[500px] bg-card rounded-t-xl shadow-2xl animate-in slide-in-from-bottom duration-300">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-secondary z-10"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        <div className="flex items-center gap-2 p-4 pb-3">
          <ShoppingCart className="w-5 h-5 text-foreground" />
          <h3 className="text-[16px] font-bold text-foreground">Carrinho</h3>
        </div>

        <div className="h-px bg-border mx-4" />

        <div className="p-4">
          <div className="flex gap-3">
            <img
              src={productData.images[0]}
              alt={productData.title}
              className="w-[80px] h-[80px] rounded-lg object-cover border border-border shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-foreground leading-tight line-clamp-2">
                {productData.title}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[15px] font-extrabold tiktok-price">
                  R$ {productData.price.toFixed(2).replace(".", ",")}
                </span>
                <span className="text-[11px] text-muted-foreground line-through">
                  R$ {productData.originalPrice.toFixed(2).replace(".", ",")}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="w-7 h-7 rounded-full border border-border flex items-center justify-center disabled:opacity-30 transition-opacity"
                >
                  <Minus className="w-3 h-3 text-foreground" />
                </button>
                <span className="text-[14px] font-semibold text-foreground w-5 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-7 h-7 rounded-full border border-border flex items-center justify-center"
                >
                  <Plus className="w-3 h-3 text-foreground" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-border mx-4" />

        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] text-muted-foreground">Total</span>
            <span className="text-[18px] font-extrabold tiktok-price">
              R$ {total.toFixed(2).replace(".", ",")}
            </span>
          </div>
          <button
            onClick={handleCheckout}
            className="w-full tiktok-btn-primary h-12 rounded-full text-[15px] font-bold"
          >
            Finalizar compra
          </button>
        </div>
        <div className="h-[env(safe-area-inset-bottom,0px)]" />
      </div>
    </div>
  );
};
