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
      <SelectContent className="border-border bg-card">
        {niches.map((n) => (
          <SelectItem key={n.id} value={n.id} className="font-display">
            {n.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
