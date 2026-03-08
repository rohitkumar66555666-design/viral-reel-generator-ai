import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "@/components/admin/StatCard";
import { Activity, Lightbulb, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminApiUsage() {
  const [dailyData, setDailyData] = useState<{ date: string; count: number }[]>([]);
  const [totalRequests, setTotalRequests] = useState(0);
  const [todayIdeas, setTodayIdeas] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [dailyRes, totalRes, todayRes] = await Promise.all([
        supabase.rpc("admin_get_daily_usage", { days: 30 }),
        supabase.rpc("admin_get_total_ideas"),
        supabase.rpc("admin_get_today_ideas"),
      ]);
      if (dailyRes.data) setDailyData(dailyRes.data.map((d: any) => ({ date: d.date.slice(5), count: Number(d.count) })));
      if (totalRes.data != null) setTotalRequests(totalRes.data);
      if (todayRes.data != null) setTodayIdeas(todayRes.data);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading API usage…</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold">API Usage</h1>
        <p className="text-sm text-muted-foreground">Monitor AI generation requests and usage patterns</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total AI Requests" value={totalRequests} icon={Activity} />
        <StatCard title="Ideas Today" value={todayIdeas} icon={TrendingUp} />
        <StatCard title="Est. Cost" value={`$${(totalRequests * 0.002).toFixed(2)}`} icon={Lightbulb} description="~$0.002/request" />
      </div>

      <div className="card-gradient rounded-xl border border-border p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Daily Requests (30 Days)</h2>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
            <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }} />
            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
