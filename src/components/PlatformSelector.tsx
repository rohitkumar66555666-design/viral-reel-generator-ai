import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import instagramLogo from "@/assets/instagram-logo.png";
import facebookLogo from "@/assets/facebook-logo.png";
import youtubeLogo from "@/assets/youtube-logo.png";

const platforms = [
  { id: "instagram", label: "Instagram Reels", logo: instagramLogo },
  { id: "facebook", label: "Facebook Reels", logo: facebookLogo },
  { id: "youtube", label: "YouTube Shorts", logo: youtubeLogo },
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
