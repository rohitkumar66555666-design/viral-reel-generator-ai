import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(262, 83%, 58%)",
  "hsl(200, 98%, 39%)",
  "hsl(142, 76%, 36%)",
  "hsl(38, 92%, 50%)",
  "hsl(346, 87%, 43%)",
  "hsl(271, 81%, 56%)",
];

export default function AdminAnalytics() {
  const [nicheStats, setNicheStats] = useState<{ niche: string; count: number }[]>([]);
  const [platformStats, setPlatformStats] = useState<{ platform: string; count: number }[]>([]);
  const [dailyData, setDailyData] = useState<{ date: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [nicheRes, platformRes, dailyRes] = await Promise.all([
        supabase.rpc("admin_get_niche_stats"),
        supabase.rpc("admin_get_platform_stats"),
        supabase.rpc("admin_get_daily_usage", { days: 30 }),
      ]);
      if (nicheRes.data) setNicheStats(nicheRes.data.map((d: any) => ({ niche: d.niche, count: Number(d.count) })));
      if (platformRes.data) setPlatformStats(platformRes.data.map((d: any) => ({ platform: d.platform, count: Number(d.count) })));
      if (dailyRes.data) setDailyData(dailyRes.data.map((d: any) => ({ date: d.date.slice(5), count: Number(d.count) })));
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading analytics…</div>;

  const tooltipStyle = {
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    color: "hsl(var(--foreground))",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground">Insights into niche popularity, platform usage, and trends</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Niche Popularity */}
        <div className="card-gradient rounded-xl border border-border p-6">
          <h2 className="mb-4 font-display text-lg font-semibold">Most Popular Niches</h2>
          {nicheStats.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={nicheStats.slice(0, 10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <YAxis type="category" dataKey="niche" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} width={100} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Platform Distribution */}
        <div className="card-gradient rounded-xl border border-border p-6">
          <h2 className="mb-4 font-display text-lg font-semibold">Platform Distribution</h2>
          {platformStats.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={platformStats} dataKey="count" nameKey="platform" cx="50%" cy="50%" outerRadius={100} label={(e) => e.platform}>
                  {platformStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Daily trend */}
      <div className="card-gradient rounded-xl border border-border p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Daily Generation Trend (30 Days)</h2>
        {dailyData.length === 0 ? (
          <p className="text-sm text-muted-foreground">No data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
