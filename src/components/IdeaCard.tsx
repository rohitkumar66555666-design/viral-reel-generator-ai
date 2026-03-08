import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface ReelIdea {
  id: number;
  title: string;
  hook: string;
  script: string;
  caption: string;
  hashtags: string;
  viralScore: number;
}

function ViralScoreBadge({ score }: { score: number }) {
  const color =
    score >= 85
      ? "from-primary to-accent"
      : score >= 65
        ? "from-primary/70 to-accent/70"
        : "from-muted-foreground/50 to-muted-foreground/30";

  return (
    <div className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${color} px-3 py-1 text-xs font-bold text-primary-foreground`}>
      <Zap className="h-3 w-3" />
      {score}%
    </div>
  );
}

function CopyBtn({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(`${label} copied!`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className="gap-1 text-xs text-muted-foreground hover:text-primary"
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {label}
    </Button>
  );
}

export function IdeaCard({ idea, index }: { idea: ReelIdea; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="card-gradient rounded-xl border border-border p-5 transition-all hover:border-primary/30 hover:glow-shadow"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="font-display text-base font-semibold text-foreground">
          <span className="mr-2 text-muted-foreground">#{idea.id}</span>
          {idea.title}
        </h3>
        <ViralScoreBadge score={idea.viralScore} />
      </div>

      <div className="mb-3 rounded-lg bg-muted/50 p-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">🎣 Hook (First 3s)</p>
        <p className="mt-1 text-sm text-foreground">{idea.hook}</p>
      </div>

      <div className="mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">📝 Script</p>
        <p className="mt-1 text-sm leading-relaxed text-foreground/80">{idea.script}</p>
      </div>

      <div className="mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">✍️ Caption</p>
        <p className="mt-1 text-sm text-foreground/80">{idea.caption}</p>
      </div>

      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"># Hashtags</p>
        <p className="mt-1 text-sm text-primary/80">{idea.hashtags}</p>
      </div>

      <div className="flex flex-wrap gap-1 border-t border-border pt-3">
        <CopyBtn text={idea.script} label="Script" />
        <CopyBtn text={idea.caption} label="Caption" />
        <CopyBtn text={idea.hashtags} label="Hashtags" />
      </div>
    </motion.div>
  );
}
