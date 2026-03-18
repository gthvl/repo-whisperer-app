import { useState } from "react";
import { Star, ChevronRight, X } from "lucide-react";
import type { Review } from "@/data/productData";

interface ReviewsSectionProps {
  reviews: Review[];
  rating: number;
  reviewCount: number;
}

export const ReviewsSection = ({ reviews, rating, reviewCount }: ReviewsSectionProps) => {
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  return (
    <div className="tiktok-section">
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-semibold text-foreground">Avaliações</span>
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-tiktok-star tiktok-star" />
            <span className="text-[13px] font-semibold text-foreground">{rating}</span>
          </div>
          <span className="text-[12px] text-muted-foreground">
            ({reviewCount.toLocaleString("pt-BR")})
          </span>
        </div>
        <button className="flex items-center gap-0.5 text-[12px] text-muted-foreground">
          Ver tudo
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-none">
        {["Confortável", "Boa qualidade", "Fácil de montar", "Resistente", "Bom custo-benefício"].map((tag) => (
          <span
            key={tag}
            className="flex-shrink-0 text-[11px] bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="px-4 pb-3 space-y-4">
        {reviews.map((review) => (
          <div key={review.id}>
            <div className="flex items-center gap-2 mb-1.5">
              <img
                src={review.avatar}
                alt={review.author}
                className="w-7 h-7 rounded-full"
              />
              <span className="text-[12px] font-medium text-foreground">{review.author}</span>
              <span className="text-[10px] text-muted-foreground">{review.date}</span>
            </div>
            <div className="flex gap-0.5 mb-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-2.5 h-2.5 ${
                    i < review.rating ? "fill-tiktok-star tiktok-star" : "text-muted"
                  }`}
                />
              ))}
            </div>
            <p className="text-[13px] text-foreground/85 leading-relaxed">
              {review.text}
            </p>
            {review.images && (
              <div className="flex gap-2 mt-2">
                {review.images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt="Foto da avaliação"
                    className="w-16 h-16 rounded-md object-cover cursor-pointer active:scale-95 transition-transform"
                    onClick={() => setLightboxImg(img)}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {lightboxImg && (
        <div
          className="fixed inset-0 z-[200] bg-foreground/80 flex items-center justify-center p-4"
          onClick={() => setLightboxImg(null)}
        >
          <button
            onClick={() => setLightboxImg(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-card/20 flex items-center justify-center backdrop-blur-sm"
          >
            <X className="w-6 h-6 text-card" />
          </button>
          <img
            src={lightboxImg}
            alt="Foto da avaliação ampliada"
            className="max-w-full max-h-[85vh] rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};
