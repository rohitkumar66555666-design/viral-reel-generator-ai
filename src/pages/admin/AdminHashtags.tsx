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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface HashtagGroup {
  id: string;
  name: string;
  niche: string;
  hashtags: string;
  is_active: boolean;
  created_at: string;
}

const defaultForm = { name: "", niche: "general", hashtags: "" };

export default function AdminHashtags() {
  const [groups, setGroups] = useState<HashtagGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<HashtagGroup | null>(null);
  const [form, setForm] = useState(defaultForm);

  const load = async () => {
    const { data, error } = await supabase.from("hashtag_groups").select("*").order("name");
    if (error) toast.error("Failed to load hashtag groups");
    else setGroups((data as HashtagGroup[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(defaultForm); setDialogOpen(true); };
  const openEdit = (g: HashtagGroup) => {
    setEditing(g);
    setForm({ name: g.name, niche: g.niche, hashtags: g.hashtags });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    const payload = { name: form.name, niche: form.niche, hashtags: form.hashtags };
    if (editing) {
      const { error } = await supabase.from("hashtag_groups").update(payload).eq("id", editing.id);
      if (error) toast.error("Failed to update");
      else toast.success("Hashtag group updated");
    } else {
      const { error } = await supabase.from("hashtag_groups").insert(payload);
      if (error) toast.error("Failed to create");
      else toast.success("Hashtag group created");
    }
    setDialogOpen(false);
    load();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("hashtag_groups").delete().eq("id", id);
    toast.success("Hashtag group deleted");
    load();
  };

  if (loading) return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading hashtags…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Hashtag Library</h1>
          <p className="text-sm text-muted-foreground">{groups.length} hashtag groups</p>
        </div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Add Group</Button>
      </div>

      <div className="card-gradient rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead>Name</TableHead>
              <TableHead>Niche</TableHead>
              <TableHead>Hashtags</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.map((g) => (
              <TableRow key={g.id} className="border-border">
                <TableCell className="font-medium">{g.name}</TableCell>
                <TableCell><Badge variant="outline">{g.niche}</Badge></TableCell>
                <TableCell className="max-w-[300px] truncate text-primary text-sm">{g.hashtags}</TableCell>
                <TableCell><Badge variant={g.is_active ? "default" : "secondary"}>{g.is_active ? "Active" : "Off"}</Badge></TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(g)}><Pencil className="h-4 w-4" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Delete "{g.name}"?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(g.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {groups.length === 0 && <TableRow><TableCell colSpan={5} className="py-10 text-center text-muted-foreground">No hashtag groups yet</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Hashtag Group" : "Add Hashtag Group"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Group Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Fitness Hashtags" /></div>
            <div className="space-y-2"><Label>Niche</Label><Input value={form.niche} onChange={(e) => setForm({ ...form, niche: e.target.value })} placeholder="e.g. fitness" /></div>
            <div className="space-y-2"><Label>Hashtags</Label><Textarea value={form.hashtags} onChange={(e) => setForm({ ...form, hashtags: e.target.value })} placeholder="#fitnessmotivation #gym #workout" rows={4} /></div>
          </div>
          <DialogFooter><Button onClick={save}>{editing ? "Update" : "Create"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
