import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Save, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LanguageSelector, type Language } from "@/components/LanguageSelector";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [preferredPlatform, setPreferredPlatform] = useState("tiktok");
  const [preferredNiche, setPreferredNiche] = useState("fitness");
  const [preferredLanguage, setPreferredLanguage] = useState<Language>("english");

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setDisplayName(data.display_name || "");
        setPreferredPlatform(data.preferred_platform || "tiktok");
        setPreferredNiche(data.preferred_niche || "fitness");
        setPreferredLanguage((data.preferred_language as Language) || "english");
      } else if (!error) {
        // Profile doesn't exist yet — create one
        await supabase.from("profiles").insert({ user_id: user.id });
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user, navigate]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName,
        preferred_platform: preferredPlatform,
        preferred_niche: preferredNiche,
        preferred_language: preferredLanguage,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (error) toast.error("Failed to save profile");
    else toast.success("Profile saved!");
    setSaving(false);
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-background text-foreground">Loading…</div>;

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-md">
        <button onClick={() => navigate("/")} className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </button>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Profile Settings</h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-5 rounded-xl border border-border bg-card p-6">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" className="border-border bg-background" />
          </div>

          <div className="space-y-2">
            <Label>Preferred Platform</Label>
            <Select value={preferredPlatform} onValueChange={setPreferredPlatform}>
              <SelectTrigger className="border-border bg-background"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="instagram">Instagram Reels</SelectItem>
                <SelectItem value="youtube">YouTube Shorts</SelectItem>
                <SelectItem value="twitter">Twitter/X</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Preferred Feature</Label>
            <Select value={preferredNiche} onValueChange={setPreferredNiche}>
              <SelectTrigger className="border-border bg-background"><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectItem value="motivation">💪 Motivation</SelectItem>
                <SelectItem value="finance">💰 Finance</SelectItem>
                <SelectItem value="education">📚 Education</SelectItem>
                <SelectItem value="fitness">🏋️ Fitness</SelectItem>
                <SelectItem value="comedy">😂 Comedy</SelectItem>
                <SelectItem value="travel">✈️ Travel</SelectItem>
                <SelectItem value="technology">💻 Technology</SelectItem>
                <SelectItem value="beauty">💄 Beauty</SelectItem>
                <SelectItem value="food">🍕 Food & Cooking</SelectItem>
                <SelectItem value="health">🧘 Health & Wellness</SelectItem>
                <SelectItem value="gaming">🎮 Gaming</SelectItem>
                <SelectItem value="music">🎵 Music</SelectItem>
                <SelectItem value="fashion">👗 Fashion</SelectItem>
                <SelectItem value="sports">⚽ Sports</SelectItem>
                <SelectItem value="pets">🐾 Pets & Animals</SelectItem>
                <SelectItem value="diy">🔨 DIY & Crafts</SelectItem>
                <SelectItem value="parenting">👶 Parenting</SelectItem>
                <SelectItem value="business">📈 Business & Startups</SelectItem>
                <SelectItem value="science">🔬 Science</SelectItem>
                <SelectItem value="art">🎨 Art & Design</SelectItem>
                <SelectItem value="relationships">❤️ Relationships</SelectItem>
                <SelectItem value="productivity">⏱️ Productivity</SelectItem>
                <SelectItem value="mindset">🧠 Mindset</SelectItem>
                <SelectItem value="realestate">🏠 Real Estate</SelectItem>
                <SelectItem value="crypto">🪙 Crypto & Web3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Preferred Output Language</Label>
            <LanguageSelector selected={preferredLanguage} onSelect={setPreferredLanguage} />
          </div>

          <Button variant="gradient" className="w-full gap-2" onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : "Save Profile"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
