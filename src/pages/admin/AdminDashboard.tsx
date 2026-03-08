import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "@/components/admin/StatCard";
import { Users, Activity, TrendingUp, Zap, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { downloadCSV } from "@/lib/csv-export";
import { format } from "date-fns";

export default function AdminDashboard() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalIdeas, setTotalIdeas] = useState(0);
  const [todayIdeas, setTodayIdeas] = useState(0);
  const [dailyData, setDailyData] = useState<{ date: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [usersRes, ideasRes, todayRes, dailyRes] = await Promise.all([
        supabase.rpc("admin_get_total_users"),
        supabase.rpc("admin_get_total_ideas"),
        supabase.rpc("admin_get_today_ideas"),
        supabase.rpc("admin_get_daily_usage", { days: 14 }),
      ]);

      if (usersRes.data != null) setTotalUsers(usersRes.data);
      if (ideasRes.data != null) setTotalIdeas(ideasRes.data);
      if (todayRes.data != null) setTodayIdeas(todayRes.data);
      if (dailyRes.data) setDailyData(dailyRes.data.map((d: any) => ({ date: d.date.slice(5), count: Number(d.count) })));
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading analytics…</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of your platform</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            downloadCSV(
              `analytics-${format(new Date(), "yyyy-MM-dd")}.csv`,
              ["Date", "Ideas Generated"],
              dailyData.map((d) => [d.date, d.count])
            )
          }
          disabled={dailyData.length === 0}
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={totalUsers} icon={Users} />
        <StatCard title="Total Ideas Generated" value={totalIdeas} icon={TrendingUp} />
        <StatCard title="Today's Ideas" value={todayIdeas} icon={Activity} />
        <StatCard
          title="Est. API Cost (Today)"
          value={`$${(todayIdeas * 0.002).toFixed(2)}`}
          icon={Zap}
          description="~$0.002 per request"
        />
      </div>

      <div className="card-gradient rounded-xl border border-border p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Daily Usage (Last 14 Days)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(240,10%,18%)" />
            <XAxis dataKey="date" tick={{ fill: "hsl(220,15%,55%)", fontSize: 12 }} />
            <YAxis tick={{ fill: "hsl(220,15%,55%)", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(240,12%,10%)",
                border: "1px solid hsl(240,10%,18%)",
                borderRadius: "8px",
                color: "hsl(210,40%,96%)",
              }}
            />
            <Bar dataKey="count" fill="hsl(180,80%,55%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
