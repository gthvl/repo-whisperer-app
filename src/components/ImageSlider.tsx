import { useState, useRef } from "react";

interface ImageSliderProps {
  images: string[];
}

export const ImageSlider = ({ images }: ImageSliderProps) => {
  const [current, setCurrent] = useState(0);
  const touchStart = useRef(0);
  const touchEnd = useRef(0);
  const isDragging = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.targetTouches[0].clientX;
    isDragging.current = true;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const diff = touchStart.current - touchEnd.current;
    if (diff > 40 && current < images.length - 1) setCurrent(current + 1);
    if (diff < -40 && current > 0) setCurrent(current - 1);
  };

  return (
    <div
      className="relative bg-card overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="flex transition-transform duration-300 ease-out will-change-transform"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {images.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={`Produto ${i + 1}`}
            className="w-full aspect-square object-cover flex-shrink-0"
            loading={i === 0 ? "eager" : "lazy"}
            draggable={false}
          />
        ))}
      </div>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all duration-200 ${
              i === current
                ? "w-5 h-1.5 bg-foreground"
                : "w-1.5 h-1.5 bg-foreground/30"
            }`}
            aria-label={`Imagem ${i + 1}`}
          />
        ))}
      </div>

      {/* Counter */}
      <div className="absolute bottom-3 right-3 bg-foreground/50 text-card text-[10px] px-2 py-0.5 rounded-full font-medium backdrop-blur-sm">
        {current + 1}/{images.length}
      </div>
    </div>
  );
};
