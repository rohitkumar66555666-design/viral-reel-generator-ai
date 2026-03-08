import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Zap, ArrowLeft, Crown, Rocket, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const plans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: "",
    icon: Star,
    features: [
      "5 reel ideas per day",
      "All niches",
      "Basic hooks & captions",
      "Community support",
    ],
    cta: "Current Plan",
    disabled: true,
    popular: false,
  },
  {
    id: "starter",
    name: "Starter",
    price: 299,
    period: "/month",
    icon: Zap,
    features: [
      "15 reel ideas per day",
      "All niches & platforms",
      "Advanced hooks & scripts",
      "Hashtag suggestions",
      "Email support",
    ],
    cta: "Get Starter",
    disabled: false,
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 699,
    period: "/month",
    icon: Crown,
    features: [
      "50 reel ideas per day",
      "All niches & platforms",
      "Premium hooks & scripts",
      "Trending topic alerts",
      "Priority support",
      "Export to CSV",
    ],
    cta: "Get Pro",
    disabled: false,
    popular: true,
  },
  {
    id: "unlimited",
    name: "Unlimited",
    price: 1499,
    period: "/month",
    icon: Rocket,
    features: [
      "Unlimited reel ideas",
      "All niches & platforms",
      "AI-powered viral scoring",
      "Custom prompt templates",
      "API access",
      "Dedicated support",
    ],
    cta: "Get Unlimited",
    disabled: false,
    popular: false,
  },
];

const creditPacks = [
  { id: "pack_10", credits: 10, price: 99, label: "10 Credits" },
  { id: "pack_50", credits: 50, price: 399, label: "50 Credits" },
  { id: "pack_100", credits: 100, price: 699, label: "100 Credits" },
];

export default function Pricing() {
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

  const handlePayment = async (planId: string, amount: number, type: "one_time" | "subscription" = "subscription") => {
    if (!user) {
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

      // Create order via edge function
      const { data, error } = await supabase.functions.invoke("razorpay-create-order", {
        body: {
          amount: amount * 100, // Convert to paise
          currency: "INR",
          plan_name: planId,
          payment_type: type,
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
        description: type === "subscription" ? `${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan - Monthly` : `${planId} Credits Pack`,
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
            navigate("/app");
          } catch (err) {
            toast.error("Payment verification failed. Contact support.");
            console.error(err);
          }
        },
        prefill: {
          email: user.email,
        },
        theme: {
          color: "#00b3b3",
        },
        modal: {
          ondismiss: () => setLoading(null),
        },
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <span className="font-display font-bold gradient-text">Viral Reels AI</span>
          </div>
          <div className="w-16" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Choose Your <span className="gradient-text">Plan</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Unlock unlimited viral reel ideas and supercharge your content creation
          </p>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-20">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl border p-6 flex flex-col ${
                plan.popular
                  ? "border-primary bg-primary/5 shadow-[var(--shadow-glow)]"
                  : "border-border card-gradient"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-secondary px-4 py-1 text-xs font-bold text-primary-foreground">
                  Most Popular
                </div>
              )}
              <div className="mb-4">
                <plan.icon className={`h-8 w-8 mb-3 ${plan.popular ? "text-primary" : "text-muted-foreground"}`} />
                <h3 className="font-display text-xl font-bold">{plan.name}</h3>
              </div>
              <div className="mb-6">
                <span className="font-display text-4xl font-bold">
                  {plan.price === 0 ? "Free" : `₹${plan.price}`}
                </span>
                {plan.period && <span className="text-muted-foreground text-sm">{plan.period}</span>}
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.popular ? "gradient" : "outline"}
                className="w-full"
                disabled={plan.disabled || loading === plan.id}
                onClick={() => handlePayment(plan.id, plan.price, "subscription")}
              >
                {loading === plan.id ? "Processing…" : plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Credit Packs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="font-display text-3xl font-bold mb-3">
            Or Buy <span className="gradient-text">Credit Packs</span>
          </h2>
          <p className="text-muted-foreground">One-time purchase, no subscription needed</p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3 max-w-3xl mx-auto">
          {creditPacks.map((pack, i) => (
            <motion.div
              key={pack.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="card-gradient rounded-xl border border-border p-6 text-center"
            >
              <div className="font-display text-2xl font-bold mb-1">{pack.credits} Credits</div>
              <div className="text-3xl font-bold gradient-text mb-4">₹{pack.price}</div>
              <p className="text-sm text-muted-foreground mb-4">₹{(pack.price / pack.credits).toFixed(1)}/credit</p>
              <Button
                variant="outline"
                className="w-full"
                disabled={loading === pack.id}
                onClick={() => handlePayment(pack.id, pack.price, "one_time")}
              >
                {loading === pack.id ? "Processing…" : "Buy Now"}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
