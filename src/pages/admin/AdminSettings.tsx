import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save } from "lucide-react";

interface SettingsMap { [key: string]: string; }

export default function AdminSettings() {
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
    toast.success("Settings saved!");
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading settings…</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold">System Settings</h1>
        <p className="text-sm text-muted-foreground">Application-wide configurations</p>
      </div>

      <div className="max-w-lg space-y-8">
        <div className="card-gradient rounded-xl border border-border p-6 space-y-4">
          <h3 className="font-display font-semibold">Branding</h3>
          <div className="space-y-2"><Label>App Name</Label><Input value={settings.app_name || "Viral Reels Idea Generator AI"} onChange={(e) => update("app_name", e.target.value)} /></div>
          <div className="space-y-2"><Label>Support Email</Label><Input type="email" value={settings.support_email || ""} onChange={(e) => update("support_email", e.target.value)} placeholder="support@example.com" /></div>
        </div>

        <div className="card-gradient rounded-xl border border-border p-6 space-y-4">
          <h3 className="font-display font-semibold">SMTP / Email</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>SMTP Host</Label><Input value={settings.smtp_host || ""} onChange={(e) => update("smtp_host", e.target.value)} placeholder="smtp.gmail.com" /></div>
            <div className="space-y-2"><Label>SMTP Port</Label><Input value={settings.smtp_port || "587"} onChange={(e) => update("smtp_port", e.target.value)} /></div>
          </div>
        </div>

        <div className="card-gradient rounded-xl border border-border p-6 space-y-4">
          <h3 className="font-display font-semibold">Features</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between"><Label>Maintenance Mode</Label><Switch checked={settings.maintenance_mode === "true"} onCheckedChange={(c) => update("maintenance_mode", c ? "true" : "false")} /></div>
            <div className="flex items-center justify-between"><Label>Enable Premium Features</Label><Switch checked={settings.premium_enabled === "true"} onCheckedChange={(c) => update("premium_enabled", c ? "true" : "false")} /></div>
            <div className="flex items-center justify-between"><Label>Enable User Registration</Label><Switch checked={settings.registration_enabled !== "false"} onCheckedChange={(c) => update("registration_enabled", c ? "true" : "false")} /></div>
          </div>
        </div>

        <Button variant="gradient" onClick={save} disabled={saving} className="w-full">
          <Save className="mr-2 h-4 w-4" />{saving ? "Saving…" : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
