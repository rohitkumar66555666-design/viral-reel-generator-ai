import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const platforms = [
  { id: "instagram", label: "Instagram Reels", icon: "📸" },
  { id: "facebook", label: "Facebook Reels", icon: "📘" },
  { id: "youtube", label: "YouTube Shorts", icon: "🎬" },
] as const;

export type Platform = (typeof platforms)[number]["id"];

interface PlatformSelectorProps {
  selected: Platform;
  onSelect: (platform: Platform) => void;
}

export function PlatformSelector({ selected, onSelect }: PlatformSelectorProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {platforms.map((p) => (
        <motion.button
          key={p.id}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelect(p.id)}
          className={cn(
            "relative flex items-center gap-2 rounded-lg px-5 py-3 font-display text-sm font-medium transition-all",
            selected === p.id
              ? "gradient-border glow-shadow"
              : "border border-border bg-card hover:border-primary/40"
          )}
        >
          <span className="text-lg">{p.icon}</span>
          <span className={selected === p.id ? "gradient-text" : "text-foreground"}>
            {p.label}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
