import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const languages = [
  { id: "english", label: "🇬🇧 English" },
  { id: "hindi", label: "🇮🇳 Hindi" },
  { id: "spanish", label: "🇪🇸 Spanish" },
  { id: "french", label: "🇫🇷 French" },
  { id: "portuguese", label: "🇧🇷 Portuguese" },
  { id: "arabic", label: "🇸🇦 Arabic" },
  { id: "german", label: "🇩🇪 German" },
  { id: "japanese", label: "🇯🇵 Japanese" },
  { id: "korean", label: "🇰🇷 Korean" },
  { id: "indonesian", label: "🇮🇩 Indonesian" },
] as const;

export type Language = (typeof languages)[number]["id"];

interface LanguageSelectorProps {
  selected: Language;
  onSelect: (language: Language) => void;
}

export function LanguageSelector({ selected, onSelect }: LanguageSelectorProps) {
  return (
    <Select value={selected} onValueChange={(v) => onSelect(v as Language)}>
      <SelectTrigger className="w-full border-border bg-card font-display text-foreground sm:w-[260px]">
        <SelectValue placeholder="Select a language" />
      </SelectTrigger>
      <SelectContent className="border-border bg-card">
        {languages.map((l) => (
          <SelectItem key={l.id} value={l.id} className="font-display">
            {l.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
