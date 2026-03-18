import { Mail, Phone, MapPin, Building2, ShieldCheck } from "lucide-react";

interface PageFooterProps {
  email: string;
  whatsapp: string;
  address: string;
  cnpj: string;
  companyName: string;
}

export const PageFooter = ({
  email,
  whatsapp,
  address,
  cnpj,
  companyName,
}: PageFooterProps) => {
  return (
    <div className="tiktok-section px-4 py-4">
      <div className="flex items-center gap-1.5 mb-3">
        <ShieldCheck className="w-4 h-4 text-tiktok-green" />
        <span className="text-[12px] font-medium text-foreground">Informações do vendedor</span>
      </div>
      <div className="space-y-2 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-2">
          <Building2 className="w-3 h-3 flex-shrink-0" />
          <span>{companyName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Mail className="w-3 h-3 flex-shrink-0" />
          <span>{email}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-3 h-3 flex-shrink-0" />
          <span>{whatsapp}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span>{address}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">CNPJ:</span>
          <span>{cnpj}</span>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-border text-center text-[9px] text-muted-foreground">
        © 2025 {companyName}
      </div>
    </div>
  );
};
