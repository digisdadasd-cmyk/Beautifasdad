import { FolderPlus, Trash2 } from "lucide-react";
import { ChatSession } from "@/hooks/useChat";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface HistoryListProps {
  sessions: ChatSession[];
  activeId?: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}

export function HistoryList({ sessions, activeId, onSelect, onCreate, onDelete, onClear }: HistoryListProps) {
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-semibold text-[hsl(var(--foreground))]">Histórico</div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" className="h-9 w-9" onClick={onCreate}>
            <FolderPlus size={18} />
          </Button>
          <Button size="sm" variant="ghost" className="h-9 w-9 text-red-300" onClick={onClear}>
            <Trash2 size={18} />
          </Button>
        </div>
      </div>
      <div className="space-y-2 overflow-y-auto pr-2">
        {sessions.map((session) => (
          <div
            key={session.id}
            className={cn(
              "group flex items-center justify-between rounded-xl border border-transparent px-3 py-2 text-sm transition-colors",
              activeId === session.id ? "bg-white/10 border-white/20" : "hover:bg-white/5"
            )}
          >
            <button
              type="button"
              className="flex-1 text-left"
              onClick={() => onSelect(session.id)}
            >
              <div className="line-clamp-1 font-semibold text-[hsl(var(--foreground))]">{session.title || "Chat"}</div>
              <div className="text-xs text-[hsl(var(--muted-foreground))]">{session.messages.length} mensagens</div>
            </button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => onDelete(session.id)}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
