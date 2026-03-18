import { ChevronRight } from "lucide-react";

interface Variant {
  name: string;
  price: number;
  originalPrice: number;
}

interface VariantsSectionProps {
  variants: Variant[];
  onSelect: () => void;
}

export const VariantsSection = ({ variants, onSelect }: VariantsSectionProps) => {
  return (
    <button onClick={onSelect} className="tiktok-section-padded w-full text-left">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-muted-foreground">Variante</span>
          <span className="text-[13px] text-foreground font-medium">
            {variants.map(v => v.name).join(", ")}
          </span>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>
    </button>
  );
};
