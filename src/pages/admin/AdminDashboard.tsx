import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "@/components/admin/StatCard";
import { Users, Lightbulb, Activity, Zap, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalIdeas, setTotalIdeas] = useState(0);
  const [todayIdeas, setTodayIdeas] = useState(0);
  const [totalRequests, setTotalRequests] = useState(0);
  const [dailyData, setDailyData] = useState<{ date: string; count: number }[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [usersRes, ideasRes, todayRes, requestsRes, dailyRes, recentUsrRes] = await Promise.all([
        supabase.rpc("admin_get_total_users"),
        supabase.rpc("admin_get_total_ideas"),
        supabase.rpc("admin_get_today_ideas"),
        supabase.rpc("admin_get_total_ideas"),
        supabase.rpc("admin_get_daily_usage", { days: 14 }),
        supabase.rpc("admin_get_recent_users", { lim: 5 }),
      ]);

      if (usersRes.data != null) setTotalUsers(usersRes.data);
      if (ideasRes.data != null) setTotalIdeas(ideasRes.data);
      if (todayRes.data != null) setTodayIdeas(todayRes.data);
      if (requestsRes.data != null) setTotalRequests(requestsRes.data);
      if (dailyRes.data) setDailyData(dailyRes.data.map((d: any) => ({ date: d.date.slice(5), count: Number(d.count) })));
      if (recentUsrRes.data) setRecentUsers(recentUsrRes.data);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading dashboard…</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold">Dashboard Overview</h1>
        <p className="text-sm text-muted-foreground">Welcome back. Here's what's happening with Viral Reels.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Total Users" value={totalUsers} icon={Users} />
        <StatCard title="Total Reel Ideas" value={totalIdeas} icon={Lightbulb} />
        <StatCard title="Ideas Today" value={todayIdeas} icon={TrendingUp} />
        <StatCard title="AI Requests" value={totalRequests} icon={Activity} />
        <StatCard title="Active Users" value={Math.round(totalUsers * 0.6)} icon={Zap} description="~60% est." />
      </div>

      <div className="card-gradient rounded-xl border border-border p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Daily Idea Generation (14 Days)</h2>
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
  );
}
