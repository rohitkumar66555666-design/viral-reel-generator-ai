import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, Cpu } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface SettingsMap { [key: string]: string; }

const aiModels = [
  "google/gemini-3-flash-preview",
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

  const update = (key: string, value: string) => setSettings((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    setSaving(true);
    for (const [key, value] of Object.entries(settings)) {
      const { data } = await supabase.from("app_settings").update({ value, updated_at: new Date().toISOString() }).eq("key", key).select();
      if (!data || data.length === 0) await supabase.from("app_settings").insert({ key, value });
    }
    toast.success("AI configuration saved!");
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading configuration…</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold">AI Settings</h1>
        <p className="text-sm text-muted-foreground">Configure AI prompts and generation parameters for reel ideas</p>
      </div>

      <div className="max-w-2xl space-y-6">
        <div className="card-gradient rounded-xl border border-border p-6 space-y-4">
          <div className="flex items-center gap-2"><Cpu className="h-5 w-5 text-primary" /><h3 className="font-display font-semibold">AI Model</h3></div>
          <div className="space-y-2">
            <Label>Default Model</Label>
            <Select value={settings.ai_model || "google/gemini-3-flash-preview"} onValueChange={(v) => update("ai_model", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{aiModels.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        <div className="card-gradient rounded-xl border border-border p-6 space-y-4">
          <h3 className="font-display font-semibold">Generation Settings</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>Max Tokens</Label><Input type="number" value={settings.ai_max_tokens || "2048"} onChange={(e) => update("ai_max_tokens", e.target.value)} /></div>
            <div className="space-y-2"><Label>Temperature (0-1)</Label><Input type="number" step="0.1" min="0" max="1" value={settings.ai_temperature || "0.8"} onChange={(e) => update("ai_temperature", e.target.value)} /></div>
            <div className="space-y-2"><Label>Ideas per Request</Label><Input type="number" value={settings.ideas_per_request || "3"} onChange={(e) => update("ideas_per_request", e.target.value)} /></div>
            <div className="space-y-2"><Label>Max Ideas/Day (Free)</Label><Input type="number" value={settings.free_daily_limit || "5"} onChange={(e) => update("free_daily_limit", e.target.value)} /></div>
          </div>
        </div>

        <div className="card-gradient rounded-xl border border-border p-6 space-y-4">
          <h3 className="font-display font-semibold">System Prompt</h3>
          <Textarea
            value={settings.ai_system_prompt || "You are a viral reel idea generator. Generate creative, engaging short-form video ideas with hooks, scripts, captions, and hashtags."}
            onChange={(e) => update("ai_system_prompt", e.target.value)}
            rows={5}
          />
        </div>

        <div className="card-gradient rounded-xl border border-border p-6 space-y-4">
          <h3 className="font-display font-semibold">Output Format</h3>
          <div className="space-y-3">
            {[
              { key: "output_hook", label: "Include Hook" },
              { key: "output_script", label: "Include Script" },
              { key: "output_caption", label: "Include Caption" },
              { key: "output_hashtags", label: "Include Hashtags" },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <Label>{label}</Label>
                <Switch checked={settings[key] !== "false"} onCheckedChange={(c) => update(key, c ? "true" : "false")} />
              </div>
            ))}
          </div>
        </div>

        <Button variant="gradient" onClick={save} disabled={saving} className="w-full">
          <Save className="mr-2 h-4 w-4" />{saving ? "Saving…" : "Save Configuration"}
        </Button>
      </div>
    </div>
  );
}
