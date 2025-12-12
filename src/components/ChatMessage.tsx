import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Bot, Check, Copy, User } from "lucide-react";
import { ChatMessage as ChatMessageType } from "@/hooks/useChat";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: ChatMessageType;
  highlight?: boolean;
}

export function ChatMessage({ message, highlight }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);

  const roleStyles = useMemo(
    () =>
      message.role === "assistant"
        ? "bg-white/5 border-white/10"
        : "bg-[hsl(var(--muted))] border-[hsl(var(--border))]",
    [message.role]
  );

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "flex gap-3 rounded-2xl border p-4 shadow-lg",
        roleStyles,
        highlight && "ring-2 ring-[hsl(var(--primary))]/60"
      )}
    >
      <Avatar className="mt-1 h-10 w-10 bg-white/10">
        <AvatarFallback>
          {message.role === "assistant" ? <Bot size={18} /> : <User size={18} />}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-3">
        <div className="flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))]">
          <span className="capitalize">{message.role}</span>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-2 text-[hsl(var(--muted-foreground))]"
            onClick={handleCopy}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span className="sr-only">Copy</span>
          </Button>
        </div>
        <div className="prose prose-invert max-w-none text-sm leading-relaxed prose-p:my-2 prose-pre:bg-black/40 prose-pre:p-4 prose-pre:rounded-xl">
          {message.content ? <ReactMarkdown>{message.content}</ReactMarkdown> : <span className="animate-pulse text-[hsl(var(--muted-foreground))]">Typing…</span>}
        </div>
      </div>
    </motion.div>
  );
}
