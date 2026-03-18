import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { trackTikTokEvent } from "@/lib/tiktokPixel";
import { Zap } from "lucide-react";
import { Header } from "@/components/Header";
import { ImageSlider } from "@/components/ImageSlider";
import { ProductInfo } from "@/components/ProductInfo";
import { CouponsSection } from "@/components/CouponsSection";
import { ShippingSection } from "@/components/ShippingSection";
import { SellerSection } from "@/components/SellerSection";
import { ReviewsSection } from "@/components/ReviewsSection";
import { DescriptionSection } from "@/components/DescriptionSection";
import { RecommendedSection } from "@/components/RecommendedSection";
import { Footer } from "@/components/Footer";
import { PageFooter } from "@/components/PageFooter";
import { PurchaseModal } from "@/components/PurchaseModal";
import { CartPopup } from "@/components/CartPopup";
import { LiveChatPopup } from "@/components/LiveChatPopup";
import { productData } from "@/data/productData";

const Index = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(9 * 60);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((p) => (p <= 1 ? 0 : p - 1)), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  useEffect(() => {
    trackTikTokEvent('ViewContent', {
      content_name: productData.title,
      value: productData.price,
      currency: 'BRL',
    });
  }, []);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const purchaseVariants = productData.variants && productData.variants.length > 0
    ? productData.variants
    : [{ name: "Padrão", price: productData.price, originalPrice: productData.originalPrice }];

  return (
    <div className="max-w-[500px] mx-auto relative pb-[60px] pt-[44px] bg-background">
      <Header />

      <main>
        <ImageSlider images={productData.images} />

        {/* Flash Sale Banner */}
        <div className="flex items-stretch" style={{ background: "linear-gradient(135deg, hsl(var(--tiktok-red)) 0%, hsl(var(--tiktok-orange)) 100%)" }}>
          <div className="flex-1 px-4 py-2.5">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="bg-primary-foreground/20 text-primary-foreground text-[12px] font-bold px-1.5 py-0.5 rounded-sm">
                -{productData.discount}%
              </span>
              <span className="text-primary-foreground text-[22px] font-extrabold leading-none">
                R$ {productData.price.toFixed(2).replace(".", ",")}
              </span>
            </div>
            <span className="text-primary-foreground/60 text-[12px] line-through">
              R$ {productData.originalPrice.toFixed(2).replace(".", ",")}
            </span>
          </div>
          <div className="flex flex-col items-end justify-center px-4 py-2.5">
            <div className="flex items-center gap-1 text-primary-foreground">
              <Zap className="w-3.5 h-3.5 fill-primary-foreground" />
              <span className="text-[13px] font-bold">Oferta Relâmpago</span>
            </div>
            <span className="text-primary-foreground/90 text-[12px] mt-0.5">
              Termina em <span className="font-bold">{formatTime(timeLeft)}</span>
            </span>
          </div>
        </div>

        <ProductInfo
          title={productData.title}
          price={productData.price}
          originalPrice={productData.originalPrice}
          discount={productData.discount}
          rating={productData.rating}
          reviewCount={productData.reviewCount}
          soldCount={productData.soldCount}
          badges={productData.badges}
        />

        <ShippingSection
          method={productData.shippingInfo.method}
          estimate={productData.shippingInfo.estimate}
          cost={productData.shippingInfo.cost}
        />

        <CouponsSection coupons={productData.coupons} />

        <div id="seller-section">
          <SellerSection
            name={productData.seller.name}
            followers={productData.seller.followers}
            products={productData.seller.products}
            rating={productData.seller.rating}
            avatar={productData.seller.avatar}
            responseRate={productData.seller.responseRate}
          />
        </div>

        <ReviewsSection
          reviews={productData.reviews}
          rating={productData.rating}
          reviewCount={productData.reviewCount}
        />

        <DescriptionSection
          description={productData.description}
          specs={productData.specs}
        />

        <RecommendedSection />

        <PageFooter
          email={productData.footer.email}
          whatsapp={productData.footer.whatsapp}
          address={productData.footer.address}
          cnpj={productData.footer.cnpj}
          companyName={productData.footer.companyName}
        />
      </main>

      <Footer
        onAddToCart={() => {
          trackTikTokEvent('AddToCart', {
            content_name: productData.title,
            value: productData.price,
            currency: 'BRL',
          });
          setShowPurchaseModal(true);
        }}
        onBuyNow={() => setShowPurchaseModal(true)}
        onCartClick={() => setShowCartPopup(true)}
        onStoreClick={() => {
          document.getElementById("seller-section")?.scrollIntoView({ behavior: "smooth" });
        }}
        onChatClick={() => setShowChat(true)}
      />

      <PurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        variants={purchaseVariants}
        productImage={productData.images[0]}
        price={productData.price}
      />

      <CartPopup
        isOpen={showCartPopup}
        onClose={() => setShowCartPopup(false)}
      />

      <LiveChatPopup
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        sellerName={productData.seller.name}
        sellerAvatar={productData.seller.avatar}
      />
    </div>
  );
};

export default Index;
