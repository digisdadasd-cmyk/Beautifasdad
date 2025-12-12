import { Check, ChevronsUpDown, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";

interface ModelSelectorProps {
  models: string[];
  selected: string;
  onSelect: (value: string) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export function ModelSelector({ models, selected, onSelect, refreshing, onRefresh }: ModelSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between gap-3 border-white/10 bg-white/5 text-sm font-semibold">
          <span className="flex items-center gap-2">
            <Badge variant="outline" className="border-white/20 bg-white/10">
              {selected || "Choose model"}
            </Badge>
          </span>
          <ChevronsUpDown size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 bg-[hsl(var(--card))]">
        <DropdownMenuLabel className="text-[hsl(var(--muted-foreground))]">Local models</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {models.length === 0 && (
          <DropdownMenuItem disabled className="text-[hsl(var(--muted-foreground))]">
            No models from FastAPI
          </DropdownMenuItem>
        )}
        {models.map((model) => (
          <DropdownMenuItem key={model} onClick={() => onSelect(model)}>
            <div className="flex w-full items-center justify-between gap-3">
              <span>{model}</span>
              {model === selected && <Check size={16} />}
            </div>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onRefresh} className="flex items-center gap-2">
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} /> Refresh models
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
