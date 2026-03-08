import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TrendingTopic {
  id: string;
  topic_name: string;
  platform: string;
  popularity_score: number;
  is_active: boolean;
  created_at: string;
}

const defaultForm = { topic_name: "", platform: "all", popularity_score: "50" };

export default function AdminTrendingTopics() {
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TrendingTopic | null>(null);
  const [form, setForm] = useState(defaultForm);

  const load = async () => {
    const { data, error } = await supabase.from("trending_topics").select("*").order("popularity_score", { ascending: false });
    if (error) toast.error("Failed to load topics");
    else setTopics((data as TrendingTopic[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(defaultForm); setDialogOpen(true); };
  const openEdit = (t: TrendingTopic) => {
    setEditing(t);
    setForm({ topic_name: t.topic_name, platform: t.platform, popularity_score: String(t.popularity_score) });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.topic_name.trim()) { toast.error("Topic name required"); return; }
    const payload = { topic_name: form.topic_name, platform: form.platform, popularity_score: parseInt(form.popularity_score) || 50 };
    if (editing) {
      const { error } = await supabase.from("trending_topics").update(payload).eq("id", editing.id);
      if (error) toast.error("Failed to update");
      else toast.success("Topic updated");
    } else {
      const { error } = await supabase.from("trending_topics").insert(payload);
      if (error) toast.error("Failed to create");
      else toast.success("Topic created");
    }
    setDialogOpen(false);
    load();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("trending_topics").delete().eq("id", id);
    toast.success("Topic deleted");
    load();
  };

  if (loading) return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading topics…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Trending Topics</h1>
          <p className="text-sm text-muted-foreground">{topics.length} trending topics</p>
        </div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Add Topic</Button>
      </div>

      <div className="card-gradient rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead>Topic</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead className="text-right">Popularity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topics.map((t) => (
              <TableRow key={t.id} className="border-border">
                <TableCell className="font-medium">{t.topic_name}</TableCell>
                <TableCell><Badge variant="secondary">{t.platform}</Badge></TableCell>
                <TableCell className="text-right font-mono">{t.popularity_score}</TableCell>
                <TableCell><Badge variant={t.is_active ? "default" : "secondary"}>{t.is_active ? "Active" : "Off"}</Badge></TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(t)}><Pencil className="h-4 w-4" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Delete "{t.topic_name}"?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(t.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {topics.length === 0 && <TableRow><TableCell colSpan={5} className="py-10 text-center text-muted-foreground">No topics yet</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Topic" : "Add Trending Topic"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Topic Name</Label><Input value={form.topic_name} onChange={(e) => setForm({ ...form, topic_name: e.target.value })} placeholder="e.g. AI side hustles" /></div>
            <div className="space-y-2">
              <Label>Platform</Label>
              <Select value={form.platform} onValueChange={(v) => setForm({ ...form, platform: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["all", "tiktok", "instagram", "youtube"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Popularity Score (0-100)</Label><Input type="number" min="0" max="100" value={form.popularity_score} onChange={(e) => setForm({ ...form, popularity_score: e.target.value })} /></div>
          </div>
          <DialogFooter><Button onClick={save}>{editing ? "Update" : "Create"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
