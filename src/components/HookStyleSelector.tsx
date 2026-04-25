import { motion } from "framer-motion";
import { Eye, BookOpen, BarChart3, Flame, MousePointerClick } from "lucide-react";
import { cn } from "@/lib/utils";

export type HookStyle =
  | "curiosity"
  | "story"
  | "shock"
  | "controversial"
  | "cta";

export const HOOK_STYLES: {
  id: HookStyle;
  label: string;
  example: string;
  icon: typeof Eye;
}[] = [
  { id: "curiosity", label: "Curiosity Gap", example: "You won't believe…", icon: Eye },
  { id: "story", label: "Story Opener", example: "I used to struggle with…", icon: BookOpen },
  { id: "shock", label: "Shock Stat", example: "9 out of 10 people…", icon: BarChart3 },
  { id: "controversial", label: "Controversial Take", example: "Unpopular opinion:", icon: Flame },
  { id: "cta", label: "Direct CTA", example: "Stop scrolling if you…", icon: MousePointerClick },
];

interface Props {
  selected: HookStyle;
  onSelect: (style: HookStyle) => void;
}

export function HookStyleSelector({ selected, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {HOOK_STYLES.map((style) => {
        const Icon = style.icon;
        const isActive = selected === style.id;
        return (
          <motion.button
            key={style.id}
            type="button"
            onClick={() => onSelect(style.id)}
            whileTap={{ scale: 0.96 }}
            className={cn(
              "group relative flex items-center gap-2 rounded-full border px-3.5 py-2 text-left transition-all",
              isActive
                ? "border-primary bg-primary/10 glow-shadow"
                : "border-border bg-card hover:border-primary/40 hover:bg-primary/5"
            )}
          >
            <Icon
              className={cn(
                "h-3.5 w-3.5 shrink-0 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
              )}
            />
            <div className="flex flex-col leading-tight">
              <span
                className={cn(
                  "text-xs font-semibold",
                  isActive ? "text-primary" : "text-foreground"
                )}
              >
                {style.label}
              </span>
              <span className="text-[10px] italic text-muted-foreground">
                "{style.example}"
              </span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
