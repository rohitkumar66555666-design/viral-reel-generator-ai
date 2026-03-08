import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, Cpu } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface SettingsMap {
  [key: string]: string;
}

const aiModels = [
  "google/gemini-2.5-flash",
  "google/gemini-2.5-pro",
  "openai/gpt-5",
  "openai/gpt-5-mini",
  "openai/gpt-5-nano",
];

export default function AdminAIConfig() {
  const [settings, setSettings] = useState<SettingsMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.from("app_settings").select("key, value");
      if (error) toast.error("Failed to load settings");
      else {
        const map: SettingsMap = {};
        (data || []).forEach((s: any) => { map[s.key] = s.value; });
        setSettings(map);
      }
      setLoading(false);
    };
    load();
  }, []);

  const update = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const save = async () => {
    setSaving(true);
    const keys = Object.keys(settings);
    for (const key of keys) {
      // Upsert: try update, if no rows affected, insert
      const { data } = await supabase
        .from("app_settings")
        .update({ value: settings[key], updated_at: new Date().toISOString() })
        .eq("key", key)
        .select();
      if (!data || data.length === 0) {
        await supabase.from("app_settings").insert({ key, value: settings[key] });
      }
    }
    toast.success("AI configuration saved!");
    setSaving(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading configuration…</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold">AI Configuration</h1>
        <p className="text-sm text-muted-foreground">Configure AI model settings and generation parameters</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Model Selection */}
        <div className="card-gradient rounded-xl border border-border p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-primary" />
            <h3 className="font-display font-semibold">AI Model</h3>
          </div>
          <div className="space-y-2">
            <Label>Default Model</Label>
            <Select
              value={settings.ai_model || "google/gemini-2.5-flash"}
              onValueChange={(v) => update("ai_model", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {aiModels.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Generation Settings */}
        <div className="card-gradient rounded-xl border border-border p-6 space-y-4">
          <h3 className="font-display font-semibold">Generation Settings</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Max Tokens</Label>
              <Input
                type="number"
                value={settings.ai_max_tokens || "2048"}
                onChange={(e) => update("ai_max_tokens", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Temperature (0-1)</Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={settings.ai_temperature || "0.7"}
                onChange={(e) => update("ai_temperature", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Max Articles per Day (Free)</Label>
              <Input
                type="number"
                value={settings.free_daily_limit || "5"}
                onChange={(e) => update("free_daily_limit", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Max Articles per Day (Pro)</Label>
              <Input
                type="number"
                value={settings.pro_daily_limit || "50"}
                onChange={(e) => update("pro_daily_limit", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* System Prompt */}
        <div className="card-gradient rounded-xl border border-border p-6 space-y-4">
          <h3 className="font-display font-semibold">System Prompt</h3>
          <div className="space-y-2">
            <Label>Default System Instruction</Label>
            <Textarea
              value={settings.ai_system_prompt || "You are a professional article writer. Generate well-structured, engaging articles based on the given topic and instructions."}
              onChange={(e) => update("ai_system_prompt", e.target.value)}
              rows={4}
            />
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="card-gradient rounded-xl border border-border p-6 space-y-4">
          <h3 className="font-display font-semibold">Feature Toggles</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Enable SEO Optimization</Label>
              <Switch
                checked={settings.ai_seo_enabled === "true"}
                onCheckedChange={(c) => update("ai_seo_enabled", c ? "true" : "false")}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Enable Plagiarism Check</Label>
              <Switch
                checked={settings.ai_plagiarism_check === "true"}
                onCheckedChange={(c) => update("ai_plagiarism_check", c ? "true" : "false")}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Enable Auto-Publish</Label>
              <Switch
                checked={settings.ai_auto_publish === "true"}
                onCheckedChange={(c) => update("ai_auto_publish", c ? "true" : "false")}
              />
            </div>
          </div>
        </div>

        <Button variant="gradient" onClick={save} disabled={saving} className="w-full">
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving…" : "Save Configuration"}
        </Button>
      </div>
    </div>
  );
}
