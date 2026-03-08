import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlatformSelector, type Platform } from "@/components/PlatformSelector";
import { NicheSelector, type Niche } from "@/components/NicheSelector";
import { IdeaCard, type ReelIdea } from "@/components/IdeaCard";
import { getMockIdeas } from "@/lib/mock-ideas";

const Index = () => {
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [niche, setNiche] = useState<Niche>("motivation");
  const [ideas, setIdeas] = useState<ReelIdea[]>([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setIdeas([]);
    // Simulate AI generation delay
    await new Promise((r) => setTimeout(r, 1500));
    setIdeas(getMockIdeas(niche, platform));
    setLoading(false);
    setGenerated(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <h1 className="font-display text-xl font-bold">
              <span className="gradient-text">Viral Reel</span>{" "}
              <span className="text-foreground">Generator</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:block">5 free ideas/day</span>
            <Button variant="outline" size="sm">Sign In</Button>
            <Button variant="gradient" size="sm">Go Pro ✨</Button>
          </div>
        </div>
      </header>

      {/* Hero / Controls */}
      <main className="container py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Generate <span className="gradient-text">Viral Reel Ideas</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            AI-powered hooks, scripts, captions & hashtags for Instagram Reels, Facebook Reels, and YouTube Shorts.
          </p>
        </motion.div>

        {/* Controls */}
        <div className="mx-auto mb-10 max-w-2xl space-y-6">
          <div>
            <label className="mb-2 block font-display text-sm font-medium text-muted-foreground">
              Platform
            </label>
            <PlatformSelector selected={platform} onSelect={setPlatform} />
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-2 block font-display text-sm font-medium text-muted-foreground">
                Niche
              </label>
              <NicheSelector selected={niche} onSelect={setNiche} />
            </div>
            <Button
              variant="gradient"
              size="lg"
              onClick={handleGenerate}
              disabled={loading}
              className="animate-pulse-glow sm:w-auto"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {loading ? "Generating…" : "Generate Ideas"}
            </Button>
          </div>
        </div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 py-16"
            >
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
              <p className="font-display text-muted-foreground">Crafting viral ideas…</p>
            </motion.div>
          )}

          {!loading && ideas.length > 0 && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="mb-6 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="font-display text-lg font-semibold">
                  {ideas.length} Viral Ideas Generated
                </h3>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                {ideas.map((idea, i) => (
                  <IdeaCard key={idea.id} idea={idea} index={i} />
                ))}
              </div>
            </motion.div>
          )}

          {!loading && !generated && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4 py-16 text-center"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <p className="font-display text-lg text-muted-foreground">
                Select your platform & niche, then hit generate!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Index;
