import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { Bot, Menu, Moon, Sun } from "lucide-react";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { HistoryList } from "@/components/HistoryList";
import { ModelSelector } from "@/components/ModelSelector";
import { TypingIndicator } from "@/components/TypingIndicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat } from "@/hooks/useChat";
import { useTheme } from "@/hooks/useTheme";

export default function App() {
  const queryClient = useQueryClient();
  const {
    sessions,
    activeSession,
    setActiveId,
    sendMessage,
    regenerateResponse,
    createSession,
    removeSession,
    clearHistory,
    isTyping,
    selectedModel,
    setSelectedModel,
    availableModels,
    loadingModels,
    isSending,
    streamingMessageId
  } = useChat();

  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const messages = useMemo(() => activeSession?.messages ?? [], [activeSession]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages.length, streamingMessageId]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  const handleRefreshModels = () => {
    queryClient.invalidateQueries({ queryKey: ["models"] });
  };

  return (
    <div className="mx-auto flex max-w-7xl gap-6">
      <Card className="glass-panel grid w-full grid-cols-[320px,1fr] overflow-hidden border-white/10 bg-white/10">
        <div className={`relative hidden h-full border-r border-white/10 p-4 md:block`}>
          <HistoryList
            sessions={sessions}
            activeId={activeSession?.id}
            onSelect={setActiveId}
            onCreate={createSession}
            onDelete={removeSession}
            onClear={clearHistory}
          />
        </div>

        <div className="flex flex-col gap-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="md:hidden rounded-xl border border-white/10 bg-white/5 p-2"
                onClick={() => setSidebarOpen((prev) => !prev)}
                aria-label="Abrir histórico"
              >
                <Menu size={18} />
              </button>
              <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-2 text-sm font-semibold">
                <Bot size={18} />
                Beautify Ollama Desktop
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-11 w-11 rounded-2xl" onClick={toggleTheme}>
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </Button>
              <div className="w-60">
                <ModelSelector
                  models={availableModels}
                  selected={selectedModel}
                  onSelect={setSelectedModel}
                  refreshing={loadingModels}
                  onRefresh={handleRefreshModels}
                />
              </div>
            </div>
          </div>

          <Card className="glass-panel flex min-h-[520px] flex-col border-white/10 bg-white/5">
            <CardHeader className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">Conversa</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Histórico local, streaming simulado e atalhos Ctrl + Enter.
                </p>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
              <ScrollArea className="max-h-[520px] flex-1">
                <div className="flex flex-col gap-3 pr-2">
                  <AnimatePresence>
                    {messages.map((message) => (
                      <ChatMessage key={message.id} message={message} highlight={message.id === streamingMessageId} />
                    ))}
                  </AnimatePresence>
                  {isTyping && <TypingIndicator />}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              <ChatInput
                value={input}
                onChange={setInput}
                onSend={handleSend}
                onRegenerate={regenerateResponse}
                disabled={isSending}
              />
            </CardContent>
          </Card>
        </div>
      </Card>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
            className="fixed left-4 top-4 z-40 h-[calc(100%-2rem)] w-72 rounded-2xl border border-white/10 bg-[hsl(var(--card))] p-4 shadow-2xl md:hidden"
          >
            <HistoryList
              sessions={sessions}
              activeId={activeSession?.id}
              onSelect={(id) => {
                setActiveId(id);
                setSidebarOpen(false);
              }}
              onCreate={createSession}
              onDelete={removeSession}
              onClear={clearHistory}
            />
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
