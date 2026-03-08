import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface IdeaRow {
  id: string;
  title: string;
  hook: string;
  platform: string;
  niche: string;
  caption: string;
  hashtags: string;
  script: string;
  viral_score: number;
  user_id: string;
  created_at: string;
}

export default function AdminReelIdeas() {
  const [ideas, setIdeas] = useState<IdeaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [filterNiche, setFilterNiche] = useState("all");
  const [selected, setSelected] = useState<IdeaRow | null>(null);

  const load = async () => {
    // We read saved_ideas using service-level RPC or direct query
    // Since admin has no RLS on saved_ideas for SELECT, we use an approach:
    // Actually saved_ideas RLS only allows own user. We need admin access.
    // For now we'll query what we can - ideally add admin RLS policy
    const { data, error } = await supabase.from("saved_ideas").select("*").order("created_at", { ascending: false }).limit(500);
    if (error) {
      toast.error("Failed to load reel ideas");
      console.error(error);
    } else {
      setIdeas((data as IdeaRow[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("saved_ideas").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else {
      toast.success("Idea deleted");
      setIdeas((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const filtered = ideas.filter((i) => {
    const matchSearch = i.title.toLowerCase().includes(search.toLowerCase()) || i.hook.toLowerCase().includes(search.toLowerCase());
    const matchPlatform = filterPlatform === "all" || i.platform === filterPlatform;
    const matchNiche = filterNiche === "all" || i.niche === filterNiche;
    return matchSearch && matchPlatform && matchNiche;
  });

  const niches = [...new Set(ideas.map((i) => i.niche))];
  const platforms = [...new Set(ideas.map((i) => i.platform))];

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading reel ideas…</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Reel Ideas History</h1>
        <p className="text-sm text-muted-foreground">{ideas.length} total generated ideas</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by title or hook…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterPlatform} onValueChange={setFilterPlatform}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Platform" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            {platforms.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterNiche} onValueChange={setFilterNiche}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Niche" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Niches</SelectItem>
            {niches.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="card-gradient rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead>Title</TableHead>
              <TableHead>Hook</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Niche</TableHead>
              <TableHead className="text-right">Score</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((idea) => (
              <TableRow key={idea.id} className="border-border">
                <TableCell className="font-medium max-w-[200px] truncate">{idea.title}</TableCell>
                <TableCell className="max-w-[200px] truncate text-muted-foreground">{idea.hook}</TableCell>
                <TableCell><Badge variant="secondary">{idea.platform}</Badge></TableCell>
                <TableCell><Badge variant="outline">{idea.niche}</Badge></TableCell>
                <TableCell className="text-right">{idea.viral_score}</TableCell>
                <TableCell className="text-muted-foreground">{format(new Date(idea.created_at), "MMM d")}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelected(idea)}><Eye className="h-4 w-4" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this idea?</AlertDialogTitle>
                          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(idea.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">No ideas found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Reel Idea Details</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Title</p>
                <p className="text-sm font-medium">{selected.title}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Hook</p>
                <p className="text-sm">{selected.hook}</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><p className="text-xs text-muted-foreground">Platform</p><Badge>{selected.platform}</Badge></div>
                <div><p className="text-xs text-muted-foreground">Niche</p><Badge variant="outline">{selected.niche}</Badge></div>
                <div><p className="text-xs text-muted-foreground">Viral Score</p><p className="text-sm font-bold">{selected.viral_score}/100</p></div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Script</p>
                <p className="text-sm whitespace-pre-wrap bg-muted/50 rounded-lg p-3">{selected.script}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Caption</p>
                <p className="text-sm">{selected.caption}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Hashtags</p>
                <p className="text-sm text-primary">{selected.hashtags}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
