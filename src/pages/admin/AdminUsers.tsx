import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Download, Search, Eye, Ban, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { downloadCSV } from "@/lib/csv-export";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UserRow {
  id: string;
  email: string;
  created_at: string;
  ideas_count: number;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);

  const loadUsers = async () => {
    const { data, error } = await supabase.rpc("admin_get_users_list");
    if (error) {
      toast.error("Failed to load users");
      console.error(error);
    } else {
      setUsers((data as any[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => { loadUsers(); }, []);

  const filtered = users.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading users…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">User Management</h1>
          <p className="text-sm text-muted-foreground">{users.length} registered users</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            downloadCSV(
              `users-${format(new Date(), "yyyy-MM-dd")}.csv`,
          ["Email", "Joined", "Reels Ideas Generated"],
          users.map((u) => [u.email, format(new Date(u.created_at), "yyyy-MM-dd"), u.ideas_count])
            )
          }
          disabled={users.length === 0}
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users by email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="card-gradient rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead>Email</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead className="text-right">Articles</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((u) => (
              <TableRow key={u.id} className="border-border">
                <TableCell className="font-medium">{u.email}</TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(u.created_at), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">Free</Badge>
                </TableCell>
                <TableCell className="text-right">{u.ideas_count}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="border-green-500/30 text-green-500">Active</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedUser(u)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* User Detail Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">User ID</p>
                  <p className="text-sm font-mono text-muted-foreground">{selectedUser.id.slice(0, 8)}…</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Joined</p>
                  <p className="text-sm">{format(new Date(selectedUser.created_at), "PPP")}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Articles Generated</p>
                  <p className="text-sm font-medium">{selectedUser.ideas_count}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
