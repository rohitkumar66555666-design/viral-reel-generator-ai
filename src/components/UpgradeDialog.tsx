import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Crown, Rocket, Zap, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const proPlans = [
  {
    id: "starter",
    name: "Starter",
    price: 299,
    period: "/month",
    icon: Zap,
    highlight: false,
    features: ["15 reel ideas per day", "All niches & platforms", "Advanced hooks & scripts"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 699,
    period: "/month",
    icon: Crown,
    highlight: true,
    features: ["50 reel ideas per day", "Priority AI generation", "Viral score analytics", "Priority support"],
  },
  {
    id: "unlimited",
    name: "Unlimited",
    price: 1499,
    period: "/month",
    icon: Rocket,
    highlight: false,
    features: ["Unlimited ideas per day", "All Pro features", "API access", "Dedicated support"],
  },
];

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpgradeSuccess?: () => void;
}

export function UpgradeDialog({ open, onOpenChange, onUpgradeSuccess }: UpgradeDialogProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);

  const loadRazorpay = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (planId: string, amount: number) => {
    if (!user) {
      onOpenChange(false);
      navigate("/auth");
      return;
    }

    setLoading(planId);

    try {
      const loaded = await loadRazorpay();
      if (!loaded) {
        toast.error("Failed to load payment gateway");
        setLoading(null);
        return;
      }

      const { data, error } = await supabase.functions.invoke("razorpay-create-order", {
        body: {
          amount: amount * 100,
          currency: "INR",
          plan_name: planId,
          payment_type: "subscription",
        },
      });

      if (error || data?.error) {
        throw new Error(data?.error || error?.message || "Failed to create order");
      }

      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: "Viral Reels AI",
        description: `${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan - Monthly`,
        order_id: data.order_id,
        handler: async (response: any) => {
          try {
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke("razorpay-verify-payment", {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
            });

            if (verifyError || verifyData?.error) {
              throw new Error(verifyData?.error || "Verification failed");
            }

            toast.success("Payment successful! Your plan has been upgraded. 🎉");
            onOpenChange(false);
            onUpgradeSuccess?.();
          } catch (err) {
            toast.error("Payment verification failed. Contact support.");
            console.error(err);
          }
        },
        prefill: { email: user.email },
        theme: { color: "#00b3b3" },
        modal: { ondismiss: () => setLoading(null) },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        toast.error(`Payment failed: ${response.error.description}`);
        setLoading(null);
      });
      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
      toast.error(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Crown className="h-5 w-5 text-primary" />
            Daily Limit Reached!
          </DialogTitle>
          <DialogDescription>
            You've used all 5 free ideas today. Upgrade to keep generating viral content.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4 sm:grid-cols-3">
          {proPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-xl border p-4 transition-all ${
                plan.highlight
                  ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/20"
                  : "border-border hover:border-primary/40"
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
                  Most Popular
                </span>
              )}
              <div className="mb-3 flex items-center gap-2">
                <plan.icon className="h-4 w-4 text-primary" />
                <span className="font-display font-semibold">{plan.name}</span>
              </div>
              <div className="mb-3">
                <span className="text-2xl font-bold">₹{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>
              <ul className="mb-4 space-y-1.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <Check className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.highlight ? "gradient" : "outline"}
                size="sm"
                className="w-full"
                disabled={loading === plan.id}
                onClick={() => handlePayment(plan.id, plan.price)}
              >
                {loading === plan.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                {loading === plan.id ? "Processing…" : `Get ${plan.name}`}
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
