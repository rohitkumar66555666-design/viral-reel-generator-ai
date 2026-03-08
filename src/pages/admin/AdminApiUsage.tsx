import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "@/components/admin/StatCard";
import { Activity, DollarSign, FileText, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminApiUsage() {
  const [dailyData, setDailyData] = useState<{ date: string; count: number }[]>([]);
  const [totalRequests, setTotalRequests] = useState(0);
  const [totalArticles, setTotalArticles] = useState(0);
  const [todayArticles, setTodayArticles] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [dailyRes, totalRes, articlesRes, todayRes] = await Promise.all([
        supabase.rpc("admin_get_daily_usage", { days: 30 }),
        supabase.rpc("admin_get_total_ideas"),
        supabase.rpc("admin_get_total_articles"),
        supabase.rpc("admin_get_today_articles"),
      ]);

      if (dailyRes.data) {
        setDailyData(dailyRes.data.map((d: any) => ({ date: d.date.slice(5), count: Number(d.count) })));
      }
      if (totalRes.data != null) setTotalRequests(totalRes.data);
      if (articlesRes.data != null) setTotalArticles(articlesRes.data);
      if (todayRes.data != null) setTodayArticles(todayRes.data);
      setLoading(false);
    };
    load();
  }, []);

  const estCost = (totalRequests * 0.002).toFixed(2);

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading API usage…</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold">API Usage & Analytics</h1>
        <p className="text-sm text-muted-foreground">Monitor AI requests, costs, and generation metrics</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total API Requests" value={totalRequests} icon={Activity} />
        <StatCard title="Total Articles" value={totalArticles} icon={FileText} />
        <StatCard title="Today's Articles" value={todayArticles} icon={TrendingUp} />
        <StatCard title="Est. Total Cost" value={`$${estCost}`} icon={DollarSign} description="~$0.002 per request" />
      </div>

      <div className="card-gradient rounded-xl border border-border p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">API Requests (Last 30 Days)</h2>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
            <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--foreground))",
              }}
            />
            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
