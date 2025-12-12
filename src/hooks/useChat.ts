import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { askFastApi, listModels } from "@/lib/fastapi-api";

export type Role = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: Role;
  content: string;
  createdAt: string;
  streaming?: boolean;
};

export type ChatSession = {
  id: string;
  title: string;
  model?: string;
  messages: ChatMessage[];
};

type StreamTarget = {
  sessionId: string;
  messageId: string;
  content: string;
};

const HISTORY_KEY = "beautifyollama-history";
const ACTIVE_KEY = "beautifyollama-active";

function uid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadSessions(): ChatSession[] {
  if (typeof window === "undefined") return [];
  const saved = window.localStorage.getItem(HISTORY_KEY);
  if (!saved) return [];
  try {
    const parsed = JSON.parse(saved) as ChatSession[];
    return parsed.map((session) => ({
      ...session,
      messages: session.messages ?? []
    }));
  } catch (error) {
    return [];
  }
}

export function useChat() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const existing = loadSessions();
    if (existing.length > 0) return existing;
    return [createEmptySession("Chat 1")];
  });

  const [activeId, setActiveId] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem(ACTIVE_KEY) ?? "";
  });

  const [pendingStream, setPendingStream] = useState<StreamTarget | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>("");

  const { data: availableModels = [], isFetching: loadingModels } = useQuery({
    queryKey: ["models"],
    queryFn: listModels,
    staleTime: 1000 * 60 * 5
  });

  useEffect(() => {
    if (!selectedModel && availableModels.length > 0) {
      setSelectedModel(availableModels[0]);
    }
  }, [availableModels, selectedModel]);

  const activeSession = useMemo(() => {
    const found = sessions.find((session) => session.id === activeId);
    return found ?? sessions[0];
  }, [sessions, activeId]);

  useEffect(() => {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    if (activeSession) {
      window.localStorage.setItem(ACTIVE_KEY, activeSession.id);
      if (activeId !== activeSession.id) setActiveId(activeSession.id);
    }
  }, [activeSession, activeId]);

  const askMutation = useMutation({
    mutationFn: async (variables: { prompt: string; model?: string; sessionId: string; assistantId: string }) => {
      const response = await askFastApi(variables.prompt, variables.model);
      return { ...variables, response };
    },
    onSuccess: ({ response, assistantId, sessionId }) => {
      const text = response.trim() || "No response received from the local model.";
      setPendingStream({ sessionId, messageId: assistantId, content: text });
    },
    onError: (_error, variables) => {
      updateMessage(variables.sessionId, variables.assistantId, "Unable to reach FastAPI at http://localhost:8000.");
      setIsTyping(false);
    }
  });

  useQuery({
    queryKey: ["stream", pendingStream?.messageId],
    enabled: Boolean(pendingStream),
    queryFn: () =>
      new Promise<string>((resolve) => {
        if (!pendingStream) return resolve("");
        const tokens = pendingStream.content.split(/(\s+)/);
        let accumulator = "";
        let index = 0;

        const tick = () => {
          accumulator += tokens[index] ?? "";
          updateMessage(pendingStream.sessionId, pendingStream.messageId, accumulator, true);
          index += 1;

          if (index >= tokens.length) {
            setPendingStream(null);
            setIsTyping(false);
            updateMessage(pendingStream.sessionId, pendingStream.messageId, accumulator, false);
            resolve(accumulator);
            return;
          }
          setTimeout(tick, 28);
        };

        tick();
      })
  });

  function createEmptySession(title?: string): ChatSession {
    const count = sessions?.length ?? 0;
    return {
      id: uid(),
      title: title ?? `Chat ${count + 1}`,
      model: selectedModel,
      messages: []
    };
  }

  function updateMessage(sessionId: string, messageId: string, content: string, streaming?: boolean) {
    setSessions((prev) =>
      prev.map((session) => {
        if (session.id !== sessionId) return session;
        return {
          ...session,
          messages: session.messages.map((message) =>
            message.id === messageId ? { ...message, content, streaming } : message
          )
        };
      })
    );
  }

  function addMessage(sessionId: string, message: ChatMessage) {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId
          ? { ...session, messages: [...session.messages, message], title: session.title || message.content.slice(0, 32) }
          : session
      )
    );
  }

  function ensureSession(): string {
    if (activeSession) return activeSession.id;
    const fresh = createEmptySession("Chat 1");
    setSessions([fresh]);
    setActiveId(fresh.id);
    return fresh.id;
  }

  function sendMessage(prompt: string) {
    const trimmed = prompt.trim();
    if (!trimmed) return;

    const sessionId = activeSession?.id ?? ensureSession();
    const userMessage: ChatMessage = {
      id: uid(),
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString()
    };
    const assistantMessage: ChatMessage = {
      id: uid(),
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString(),
      streaming: true
    };

    addMessage(sessionId, userMessage);
    addMessage(sessionId, assistantMessage);
    setIsTyping(true);

    askMutation.mutate({
      prompt: trimmed,
      model: selectedModel,
      sessionId,
      assistantId: assistantMessage.id
    });
  }

  function regenerateResponse() {
    const messages = activeSession?.messages ?? [];
    const lastUserMessage = [...messages].reverse().find((message) => message.role === "user");
    if (!lastUserMessage) return;
    sendMessage(lastUserMessage.content);
  }

  function createSession() {
    const session = createEmptySession();
    setSessions((prev) => [...prev, session]);
    setActiveId(session.id);
  }

  function removeSession(id: string) {
    const filtered = sessions.filter((session) => session.id !== id);
    setSessions(filtered.length > 0 ? filtered : [createEmptySession("Chat 1")]);
    if (activeId === id) {
      setActiveId(filtered[0]?.id ?? "");
    }
  }

  function clearHistory() {
    const fresh = createEmptySession("Chat 1");
    setSessions([fresh]);
    setActiveId(fresh.id);
  }

  return {
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
    isSending: askMutation.isPending || isTyping,
    streamingMessageId: pendingStream?.messageId ?? null
  };
}
