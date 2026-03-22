export interface Review {
  id: number;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  text: string;
  images?: string[];
}

export interface ProductData {
  title: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviewCount: number;
  soldCount: number;
  badges: string[];
  images: string[];
  colors: { name: string; hex: string; image?: string }[];
  variants?: { name: string; price: number; originalPrice: number }[];
  sizes?: string[];
  coupons: { label: string; discount: string }[];
  seller: {
    name: string;
    followers: string;
    products: number;
    rating: number;
    avatar: string;
    responseRate: string;
  };
  reviews: Review[];
  description: string[];
  specs: { label: string; value: string }[];
  shippingInfo: {
    method: string;
    estimate: string;
    cost: string;
  };
  footer: {
    email: string;
    whatsapp: string;
    address: string;
    cnpj: string;
    companyName: string;
  };
}

export const productData: ProductData = {
  title: "Sofá-Cama À Vácuo Cloud Montagem Rápida + Brinde Kit Proteção & Conforto (Capa Impermeável + Protetor de Colchão)",
  price: 79.90,
  originalPrice: 249.93,
  discount: 68,
  rating: 4.9,
  reviewCount: 4495,
  soldCount: 14200,
  badges: ["Mais vendido", "Oferta relâmpago"],
  images: [
    "/images/sofa-cinza.webp",
    "/images/sofa-1.jpeg",
    "/images/sofa-8.png",
    "/images/sofa-2.jpeg",
    "/images/sofa-3.png",
    "/images/sofa-4.png",
    "/images/sofa-5.png",
    "/images/sofa-6.png",
    "/images/sofa-7.png",
  ],
  colors: [],
  coupons: [
    { label: "Compras no PIX", discount: "5% OFF" },
    { label: "Oferta Relâmpago", discount: "Promoção" },
    { label: "Cupom da Loja", discount: "10% OFF" },
  ],
  seller: {
    name: "Sofá na Caixa",
    followers: "17,2 mil",
    products: 8,
    rating: 4.9,
    avatar: "/images/seller-sofa-na-caixa.jpg",
    responseRate: "95%",
  },
  reviews: [
    {
      id: 1,
      author: "K*e G*0",
      avatar: "/images/review-avatar-1.jpg",
      rating: 5,
      date: "02/10/2025",
      text: "Excelente sofá! Chegou dentro do prazo e é bem fácil de montar.",
      images: [
        "/images/review-photo-1a.jpg",
        "/images/review-photo-1b.jpg",
      ],
    },
    {
      id: 2,
      author: "M*a V*a",
      avatar: "/images/review-avatar-2.webp",
      rating: 3,
      date: "02/05/2025",
      text: "Superou minhas expectativas pelo preço. Chegou dentro do prazo previsto.",
      images: [
        "/images/review-photo-2a.png",
      ],
    },
    {
      id: 3,
      author: "L**s",
      avatar: "/images/review-avatar-3.webp",
      rating: 5,
      date: "01/28/2025",
      text: "Sofá muito bem construído e resistente. Valeu a pena!",
      images: ["/images/review-4.png"],
    {
      id: 4,
      author: "i*d*",
      avatar: "/images/review-avatar-4.webp",
      rating: 4,
      date: "01/20/2025",
      text: "Comprei pro meu pai kkkkk. Disse que é o melhor presente que eu já dei pra ele.",
    },
    {
      id: 5,
      author: "J**sc**o",
      avatar: "/images/review-avatar-5.jpg",
      rating: 5,
      date: "01/15/2025",
      text: "Qualidade absurda de boa.",
    },
    {
      id: 6,
      author: "A**sP**S",
      avatar: "/images/review-avatar-6.webp",
      rating: 5,
      date: "01/10/2025",
      text: "Chegou rápido e bem embalado. Material de alta qualidade. Vale muito a compra.",
      images: [
        "/images/review-photo-6a.jpg",
      ],
    },
    {
      id: 7,
      author: "J**a C**O",
      avatar: "/images/review-avatar-7.webp",
      rating: 5,
      date: "01/05/2025",
      text: "Recomendo sem dúvidas.",
    },
  ],
  description: [
    "🛋️ Sofá À Vácuo Cloud Montagem Rápida - Máximo conforto, funcionalidade e sofisticação.",
    "🧵 Tecido de veludo cotelê (corduroy) de alta qualidade e espuma de alta resiliência.",
    "💪 Estrutura robusta - Suporta até 544 kg, acomodando de 3 a 4 pessoas.",
    "🛏️ Sofá e Cama em um só - Design modular em formato L, equivalente a cama Full/Queen.",
    "📦 Pronto para uso - Entregue totalmente montado, sem necessidade de ferramentas.",
    "🏠 Ideal para sala de estar, sala de TV, quarto, apartamento ou porão.",
  ],
  specs: [
    { label: "Marca", value: "Sofá Na Caixa" },
    { label: "Cor", value: "Preto" },
    { label: "Material", value: "Espuma de alta resiliência e veludo cotelê" },
    { label: "Formato", value: "L (lado direito)" },
    { label: "Capacidade", value: "3 a 4 pessoas" },
    { label: "Carga máxima", value: "544 kg (1200 lb)" },
    { label: "Dimensão total", value: "110 polegadas" },
    { label: "Profundidade", value: "36,22 in" },
    { label: "Altura", value: "36,22 in" },
    { label: "Montagem", value: "Não requer" },
  ],
  shippingInfo: {
    method: "Padrão",
    estimate: "23-27 de mar",
    cost: "Grátis",
  },
  footer: {
    email: "sac@sofanacaixa.com.br",
    whatsapp: "(11) 99129-1193",
    address: "Av. Pres. Juscelino Kubitschek 1909, São Paulo, SP, CEP: 04543-907",
    cnpj: "27.415.911/0001-36",
    companyName: "Sofá na Caixa",
  },
};
