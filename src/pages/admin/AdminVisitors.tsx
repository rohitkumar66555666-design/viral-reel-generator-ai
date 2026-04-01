import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Eye, Users, Globe, Smartphone, Monitor, Tablet, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";

const COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#06b6d4", "#84cc16"];

const SOURCE_LABELS: Record<string, string> = {
  direct: "🔗 Direct",
  instagram: "📸 Instagram",
  facebook: "📘 Facebook",
  youtube: "🎥 YouTube",
  twitter: "🐦 Twitter/X",
  linkedin: "💼 LinkedIn",
  whatsapp: "💬 WhatsApp",
  telegram: "✈️ Telegram",
  google: "🔍 Google",
  bing: "🔍 Bing",
  other: "🌐 Other",
};

export default function AdminVisitors() {
  const [period, setPeriod] = useState("daily");
  const [stats, setStats] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [topPages, setTopPages] = useState<any[]>([]);
  const [todayVisitors, setTodayVisitors] = useState(0);
  const [totalVisitors, setTotalVisitors] = useState(0);
  const [recentVisits, setRecentVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async (p: string) => {
    setLoading(true);
    try {
      const [statsRes, sourcesRes, pagesRes, todayRes, totalRes, recentRes] = await Promise.all([
        supabase.rpc("admin_get_visitor_stats", { period: p }),
        supabase.rpc("admin_get_traffic_sources", { period: p }),
        supabase.rpc("admin_get_top_pages", { period: p }),
        supabase.rpc("admin_get_today_visitors"),
        supabase.rpc("admin_get_total_visitors"),
        supabase
          .from("page_visits")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50),
      ]);

      if (statsRes.data) setStats(statsRes.data);
      if (sourcesRes.data) setSources(sourcesRes.data);
      if (pagesRes.data) setTopPages(pagesRes.data);
      if (todayRes.data !== null) setTodayVisitors(todayRes.data);
      if (totalRes.data !== null) setTotalVisitors(totalRes.data);
      if (recentRes.data) setRecentVisits(recentRes.data);
    } catch (e) {
      console.error("Failed to load visitor data:", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData(period);
  }, [period]);

  const uniqueToday = new Set(recentVisits.filter(v => {
    const today = new Date().toISOString().slice(0, 10);
    return v.created_at?.startsWith(today);
  }).map(v => v.session_id)).size;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Visitor Analytics</h1>
        <p className="text-sm text-muted-foreground">Track who visits your site and where they come from</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Today's Visits" value={todayVisitors} icon={Eye} />
        <StatCard title="Unique Sessions Today" value={uniqueToday} icon={Users} />
        <StatCard title="Total Visits" value={totalVisitors} icon={TrendingUp} />
        <StatCard title="Traffic Sources" value={sources.length} icon={Globe} />
      </div>

      {/* Period Selector */}
      <Tabs value={period} onValueChange={setPeriod}>
        <TabsList>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="yearly">Yearly</TabsTrigger>
        </TabsList>

        <TabsContent value={period} className="space-y-6">
          {/* Visit Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Visit Trends ({period})</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="label" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--foreground))",
                      }}
                    />
                    <Bar dataKey="visit_count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Total Visits" />
                    <Bar dataKey="unique_sessions" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} name="Unique Sessions" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="py-12 text-center text-muted-foreground">No data for this period yet</p>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Traffic Sources Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Traffic Sources</CardTitle>
              </CardHeader>
              <CardContent>
                {sources.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={sources.map(s => ({
                          ...s,
                          name: SOURCE_LABELS[s.source] || s.source,
                        }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="visit_count"
                        nameKey="name"
                        label={({ name, percentage }) => `${name} ${percentage}%`}
                      >
                        {sources.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="py-12 text-center text-muted-foreground">No traffic data yet</p>
                )}
              </CardContent>
            </Card>

            {/* Top Pages */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Pages</CardTitle>
              </CardHeader>
              <CardContent>
                {topPages.length > 0 ? (
                  <div className="space-y-3">
                    {topPages.map((p, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                        <span className="text-sm font-medium">{p.page}</span>
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                          {p.visit_count} visits
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-12 text-center text-muted-foreground">No page data yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Visits Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Visits (Last 50)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="pb-2 pr-4">Time</th>
                      <th className="pb-2 pr-4">Page</th>
                      <th className="pb-2 pr-4">Source</th>
                      <th className="pb-2 pr-4">Device</th>
                      <th className="pb-2 pr-4">Browser</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentVisits.map((v, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="py-2 pr-4 text-xs text-muted-foreground">
                          {new Date(v.created_at).toLocaleString()}
                        </td>
                        <td className="py-2 pr-4 font-medium">{v.page_path}</td>
                        <td className="py-2 pr-4">
                          <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            {SOURCE_LABELS[v.traffic_source] || v.traffic_source}
                          </span>
                        </td>
                        <td className="py-2 pr-4">
                          {v.device_type === "mobile" ? <Smartphone className="h-4 w-4" /> :
                           v.device_type === "tablet" ? <Tablet className="h-4 w-4" /> :
                           <Monitor className="h-4 w-4" />}
                        </td>
                        <td className="py-2 pr-4 text-xs">{v.browser}</td>
                      </tr>
                    ))}
                    {recentVisits.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-muted-foreground">
                          No visits recorded yet. Visits will appear here as people visit your site.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
