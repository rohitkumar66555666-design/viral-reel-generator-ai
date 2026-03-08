import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "@/components/admin/StatCard";
import { Activity, DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminApiUsage() {
  const [dailyData, setDailyData] = useState<{ date: string; count: number }[]>([]);
  const [totalRequests, setTotalRequests] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [dailyRes, totalRes] = await Promise.all([
        supabase.rpc("admin_get_daily_usage", { days: 30 }),
        supabase.rpc("admin_get_total_ideas"),
      ]);

      if (dailyRes.data) {
        setDailyData(dailyRes.data.map((d: any) => ({ date: d.date.slice(5), count: Number(d.count) })));
      }
      if (totalRes.data != null) setTotalRequests(totalRes.data);
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
        <h1 className="font-display text-2xl font-bold">API Usage Monitoring</h1>
        <p className="text-sm text-muted-foreground">Track AI request volume and costs</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard title="Total AI Requests" value={totalRequests} icon={Activity} />
        <StatCard title="Estimated Total Cost" value={`$${estCost}`} icon={DollarSign} description="Based on ~$0.002 per request" />
      </div>

      <div className="card-gradient rounded-xl border border-border p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Requests (Last 30 Days)</h2>
        <ResponsiveContainer width="100%" height={350}>
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
            <Bar dataKey="count" fill="hsl(270,70%,60%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
