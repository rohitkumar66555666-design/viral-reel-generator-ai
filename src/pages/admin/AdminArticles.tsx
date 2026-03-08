import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Star, Trash2, Eye, Download } from "lucide-react";
import { format } from "date-fns";
import { downloadCSV } from "@/lib/csv-export";
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

interface ArticleRow {
  id: string;
  title: string;
  category: string;
  status: string;
  is_featured: boolean;
  created_at: string;
  user_email: string;
}

const categories = ["all", "blog", "seo", "product-review", "news", "tutorial", "listicle"];

export default function AdminArticles() {
  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedArticle, setSelectedArticle] = useState<ArticleRow | null>(null);

  const load = async () => {
    const { data, error } = await supabase.rpc("admin_get_articles_list");
    if (error) {
      toast.error("Failed to load articles");
      console.error(error);
    } else {
      setArticles((data as any[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleFeatured = async (id: string, current: boolean) => {
    const { error } = await supabase.from("articles").update({ is_featured: !current }).eq("id", id);
    if (error) toast.error("Failed to update");
    else {
      setArticles((prev) => prev.map((a) => a.id === id ? { ...a, is_featured: !current } : a));
      toast.success(!current ? "Article featured" : "Article unfeatured");
    }
  };

  const deleteArticle = async (id: string) => {
    const { error } = await supabase.from("articles").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else {
      setArticles((prev) => prev.filter((a) => a.id !== id));
      toast.success("Article deleted");
    }
  };

  const filtered = articles.filter((a) => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.user_email?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "all" || a.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading articles…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Article Management</h1>
          <p className="text-sm text-muted-foreground">{articles.length} total articles</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            downloadCSV(
              `articles-${format(new Date(), "yyyy-MM-dd")}.csv`,
              ["Title", "Author", "Category", "Status", "Featured", "Date"],
              articles.map((a) => [a.title, a.user_email, a.category, a.status, a.is_featured ? "Yes" : "No", format(new Date(a.created_at), "yyyy-MM-dd")])
            )
          }
          disabled={articles.length === 0}
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or author…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{c === "all" ? "All Categories" : c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="card-gradient rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((a) => (
              <TableRow key={a.id} className="border-border">
                <TableCell className="font-medium max-w-[200px] truncate">
                  <div className="flex items-center gap-2">
                    {a.is_featured && <Star className="h-3.5 w-3.5 fill-primary text-primary shrink-0" />}
                    <span className="truncate">{a.title}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{a.user_email}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{a.category}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={a.status === "published" ? "default" : "outline"}>
                    {a.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(a.created_at), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedArticle(a)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => toggleFeatured(a.id, a.is_featured)}
                    >
                      <Star className={`h-4 w-4 ${a.is_featured ? "fill-primary text-primary" : ""}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => deleteArticle(a.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No articles found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Article Detail Dialog */}
      <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedArticle?.title}</DialogTitle>
          </DialogHeader>
          {selectedArticle && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Author</p>
                  <p className="text-sm">{selectedArticle.user_email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Category</p>
                  <Badge variant="secondary">{selectedArticle.category}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge variant={selectedArticle.status === "published" ? "default" : "outline"}>{selectedArticle.status}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-sm">{format(new Date(selectedArticle.created_at), "PPP")}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
