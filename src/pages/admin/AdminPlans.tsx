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

interface Plan {
  id: string;
  name: string;
  price: number;
  daily_limit: number;
  features: string;
  is_active: boolean;
  created_at: string;
}

const defaultForm = { name: "", price: "0", daily_limit: "5", features: "" };

export default function AdminPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [form, setForm] = useState(defaultForm);

  const load = async () => {
    const { data, error } = await supabase.from("subscription_plans").select("*").order("price");
    if (error) toast.error("Failed to load plans");
    else setPlans((data as Plan[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(defaultForm); setDialogOpen(true); };
  const openEdit = (p: Plan) => {
    setEditing(p);
    setForm({ name: p.name, price: String(p.price), daily_limit: String(p.daily_limit), features: p.features });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    const payload = { name: form.name, price: parseFloat(form.price) || 0, daily_limit: parseInt(form.daily_limit) || 5, features: form.features };
    if (editing) {
      const { error } = await supabase.from("subscription_plans").update(payload).eq("id", editing.id);
      if (error) toast.error("Failed to update");
      else toast.success("Plan updated");
    } else {
      const { error } = await supabase.from("subscription_plans").insert(payload);
      if (error) toast.error("Failed to create");
      else toast.success("Plan created");
    }
    setDialogOpen(false);
    load();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("subscription_plans").delete().eq("id", id);
    toast.success("Plan deleted");
    load();
  };

  if (loading) return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading plans…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Plans & Credits</h1>
          <p className="text-sm text-muted-foreground">{plans.length} subscription plans</p>
        </div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Add Plan</Button>
      </div>

      <div className="card-gradient rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead>Plan</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Daily Limit</TableHead>
              <TableHead>Features</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((p) => (
              <TableRow key={p.id} className="border-border">
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell className="text-right font-mono">${Number(p.price).toFixed(2)}</TableCell>
                <TableCell className="text-right">{p.daily_limit}</TableCell>
                <TableCell className="max-w-[200px] truncate text-muted-foreground">{p.features}</TableCell>
                <TableCell><Badge variant={p.is_active ? "default" : "secondary"}>{p.is_active ? "Active" : "Off"}</Badge></TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Delete "{p.name}"?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(p.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {plans.length === 0 && <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">No plans yet</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Plan" : "Add Subscription Plan"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Plan Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Pro Plan" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Price ($)</Label><Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
              <div className="space-y-2"><Label>Daily Idea Limit</Label><Input type="number" value={form.daily_limit} onChange={(e) => setForm({ ...form, daily_limit: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Features (comma-separated)</Label><Textarea value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} placeholder="Unlimited ideas, Priority support, Custom niches" rows={3} /></div>
          </div>
          <DialogFooter><Button onClick={save}>{editing ? "Update" : "Create"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
