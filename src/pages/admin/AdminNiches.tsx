import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Niche {
  id: string;
  name: string;
  icon: string;
  is_active: boolean;
  usage_count: number;
  created_at: string;
}

export default function AdminNiches() {
  const [niches, setNiches] = useState<Niche[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Niche | null>(null);
  const [form, setForm] = useState({ name: "", icon: "🎯" });

  const load = async () => {
    const { data, error } = await supabase.from("niches").select("*").order("name");
    if (error) toast.error("Failed to load niches");
    else setNiches((data as Niche[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm({ name: "", icon: "🎯" }); setDialogOpen(true); };
  const openEdit = (n: Niche) => { setEditing(n); setForm({ name: n.name, icon: n.icon }); setDialogOpen(true); };

  const save = async () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    if (editing) {
      const { error } = await supabase.from("niches").update({ name: form.name, icon: form.icon }).eq("id", editing.id);
      if (error) toast.error("Failed to update");
      else toast.success("Niche updated");
    } else {
      const { error } = await supabase.from("niches").insert({ name: form.name, icon: form.icon });
      if (error) toast.error(error.message.includes("duplicate") ? "Niche already exists" : "Failed to create");
      else toast.success("Niche created");
    }
    setDialogOpen(false);
    load();
  };

  const toggleActive = async (n: Niche) => {
    await supabase.from("niches").update({ is_active: !n.is_active }).eq("id", n.id);
    load();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("niches").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else { toast.success("Niche deleted"); load(); }
  };

  if (loading) return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading niches…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Niche Management</h1>
          <p className="text-sm text-muted-foreground">{niches.length} niches configured</p>
        </div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Add Niche</Button>
      </div>

      <div className="card-gradient rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead>Icon</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Usage</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {niches.map((n) => (
              <TableRow key={n.id} className="border-border">
                <TableCell className="text-2xl">{n.icon}</TableCell>
                <TableCell className="font-medium">{n.name}</TableCell>
                <TableCell>
                  <Badge variant={n.is_active ? "default" : "secondary"}>{n.is_active ? "Active" : "Inactive"}</Badge>
                </TableCell>
                <TableCell className="text-right">{n.usage_count}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleActive(n)}>
                      <Switch checked={n.is_active} className="pointer-events-none" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(n)}><Pencil className="h-4 w-4" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Delete "{n.name}"?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(n.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {niches.length === 0 && <TableRow><TableCell colSpan={5} className="py-10 text-center text-muted-foreground">No niches yet</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Niche" : "Add Niche"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Fitness" /></div>
            <div className="space-y-2"><Label>Icon (emoji)</Label><Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="🎯" /></div>
          </div>
          <DialogFooter><Button onClick={save}>{editing ? "Update" : "Create"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
