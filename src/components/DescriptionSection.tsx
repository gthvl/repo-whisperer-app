import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface DescriptionSectionProps {
  description: string[];
  specs: { label: string; value: string }[];
}

export const DescriptionSection = ({ description, specs }: DescriptionSectionProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="tiktok-section">
      <div className="px-4 pt-3 pb-2">
        <h2 className="text-[14px] font-semibold text-foreground">Detalhes do produto</h2>
      </div>

      <div className="px-4 pb-3">
        <div className="bg-secondary/50 rounded-lg overflow-hidden">
          {specs.slice(0, expanded ? specs.length : 4).map((spec, i) => (
            <div
              key={i}
              className={`flex items-center py-2 px-3 ${
                i % 2 === 0 ? "bg-secondary/30" : ""
              }`}
            >
              <span className="text-[12px] text-muted-foreground w-[40%]">{spec.label}</span>
              <span className="text-[12px] text-foreground">{spec.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 pb-3">
        <div className={`space-y-2 ${!expanded ? "max-h-[120px] overflow-hidden relative" : ""}`}>
          {description.map((item, i) => (
            <p key={i} className="text-[13px] text-foreground/80 leading-relaxed">
              {item}
            </p>
          ))}
          {!expanded && (
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent" />
          )}
        </div>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-1 py-2.5 border-t border-border text-[12px] text-muted-foreground"
      >
        {expanded ? "Ver menos" : "Ver mais"}
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
};
