import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Zap, Bookmark, ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { IdeaCard, type ReelIdea } from "@/components/IdeaCard";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function SavedIdeas() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState<(ReelIdea & { dbId: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchSaved();
  }, [user, authLoading]);

  const fetchSaved = async () => {
    const { data, error } = await supabase
      .from("saved_ideas")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load saved ideas");
      console.error(error);
    } else {
      setIdeas(
        (data || []).map((row, i) => ({
          id: i + 1,
          dbId: row.id,
          title: row.title,
          hook: row.hook,
          script: row.script,
          caption: row.caption,
          hashtags: row.hashtags,
          viralScore: row.viral_score,
        }))
      );
    }
    setLoading(false);
  };

  const handleRemove = async (idea: ReelIdea) => {
    const item = ideas.find((i) => i.id === idea.id);
    if (!item) return;

    const { error } = await supabase.from("saved_ideas").delete().eq("id", item.dbId);
    if (error) {
      toast.error("Failed to remove idea");
    } else {
      setIdeas((prev) => prev.filter((i) => i.dbId !== item.dbId));
      toast.success("Idea removed from saved");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <h1 className="font-display text-xl font-bold">
              <span className="gradient-text">Viral Reel</span>{" "}
              <span className="text-foreground">Generator</span>
            </h1>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        </div>
      </header>

      <main className="container py-8 sm:py-12">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3">
            <Bookmark className="h-7 w-7 text-primary" />
            <h2 className="font-display text-2xl font-bold sm:text-3xl">Saved Ideas</h2>
          </div>
          <p className="mt-2 text-muted-foreground">Your bookmarked viral reel ideas</p>
        </motion.div>

        {loading ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : ideas.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted">
              <Bookmark className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="font-display text-lg text-muted-foreground">
              No saved ideas yet. Generate some ideas and bookmark your favorites!
            </p>
            <Button variant="gradient" onClick={() => navigate("/")}>
              Generate Ideas
            </Button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {ideas.map((idea, i) => (
              <IdeaCard key={idea.dbId} idea={idea} index={i} onRemove={handleRemove} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
