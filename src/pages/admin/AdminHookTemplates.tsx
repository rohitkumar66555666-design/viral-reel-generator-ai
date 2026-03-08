import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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

interface HookTemplate {
  id: string;
  hook_text: string;
  category: string;
  platform: string;
  engagement_score: number;
  is_active: boolean;
  created_at: string;
}

const defaultForm = { hook_text: "", category: "general", platform: "all", engagement_score: "50" };

export default function AdminHookTemplates() {
  const [hooks, setHooks] = useState<HookTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<HookTemplate | null>(null);
  const [form, setForm] = useState(defaultForm);

  const load = async () => {
    const { data, error } = await supabase.from("hook_templates").select("*").order("engagement_score", { ascending: false });
    if (error) toast.error("Failed to load hooks");
    else setHooks((data as HookTemplate[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(defaultForm); setDialogOpen(true); };
  const openEdit = (h: HookTemplate) => {
    setEditing(h);
    setForm({ hook_text: h.hook_text, category: h.category, platform: h.platform, engagement_score: String(h.engagement_score) });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.hook_text.trim()) { toast.error("Hook text is required"); return; }
    const payload = { hook_text: form.hook_text, category: form.category, platform: form.platform, engagement_score: parseInt(form.engagement_score) || 50 };
    if (editing) {
      const { error } = await supabase.from("hook_templates").update(payload).eq("id", editing.id);
      if (error) toast.error("Failed to update");
      else toast.success("Hook updated");
    } else {
      const { error } = await supabase.from("hook_templates").insert(payload);
      if (error) toast.error("Failed to create");
      else toast.success("Hook created");
    }
    setDialogOpen(false);
    load();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("hook_templates").delete().eq("id", id);
    toast.success("Hook deleted");
    load();
  };

  if (loading) return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading hooks…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Hook Templates</h1>
          <p className="text-sm text-muted-foreground">{hooks.length} viral hook templates</p>
        </div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Add Hook</Button>
      </div>

      <div className="card-gradient rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead>Hook Text</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead className="text-right">Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hooks.map((h) => (
              <TableRow key={h.id} className="border-border">
                <TableCell className="font-medium max-w-[300px] truncate">{h.hook_text}</TableCell>
                <TableCell><Badge variant="outline">{h.category}</Badge></TableCell>
                <TableCell><Badge variant="secondary">{h.platform}</Badge></TableCell>
                <TableCell className="text-right font-mono">{h.engagement_score}</TableCell>
                <TableCell><Badge variant={h.is_active ? "default" : "secondary"}>{h.is_active ? "Active" : "Off"}</Badge></TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(h)}><Pencil className="h-4 w-4" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Delete this hook?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(h.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {hooks.length === 0 && <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">No hooks yet</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Hook" : "Add Hook Template"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Hook Text</Label><Textarea value={form.hook_text} onChange={(e) => setForm({ ...form, hook_text: e.target.value })} placeholder='e.g. "Nobody talks about this..."' rows={3} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["general", "curiosity", "urgency", "controversy", "storytelling", "list"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Platform</Label>
                <Select value={form.platform} onValueChange={(v) => setForm({ ...form, platform: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["all", "tiktok", "instagram", "youtube"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label>Engagement Score (0-100)</Label><Input type="number" min="0" max="100" value={form.engagement_score} onChange={(e) => setForm({ ...form, engagement_score: e.target.value })} /></div>
          </div>
          <DialogFooter><Button onClick={save}>{editing ? "Update" : "Create"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
