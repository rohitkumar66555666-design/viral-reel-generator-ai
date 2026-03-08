import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Crown, Rocket, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
}

export function UpgradeDialog({ open, onOpenChange }: UpgradeDialogProps) {
  const navigate = useNavigate();

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
                onClick={() => {
                  onOpenChange(false);
                  navigate("/pricing");
                }}
              >
                Get {plan.name}
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
