import { useEffect, useRef } from "react";
import { Send, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onRegenerate: () => void;
  disabled?: boolean;
}

export function ChatInput({ value, onChange, onSend, onRegenerate, disabled }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "Enter") {
        event.preventDefault();
        onSend();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onSend]);

  return (
    <div className="flex items-end gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-xl">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Envie uma mensagem (Ctrl + Enter)"
        disabled={disabled}
        className="min-h-[100px] flex-1"
      />
      <div className="flex flex-col gap-2">
        <Button onClick={onSend} disabled={disabled} className="h-10 w-10 rounded-full" size="icon">
          <Send size={16} />
        </Button>
        <Button onClick={onRegenerate} disabled={disabled} className="h-10 w-10 rounded-full" size="icon" variant="secondary">
          <RotateCcw size={16} />
        </Button>
      </div>
    </div>
  );
}
