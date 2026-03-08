import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PromptTemplate {
  id: string;
  name: string;
  prompt_instruction: string;
  category: string;
  is_active: boolean;
  created_at: string;
}

const templateCategories = ["blog", "seo", "product-review", "news", "tutorial", "listicle"];

export default function AdminPromptTemplates() {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PromptTemplate | null>(null);
  const [form, setForm] = useState({ name: "", prompt_instruction: "", category: "blog" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data, error } = await supabase
      .from("prompt_templates")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error("Failed to load templates");
    else setTemplates(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", prompt_instruction: "", category: "blog" });
    setDialogOpen(true);
  };

  const openEdit = (t: PromptTemplate) => {
    setEditing(t);
    setForm({ name: t.name, prompt_instruction: t.prompt_instruction, category: t.category });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.prompt_instruction.trim()) {
      toast.error("Name and prompt instruction are required");
      return;
    }
    setSaving(true);
    if (editing) {
      const { error } = await supabase
        .from("prompt_templates")
        .update({ ...form, updated_at: new Date().toISOString() })
        .eq("id", editing.id);
      if (error) toast.error("Failed to update");
      else toast.success("Template updated");
    } else {
      const { error } = await supabase
        .from("prompt_templates")
        .insert(form);
      if (error) toast.error("Failed to create");
      else toast.success("Template created");
    }
    setSaving(false);
    setDialogOpen(false);
    load();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("prompt_templates").update({ is_active: !current }).eq("id", id);
    setTemplates((prev) => prev.map((t) => t.id === id ? { ...t, is_active: !current } : t));
  };

  const deleteTemplate = async (id: string) => {
    const { error } = await supabase.from("prompt_templates").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else {
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      toast.success("Template deleted");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading templates…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Prompt Templates</h1>
          <p className="text-sm text-muted-foreground">Manage AI prompt templates for article generation</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Template
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((t) => (
          <div key={t.id} className="card-gradient rounded-xl border border-border p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display font-semibold">{t.name}</h3>
                <Badge variant="secondary" className="mt-1">{t.category}</Badge>
              </div>
              <Switch
                checked={t.is_active}
                onCheckedChange={() => toggleActive(t.id, t.is_active)}
              />
            </div>
            <p className="text-sm text-muted-foreground line-clamp-3">{t.prompt_instruction}</p>
            <div className="flex items-center gap-2 pt-1">
              <Button variant="ghost" size="sm" onClick={() => openEdit(t)}>
                <Pencil className="mr-1 h-3.5 w-3.5" />
                Edit
              </Button>
              <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteTemplate(t.id)}>
                <Trash2 className="mr-1 h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          </div>
        ))}
        {templates.length === 0 && (
          <div className="col-span-full py-10 text-center text-muted-foreground">
            No templates yet. Create your first one!
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Template" : "Create Template"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Template Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Blog Post, SEO Article"
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {templateCategories.map((c) => (
                    <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1).replace("-", " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prompt Instruction</Label>
              <Textarea
                value={form.prompt_instruction}
                onChange={(e) => setForm({ ...form, prompt_instruction: e.target.value })}
                placeholder="Write the AI instructions for generating this type of article…"
                rows={6}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving…" : "Save Template"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
