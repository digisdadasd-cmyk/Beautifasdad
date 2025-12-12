import { motion } from "framer-motion";

export function TypingIndicator() {
  const dots = [0, 1, 2];
  return (
    <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs text-[hsl(var(--muted-foreground))]">
      Digitando
      <div className="flex items-center gap-1">
        {dots.map((dot) => (
          <motion.span
            key={dot}
            className="block h-2 w-2 rounded-full bg-[hsl(var(--foreground))]"
            animate={{ opacity: [0.2, 1, 0.2], y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 0.9, delay: dot * 0.12 }}
          />
        ))}
      </div>
    </div>
  );
}
