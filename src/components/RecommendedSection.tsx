import { Star } from "lucide-react";

interface RecommendedProduct {
  id: number;
  image: string;
  title: string;
  price: number;
  rating: number;
  sold: string;
}

const recommended: RecommendedProduct[] = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=200&h=200&fit=crop",
    title: "Case para Fone de Ouvido Universal Proteção",
    price: 29.90,
    rating: 4.6,
    sold: "3,2mil",
  },
  {
    id: 2,
    image: "/images/recommended-1.webp",
    title: "Kit Potes de Vidro Redondo com Tampa Colorida Organização",
    price: 39.90,
    rating: 4.5,
    sold: "5,1mil",
  },
  {
    id: 3,
    image: "/images/recommended-2.webp",
    title: "Tampa de Silicone Flexível Universal Kit 6 Peças",
    price: 24.90,
    rating: 4.7,
    sold: "2,8mil",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=200&h=200&fit=crop",
    title: "Suporte Base para Fone de Ouvido Mesa Gamer",
    price: 49.90,
    rating: 4.8,
    sold: "1,5mil",
  },
];

export const RecommendedSection = () => {
  return (
    <div className="tiktok-section">
      <div className="px-4 pt-3 pb-2">
        <h2 className="text-[14px] font-semibold text-foreground">Você pode gostar</h2>
      </div>
      <div className="grid grid-cols-2 gap-2 px-4 pb-4">
        {recommended.map((item) => (
          <div
            key={item.id}
            className="bg-card rounded-lg overflow-hidden border border-border"
          >
            <img
              src={item.image}
              alt={item.title}
              className="w-full aspect-square object-cover"
              loading="lazy"
            />
            <div className="p-2.5">
              <p className="text-[12px] text-foreground leading-[1.3] line-clamp-2 mb-1.5">
                {item.title}
              </p>
              <p className="text-[14px] font-bold tiktok-price">
                R${item.price.toFixed(2).replace(".", ",")}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-2.5 h-2.5 fill-tiktok-star tiktok-star" />
                <span className="text-[10px] text-muted-foreground">{item.rating}</span>
                <span className="text-[10px] text-muted-foreground">· {item.sold} vendidos</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
