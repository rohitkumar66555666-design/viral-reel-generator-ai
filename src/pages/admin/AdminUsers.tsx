import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { format } from "date-fns";
import { downloadCSV } from "@/lib/csv-export";

interface UserRow {
  id: string;
  email: string;
  created_at: string;
  ideas_count: number;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading users…</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">User Management</h1>
        <p className="text-sm text-muted-foreground">{users.length} registered users</p>
      </div>

      <div className="card-gradient rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead>Email</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Ideas Generated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id} className="border-border">
                <TableCell className="font-medium">{u.email}</TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(u.created_at), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="text-right">{u.ideas_count}</TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="py-10 text-center text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
