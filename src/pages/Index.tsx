import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Zap, Loader2, LogOut, Bookmark, User, Shield } from "lucide-react";
import { ContactFeedbackDialog } from "@/components/ContactFeedbackDialog";
import { useAdminRole } from "@/hooks/useAdminRole";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlatformSelector, type Platform } from "@/components/PlatformSelector";
import { NicheSelector, type Niche } from "@/components/NicheSelector";
import { LanguageSelector, type Language } from "@/components/LanguageSelector";
import { IdeaCard, type ReelIdea } from "@/components/IdeaCard";
import { UpgradeDialog } from "@/components/UpgradeDialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DEFAULT_FREE_LIMIT = 5;

const Index = () => {
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [niche, setNiche] = useState<Niche>("motivation");
  const [ideas, setIdeas] = useState<ReelIdea[]>([]);
  const [language, setLanguage] = useState<Language>("english");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [savedTitles, setSavedTitles] = useState<Set<string>>(new Set());
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [dailyLimit, setDailyLimit] = useState(DEFAULT_FREE_LIMIT);
  const [planName, setPlanName] = useState("Free");
  const { user, loading: authLoading, signOut } = useAuth();
  const { isAdmin } = useAdminRole();
  const navigate = useNavigate();

  // Load user subscription to get actual daily limit
  useEffect(() => {
    if (!user) return;
    const loadSubscription = async () => {
      const { data } = await supabase
        .from("user_subscriptions")
        .select("daily_limit, plan_name, status, expires_at")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      if (data && data.expires_at && new Date(data.expires_at) > new Date()) {
        setDailyLimit(data.daily_limit);
        setPlanName(data.plan_name);
      } else {
        setDailyLimit(DEFAULT_FREE_LIMIT);
        setPlanName("Free");
      }
    };
    loadSubscription();
  }, [user]);

  // Redirect non-logged-in users to landing page
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/", { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Load profile preferences as defaults
  useEffect(() => {
    if (!user) return;
    const loadProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("preferred_platform, preferred_niche, preferred_language")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        if (data.preferred_platform) setPlatform(data.preferred_platform as Platform);
        if (data.preferred_niche) setNiche(data.preferred_niche as Niche);
        if (data.preferred_language) setLanguage(data.preferred_language as Language);
      }
    };
    loadProfile();
  }, [user]);

  const handleBookmark = async (idea: ReelIdea) => {
    if (!user) { navigate("/auth"); return; }
    if (savedTitles.has(idea.title)) {
      toast.info("Already saved!");
      return;
    }
    const { error } = await supabase.from("saved_ideas").insert({
      user_id: user.id,
      title: idea.title,
      hook: idea.hook,
      script: idea.script,
      caption: idea.caption,
      hashtags: idea.hashtags,
      viral_score: idea.viralScore,
      platform,
      niche,
    });
    if (error) {
      toast.error("Failed to save idea");
      console.error(error);
    } else {
      setSavedTitles((prev) => new Set(prev).add(idea.title));
      toast.success("Idea saved! ⭐");
    }
  };

  const handleGenerate = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    // Check daily usage
    const { data: usageCount, error: usageError } = await supabase.rpc("get_today_usage_count", {
      p_user_id: user.id,
    });

    if (usageError) {
      toast.error("Failed to check usage. Try again.");
      return;
    }

    if ((usageCount ?? 0) >= dailyLimit) {
      setShowUpgrade(true);
      return;
    }

    setLoading(true);
    setIdeas([]);

    try {
      const { data, error } = await supabase.functions.invoke("generate-ideas", {
        body: { platform, niche, language },
      });

      if (error) {
        throw new Error(error.message || "Failed to generate ideas");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      const generatedIdeas: ReelIdea[] = data.ideas;
      setIdeas(generatedIdeas);
      setGenerated(true);

      // Log usage
      await supabase.from("usage_logs").insert({ user_id: user.id });
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Failed to generate ideas");
    } finally {
      setLoading(false);
    }
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
            {user ? (
              <>
                <span className="hidden text-sm text-muted-foreground sm:block">
                  {dailyLimit} {planName === "Free" ? "free" : planName} ideas/day
                </span>
                <Button variant="gradient" size="sm">Go Pro ✨</Button>
                <Button variant="ghost" size="sm" onClick={() => navigate("/saved")} title="Saved ideas">
                  <Bookmark className="mr-1 h-4 w-4" /> Saved
                </Button>
                <Button variant="ghost" size="icon" onClick={() => navigate("/profile")} title="Profile">
                  <User className="h-4 w-4" />
                </Button>
                {isAdmin && (
                  <Button variant="ghost" size="icon" onClick={() => navigate("/admin")} title="Admin Panel">
                    <Shield className="h-4 w-4" />
                  </Button>
                )}
                <ContactFeedbackDialog />
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>
                  Sign In
                </Button>
                <Button variant="gradient" size="sm" onClick={() => navigate("/auth")}>
                  Get Started
                </Button>
              </>
            )}
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
            <div className="flex-1">
              <label className="mb-2 block font-display text-sm font-medium text-muted-foreground">
                Output Language
              </label>
              <LanguageSelector selected={language} onSelect={setLanguage} />
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
              {loading ? "Generating…" : user ? "Generate Ideas" : "Sign In to Generate"}
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
              <p className="font-display text-muted-foreground">AI is crafting viral ideas…</p>
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
                  <IdeaCard
                    key={idea.id}
                    idea={idea}
                    index={i}
                    isSaved={savedTitles.has(idea.title)}
                    onBookmark={handleBookmark}
                  />
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
                {user
                  ? "Select your platform & feature, then hit generate!"
                  : "Sign in to start generating viral reel ideas!"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <UpgradeDialog open={showUpgrade} onOpenChange={setShowUpgrade} />
      </main>
    </div>
  );
};

export default Index;
