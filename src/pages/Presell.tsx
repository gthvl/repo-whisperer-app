import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { trackTikTokEvent } from "@/lib/tiktokPixel";
import { CheckCircle2, ShieldCheck } from "lucide-react";

const SLIDER_TRACK_WIDTH = 280;
const THUMB_SIZE = 44;
const THRESHOLD = SLIDER_TRACK_WIDTH - THUMB_SIZE - 8;

const Presell = () => {
  const navigate = useNavigate();
  const [dragX, setDragX] = useState(0);
  const [verified, setVerified] = useState(false);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    trackTikTokEvent("ViewContent", { content_name: "verification_page" });
  }, []);

  const handleStart = (clientX: number) => {
    if (verified) return;
    setDragging(true);
    startX.current = clientX - dragX;
  };

  const handleMove = (clientX: number) => {
    if (!dragging || verified) return;
    const maxX = SLIDER_TRACK_WIDTH - THUMB_SIZE - 8;
    const newX = Math.max(0, Math.min(clientX - startX.current, maxX));
    setDragX(newX);
  };

  const handleEnd = () => {
    if (!dragging || verified) return;
    setDragging(false);
    if (dragX >= THRESHOLD) {
      setVerified(true);
      setDragX(THRESHOLD);
      trackTikTokEvent("CompleteRegistration", { content_name: "slide_verified" });
      setTimeout(() => navigate("/produto"), 800);
    } else {
      setDragX(0);
    }
  };

  const onTouchStart = (e: React.TouchEvent) => handleStart(e.touches[0].clientX);
  const onTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    handleMove(e.touches[0].clientX);
  };
  const onTouchEnd = () => handleEnd();

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX);
  };

  useEffect(() => {
    if (!dragging) return;
    const onMM = (e: MouseEvent) => handleMove(e.clientX);
    const onMU = () => handleEnd();
    window.addEventListener("mousemove", onMM);
    window.addEventListener("mouseup", onMU);
    return () => {
      window.removeEventListener("mousemove", onMM);
      window.removeEventListener("mouseup", onMU);
    };
  });

  const progressPercent = (dragX / THRESHOLD) * 100;

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[hsl(var(--tiktok-dark))] flex flex-col items-center justify-center px-4 max-w-[480px] mx-auto relative select-none">
      
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3">
        <span className="text-primary-foreground/40 text-xs">verificação</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[hsl(var(--tiktok-green))]" />
          <span className="text-primary-foreground/40 text-[10px]">Conexão segura</span>
        </div>
      </div>

      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--tiktok-dark))] border border-primary-foreground/10 flex items-center justify-center shadow-lg">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path d="M26.4 8.4C24.84 7.08 23.76 5.16 23.4 3H18.6V23.4C18.6 25.56 16.86 27.3 14.7 27.3C12.54 27.3 10.8 25.56 10.8 23.4C10.8 21.24 12.54 19.5 14.7 19.5C15.18 19.5 15.6 19.56 16.02 19.74V14.82C15.6 14.76 15.12 14.7 14.7 14.7C9.9 14.7 6 18.6 6 23.4C6 28.2 9.9 32.1 14.7 32.1C19.5 32.1 23.4 28.2 23.4 23.4V13.02C25.26 14.4 27.54 15.18 30 15.18V10.38C28.62 10.38 27.36 9.54 26.4 8.4Z" fill="white"/>
          </svg>
        </div>
        <h1 className="text-primary-foreground text-lg font-bold text-center">
          Verificação de Segurança
        </h1>
        <p className="text-primary-foreground/50 text-[13px] text-center leading-relaxed max-w-[260px]">
          Deslize para confirmar que você não é um robô
        </p>
      </div>

      <div className="relative mb-8">
        <div
          ref={trackRef}
          className="relative rounded-full overflow-hidden border border-primary-foreground/10"
          style={{
            width: SLIDER_TRACK_WIDTH,
            height: THUMB_SIZE + 8,
            backgroundColor: verified
              ? "hsl(var(--tiktok-green) / 0.15)"
              : "hsl(0 0% 100% / 0.06)",
            transition: verified ? "background-color 0.3s" : undefined,
          }}
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: verified
                ? "hsl(var(--tiktok-green) / 0.25)"
                : "hsl(var(--primary) / 0.15)",
              transition: !dragging ? "width 0.3s" : undefined,
            }}
          />

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {verified ? (
              <span className="text-[hsl(var(--tiktok-green))] text-[13px] font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Verificado
              </span>
            ) : (
              <span
                className="text-primary-foreground/25 text-[13px] font-medium"
                style={{
                  opacity: dragX > 20 ? 0 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                Deslize →
              </span>
            )}
          </div>

          <div
            className="absolute top-1 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing"
            style={{
              left: 4 + dragX,
              width: THUMB_SIZE,
              height: THUMB_SIZE,
              backgroundColor: verified
                ? "hsl(var(--tiktok-green))"
                : "hsl(var(--primary))",
              transition: !dragging ? "left 0.3s, background-color 0.3s" : "background-color 0.3s",
              boxShadow: verified
                ? "0 0 20px hsl(var(--tiktok-green) / 0.5)"
                : "0 0 15px hsl(var(--primary) / 0.4)",
            }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onMouseDown={onMouseDown}
          >
            {verified ? (
              <CheckCircle2 className="w-5 h-5 text-primary-foreground" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-primary-foreground">
                <path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-primary-foreground/25 text-[10px]">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Proteção anti-spam ativa</span>
      </div>

      <div className="absolute bottom-6 flex gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--primary))]" />
        <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--tiktok-cyan))]" />
        <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground/20" />
      </div>
    </div>
  );
};

export default Presell;
