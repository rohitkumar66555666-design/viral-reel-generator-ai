import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load messages");
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  };

  const markRead = async (id: string) => {
    await supabase.from("contact_messages").update({ is_read: true }).eq("id", id);
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, is_read: true } : m)));
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading messages…</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Contact Messages</h1>
        <p className="text-sm text-muted-foreground">
          {messages.filter((m) => !m.is_read).length} unread messages
        </p>
      </div>

      <div className="card-gradient rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead>Status</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.map((m) => (
              <TableRow
                key={m.id}
                className="border-border cursor-pointer"
                onClick={() => !m.is_read && markRead(m.id)}
              >
                <TableCell>
                  <Badge variant={m.is_read ? "secondary" : "default"}>
                    {m.is_read ? "Read" : "New"}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{m.name}</TableCell>
                <TableCell className="text-muted-foreground">{m.email}</TableCell>
                <TableCell className="max-w-xs truncate text-muted-foreground">{m.message}</TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(m.created_at), "MMM d, yyyy")}
                </TableCell>
              </TableRow>
            ))}
            {messages.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  No messages yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
