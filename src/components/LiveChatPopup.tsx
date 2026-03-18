import { useState, useRef, useEffect } from "react";
import { X, Send, MessageCircle } from "lucide-react";

interface Message {
  id: number;
  text: string;
  from: "user" | "seller";
  time: string;
}

const PRESET_QUESTIONS = [
  "Qual o prazo de entrega?",
  "Tem garantia?",
  "Aceita troca?",
  "Quais as cores disponíveis?",
  "Tem desconto para mais unidades?",
  "O produto é original?",
];

const SELLER_REPLIES: Record<string, string> = {
  "Qual o prazo de entrega?": "O prazo de entrega é de 3 a 7 dias úteis após a confirmação do pagamento! 📦",
  "Tem garantia?": "Sim! Oferecemos garantia de 90 dias contra defeitos de fabricação ✅",
  "Aceita troca?": "Aceitamos troca em até 7 dias após o recebimento, desde que o produto esteja em perfeitas condições 🔄",
  "Quais as cores disponíveis?": "Temos nas cores: Cinza, Bege e Marrom. Todas à pronta entrega! 🎨",
  "Tem desconto para mais unidades?": "Sim! Comprando 2 ou mais unidades, você ganha 10% de desconto adicional 🤑",
  "O produto é original?": "Sim, todos os nossos produtos são 100% originais com nota fiscal! ✅",
};

const DEFAULT_REPLY = "Obrigado pela sua mensagem! Vou verificar e te respondo em instantes 😊";

interface LiveChatPopupProps {
  isOpen: boolean;
  onClose: () => void;
  sellerName?: string;
  sellerAvatar?: string;
}

export const LiveChatPopup = ({ isOpen, onClose, sellerName = "Vendedor", sellerAvatar }: LiveChatPopupProps) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, text: `Olá! 👋 Sou o atendente da ${sellerName}. Como posso te ajudar?`, from: "seller", time: getTime() },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  function getTime() {
    return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now(), text, from: "user", time: getTime() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setIsTyping(true);
    const reply = SELLER_REPLIES[text] || DEFAULT_REPLY;
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, { id: Date.now() + 1, text: reply, from: "seller", time: getTime() }]);
    }, 1200 + Math.random() * 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <div className="absolute inset-0 bg-foreground/50" onClick={onClose} />
      <div className="relative w-full max-w-[500px] h-[75vh] bg-card rounded-t-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
          <div className="relative">
            {sellerAvatar ? (
              <img src={sellerAvatar} alt={sellerName} className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-primary" />
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[hsl(var(--tiktok-green))] border-2 border-card" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-foreground truncate">{sellerName}</p>
            <p className="text-[11px] text-[hsl(var(--tiktok-green))]">Online agora</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted active:scale-95 transition-all">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] px-3 py-2 rounded-2xl text-[13px] leading-relaxed ${
                  msg.from === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted text-foreground rounded-bl-md"
                }`}
              >
                <p>{msg.text}</p>
                <p className={`text-[10px] mt-1 ${msg.from === "user" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-muted px-4 py-2.5 rounded-2xl rounded-bl-md flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="px-4 pb-2">
          <p className="text-[11px] text-muted-foreground mb-2">Perguntas frequentes:</p>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="px-3 py-1.5 rounded-full border border-border text-[12px] text-foreground bg-card hover:bg-muted active:scale-95 transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <div className="px-3 py-2 border-t border-border bg-card">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
              placeholder="Digite sua mensagem..."
              className="flex-1 h-10 px-4 rounded-full bg-muted text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim()}
              className="w-10 h-10 rounded-full bg-primary flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40"
            >
              <Send className="w-4 h-4 text-primary-foreground" />
            </button>
          </div>
          <div className="h-[env(safe-area-inset-bottom,0px)]" />
        </div>
      </div>
    </div>
  );
};
