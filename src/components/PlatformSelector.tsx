import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import instagramLogo from "@/assets/instagram-logo.png";
import tiktokLogo from "@/assets/tiktok-logo.png";
import youtubeLogo from "@/assets/youtube-logo.png";

const platforms = [
  { id: "instagram", label: "Instagram Reels", short: "Instagram", logo: instagramLogo },
  { id: "tiktok", label: "TikTok", short: "TikTok", logo: tiktokLogo },
  { id: "youtube", label: "YouTube Shorts", short: "Shorts", logo: youtubeLogo },
] as const;

export type Platform = (typeof platforms)[number]["id"];

interface PlatformSelectorProps {
  selected: Platform;
  onSelect: (platform: Platform) => void;
}

export function PlatformSelector({ selected, onSelect }: PlatformSelectorProps) {
  return (
    <div
      role="tablist"
      aria-label="Choose platform"
      className="relative inline-flex w-full items-center gap-1 rounded-2xl border border-border bg-card p-1.5 sm:w-auto"
    >
      {platforms.map((p) => {
        const isActive = selected === p.id;
        return (
          <button
            key={p.id}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onSelect(p.id)}
            className={cn(
              "relative flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-display text-sm font-semibold transition-colors sm:flex-initial sm:px-6",
              isActive
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {isActive && (
              <motion.span
                layoutId="platform-tab-indicator"
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary to-accent shadow-[0_0_20px_-4px_hsl(var(--primary)/0.6)]"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <img
              src={p.logo}
              alt=""
              width={20}
              height={20}
              loading="lazy"
              className="relative h-5 w-5 object-contain"
            />
            <span className="relative hidden sm:inline">{p.label}</span>
            <span className="relative sm:hidden">{p.short}</span>
          </button>
        );
      })}
    </div>
  );
}
