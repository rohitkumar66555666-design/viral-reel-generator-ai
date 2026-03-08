import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Send, MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ContactFeedbackDialog() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"contact" | "feedback">("contact");

  // Contact form
  const [name, setName] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  // Feedback form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [sendingFeedback, setSendingFeedback] = useState(false);

  const handleContact = async () => {
    if (!user) { toast.error("Please sign in first"); return; }
    if (!name.trim() || !message.trim()) { toast.error("Please fill all fields"); return; }
    setSending(true);
    const { error } = await supabase.from("contact_messages").insert({
      user_id: user.id,
      name: name.trim(),
      email: email.trim() || user.email,
      message: message.trim(),
    });
    if (error) toast.error("Failed to send message");
    else {
      toast.success("Message sent! We'll get back to you.");
      setName(""); setMessage("");
      setOpen(false);
    }
    setSending(false);
  };

  const handleFeedback = async () => {
    if (!user) { toast.error("Please sign in first"); return; }
    setSendingFeedback(true);
    const { error } = await supabase.from("feedback").insert({
      user_id: user.id,
      rating,
      comment: comment.trim() || null,
    });
    if (error) toast.error("Failed to submit feedback");
    else {
      toast.success("Thanks for your feedback! ⭐");
      setComment(""); setRating(5);
      setOpen(false);
    }
    setSendingFeedback(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Help & Feedback">
          <MessageSquare className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Help & Feedback</DialogTitle>
        </DialogHeader>

        <div className="mb-4 flex gap-2">
          <Button
            variant={tab === "contact" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("contact")}
          >
            Contact Us
          </Button>
          <Button
            variant={tab === "feedback" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("feedback")}
          >
            Rate Us
          </Button>
        </div>

        {tab === "contact" ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe your issue…" rows={4} />
            </div>
            <Button variant="gradient" className="w-full" onClick={handleContact} disabled={sending}>
              <Send className="mr-2 h-4 w-4" />
              {sending ? "Sending…" : "Send Message"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button key={i} onClick={() => setRating(i)} className="p-1">
                    <Star className={`h-6 w-6 transition-colors ${i <= rating ? "fill-primary text-primary" : "text-muted"}`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Comment (optional)</Label>
              <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Tell us what you think…" rows={3} />
            </div>
            <Button variant="gradient" className="w-full" onClick={handleFeedback} disabled={sendingFeedback}>
              <Star className="mr-2 h-4 w-4" />
              {sendingFeedback ? "Submitting…" : "Submit Feedback"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
