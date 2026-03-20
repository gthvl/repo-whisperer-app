import { ArrowLeft, Share2, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[500px] z-50 bg-card/95 backdrop-blur-sm">
      <div className="flex items-center justify-between px-3 h-[44px]">
        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-foreground/5">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </div>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-foreground/5">
            <Share2 className="w-[18px] h-[18px] text-foreground" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-foreground/5">
            <MoreHorizontal className="w-[18px] h-[18px] text-foreground" />
          </button>
        </div>
      </div>
    </header>
  );
};
