import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Minus, Plus } from "lucide-react";
import { productData } from "@/data/productData";


interface Variant {
  name: string;
  price: number;
  originalPrice: number;
}

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  variants: Variant[];
  productImage: string;
  price: number;
}

const colorOptions = [
  { name: "Preto", image: "/images/sofa-1.jpeg", price: 57.90, originalPrice: 249.93 },
  { name: "Cinza", image: "/images/sofa-cinza.webp", price: 57.90, originalPrice: 249.93 },
];

export const PurchaseModal = ({
  isOpen,
  onClose,
  variants,
}: PurchaseModalProps) => {
  const [selectedVariant] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();
  if (!isOpen) return null;

  const currentPrice = variants[selectedVariant].price;
  const pixDiscountedPrice = parseFloat((currentPrice * 0.95).toFixed(2));

  const handleBuyNow = () => {
    const params = new URLSearchParams({
      name: productData.title,
      price: pixDiscountedPrice.toString(),
      originalPrice: variants[selectedVariant].originalPrice.toString(),
      variant: variants[selectedVariant].name,
      color: colorOptions[selectedColor].name,
      seller: productData.seller.name,
      image: colorOptions[selectedColor].image,
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
      <div className="relative w-full max-w-[500px] bg-card rounded-t-xl shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-secondary z-10"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        <div className="flex items-end gap-3 p-4 pb-3">
          <img
            src={colorOptions[selectedColor].image}
            alt="Produto"
            className="w-[88px] h-[88px] rounded-lg object-cover border border-border -mt-8"
          />
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[22px] font-extrabold tiktok-price leading-none">
                R${currentPrice.toFixed(2).replace(".", ",")}
              </p>
              <span className="tiktok-tag text-[11px] font-bold">-{productData.discount}%</span>
            </div>
            <p className="text-[12px] text-muted-foreground line-through mt-0.5">
              R${variants[selectedVariant].originalPrice.toFixed(2).replace(".", ",")}
            </p>
          </div>
        </div>

        <div className="h-px bg-border mx-4" />

        <div className="p-4">
          <p className="text-[13px] font-semibold text-foreground mb-3">
            Cor: <span className="font-normal text-muted-foreground">{colorOptions[selectedColor].name}</span>
          </p>
          <div className="flex gap-2 flex-wrap">
            {colorOptions.map((color, i) => (
              <button
                key={color.name}
                onClick={() => setSelectedColor(i)}
                className={`w-[60px] h-[60px] rounded-lg overflow-hidden border-2 transition-all ${
                  selectedColor === i
                    ? "border-tiktok-red"
                    : "border-border"
                }`}
              >
                <img
                  src={color.image}
                  alt={color.name}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-border mx-4" />

        <div className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-foreground">Quantidade</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center disabled:opacity-30 transition-opacity"
              >
                <Minus className="w-3.5 h-3.5 text-foreground" />
              </button>
              <span className="text-[15px] font-semibold text-foreground w-6 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center"
              >
                <Plus className="w-3.5 h-3.5 text-foreground" />
              </button>
            </div>
          </div>
        </div>

        <div className="px-4 pb-4 pt-2">
          <button
            onClick={handleBuyNow}
            className="w-full tiktok-btn-primary h-12 rounded-full text-[15px] font-bold"
          >
            Comprar agora · R${(currentPrice * quantity).toFixed(2).replace(".", ",")}
          </button>
        </div>
        <div className="h-[env(safe-area-inset-bottom,0px)]" />
      </div>
    </div>
  );
};
