import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const niches = [
  { id: "motivation", label: "💪 Motivation" },
  { id: "finance", label: "💰 Finance" },
  { id: "education", label: "📚 Education" },
  { id: "fitness", label: "🏋️ Fitness" },
  { id: "comedy", label: "😂 Comedy" },
  { id: "travel", label: "✈️ Travel" },
  { id: "technology", label: "💻 Technology" },
  { id: "beauty", label: "💄 Beauty" },
  { id: "food", label: "🍕 Food & Cooking" },
  { id: "health", label: "🧘 Health & Wellness" },
  { id: "gaming", label: "🎮 Gaming" },
  { id: "music", label: "🎵 Music" },
  { id: "fashion", label: "👗 Fashion" },
  { id: "sports", label: "⚽ Sports" },
  { id: "pets", label: "🐾 Pets & Animals" },
  { id: "diy", label: "🔨 DIY & Crafts" },
  { id: "parenting", label: "👶 Parenting" },
  { id: "business", label: "📈 Business & Startups" },
  { id: "science", label: "🔬 Science" },
  { id: "art", label: "🎨 Art & Design" },
  { id: "relationships", label: "❤️ Relationships" },
  { id: "productivity", label: "⏱️ Productivity" },
  { id: "mindset", label: "🧠 Mindset" },
  { id: "realestate", label: "🏠 Real Estate" },
  { id: "crypto", label: "🪙 Crypto & Web3" },
] as const;

export type Niche = (typeof niches)[number]["id"];

interface NicheSelectorProps {
  selected: Niche;
  onSelect: (niche: Niche) => void;
}

export function NicheSelector({ selected, onSelect }: NicheSelectorProps) {
  return (
    <Select value={selected} onValueChange={(v) => onSelect(v as Niche)}>
      <SelectTrigger className="w-full border-border bg-card font-display text-foreground sm:w-[260px]">
        <SelectValue placeholder="Select a niche" />
      </SelectTrigger>
      <SelectContent className="border-border bg-card max-h-[300px]">
        {niches.map((n) => (
          <SelectItem key={n.id} value={n.id} className="font-display">
            {n.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
