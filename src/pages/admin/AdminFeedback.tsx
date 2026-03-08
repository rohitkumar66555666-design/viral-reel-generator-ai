import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { format } from "date-fns";

interface FeedbackItem {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export default function AdminFeedback() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("feedback")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) toast.error("Failed to load feedback");
      else setItems(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const avgRating = items.length > 0
    ? (items.reduce((s, i) => s + i.rating, 0) / items.length).toFixed(1)
    : "—";

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading feedback…</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Feedback</h1>
        <p className="text-sm text-muted-foreground">
          {items.length} responses · Average rating: {avgRating}/5
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.id} className="card-gradient rounded-xl border border-border p-5">
            <div className="mb-2 flex items-center gap-1">
              {[...Array(5)].map((_, j) => (
                <Star
                  key={j}
                  className={`h-4 w-4 ${j < item.rating ? "fill-primary text-primary" : "text-muted"}`}
                />
              ))}
            </div>
            {item.comment && (
              <p className="text-sm text-foreground/80">{item.comment}</p>
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              {format(new Date(item.created_at), "MMM d, yyyy")}
            </p>
          </div>
        ))}
        {items.length === 0 && (
          <p className="col-span-full py-10 text-center text-muted-foreground">
            No feedback yet
          </p>
        )}
      </div>
    </div>
  );
}
