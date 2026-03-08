import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "@/components/admin/StatCard";
import { Users, FileText, Activity, Zap, DollarSign, TrendingUp } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalArticles, setTotalArticles] = useState(0);
  const [todayArticles, setTodayArticles] = useState(0);
  const [totalRequests, setTotalRequests] = useState(0);
  const [dailyData, setDailyData] = useState<{ date: string; count: number }[]>([]);
  const [recentArticles, setRecentArticles] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [usersRes, articlesRes, todayRes, requestsRes, dailyRes, recentArtRes, recentUsrRes] = await Promise.all([
        supabase.rpc("admin_get_total_users"),
        supabase.rpc("admin_get_total_articles"),
        supabase.rpc("admin_get_today_articles"),
        supabase.rpc("admin_get_total_ideas"),
        supabase.rpc("admin_get_daily_articles", { days: 14 }),
        supabase.rpc("admin_get_recent_articles", { lim: 5 }),
        supabase.rpc("admin_get_recent_users", { lim: 5 }),
      ]);

      if (usersRes.data != null) setTotalUsers(usersRes.data);
      if (articlesRes.data != null) setTotalArticles(articlesRes.data);
      if (todayRes.data != null) setTodayArticles(todayRes.data);
      if (requestsRes.data != null) setTotalRequests(requestsRes.data);
      if (dailyRes.data) setDailyData(dailyRes.data.map((d: any) => ({ date: d.date.slice(5), count: Number(d.count) })));
      if (recentArtRes.data) setRecentArticles(recentArtRes.data);
      if (recentUsrRes.data) setRecentUsers(recentUsrRes.data);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading dashboard…</div>;
  }

  const estRevenue = `$${(totalUsers * 4.5).toFixed(0)}`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold">Dashboard Overview</h1>
        <p className="text-sm text-muted-foreground">Welcome back. Here's what's happening with your platform.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Total Users" value={totalUsers} icon={Users} />
        <StatCard title="Total Articles" value={totalArticles} icon={FileText} />
        <StatCard title="Today's Articles" value={todayArticles} icon={TrendingUp} />
        <StatCard title="API Requests" value={totalRequests} icon={Activity} />
        <StatCard title="Est. Revenue" value={estRevenue} icon={DollarSign} description="~$4.50/user avg" />
      </div>

      {/* Chart */}
      <div className="card-gradient rounded-xl border border-border p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Daily Article Generation (14 Days)</h2>
        <ResponsiveContainer width="100%" height={300}>
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

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Articles */}
        <div className="card-gradient rounded-xl border border-border p-6">
          <h2 className="mb-4 font-display text-lg font-semibold">Recent Articles</h2>
          <div className="space-y-3">
            {recentArticles.length === 0 && <p className="text-sm text-muted-foreground">No articles yet</p>}
            {recentArticles.map((a: any) => (
              <div key={a.id} className="flex items-center justify-between rounded-lg border border-border bg-background/50 p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.user_email} · {format(new Date(a.created_at), "MMM d, HH:mm")}</p>
                </div>
                <Badge variant="secondary" className="ml-2 shrink-0">{a.category}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <div className="card-gradient rounded-xl border border-border p-6">
          <h2 className="mb-4 font-display text-lg font-semibold">New Registrations</h2>
          <div className="space-y-3">
            {recentUsers.length === 0 && <p className="text-sm text-muted-foreground">No users yet</p>}
            {recentUsers.map((u: any) => (
              <div key={u.id} className="flex items-center justify-between rounded-lg border border-border bg-background/50 p-3">
                <div>
                  <p className="text-sm font-medium">{u.email}</p>
                  <p className="text-xs text-muted-foreground">Joined {format(new Date(u.created_at), "MMM d, yyyy")}</p>
                </div>
                <Badge variant="outline">New</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
