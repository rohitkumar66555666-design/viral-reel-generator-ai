import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save } from "lucide-react";

interface SettingsMap {
  [key: string]: string;
}

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

  const update = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const save = async () => {
    setSaving(true);
    for (const [key, value] of Object.entries(settings)) {
      await supabase
        .from("app_settings")
        .update({ value, updated_at: new Date().toISOString() })
        .eq("key", key);
    }
    toast.success("Settings saved!");
    setSaving(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading settings…</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Control app configuration</p>
      </div>

      <div className="max-w-lg space-y-8">
        {/* Free plan limit */}
        <div className="card-gradient rounded-xl border border-border p-6 space-y-4">
          <h3 className="font-display font-semibold">Free Plan Limits</h3>
          <div className="space-y-2">
            <Label htmlFor="free_daily_limit">Ideas per day (free users)</Label>
            <Input
              id="free_daily_limit"
              type="number"
              value={settings.free_daily_limit || "5"}
              onChange={(e) => update("free_daily_limit", e.target.value)}
            />
          </div>
        </div>

        {/* Premium toggle */}
        <div className="card-gradient rounded-xl border border-border p-6 space-y-4">
          <h3 className="font-display font-semibold">Premium Features</h3>
          <div className="flex items-center justify-between">
            <Label htmlFor="premium_enabled">Enable premium features</Label>
            <Switch
              id="premium_enabled"
              checked={settings.premium_enabled === "true"}
              onCheckedChange={(checked) => update("premium_enabled", checked ? "true" : "false")}
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="card-gradient rounded-xl border border-border p-6 space-y-4">
          <h3 className="font-display font-semibold">Pricing Plans</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="free_plan_price">Free ($)</Label>
              <Input
                id="free_plan_price"
                type="number"
                value={settings.free_plan_price || "0"}
                onChange={(e) => update("free_plan_price", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pro_plan_price">Pro ($)</Label>
              <Input
                id="pro_plan_price"
                type="number"
                value={settings.pro_plan_price || "9"}
                onChange={(e) => update("pro_plan_price", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agency_plan_price">Agency ($)</Label>
              <Input
                id="agency_plan_price"
                type="number"
                value={settings.agency_plan_price || "29"}
                onChange={(e) => update("agency_plan_price", e.target.value)}
              />
            </div>
          </div>
        </div>

        <Button variant="gradient" onClick={save} disabled={saving} className="w-full">
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving…" : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
