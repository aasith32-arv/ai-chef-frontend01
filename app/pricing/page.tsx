"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, CreditCard, Megaphone, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/providers/auth-provider";
import { createBillingPortal, createCheckout, getBillingStatus, type BillingProduct } from "@/services/billing";
import type { BillingStatus } from "@/types/api";
import { getErrorMessage } from "@/lib/api-client";

const PLANS = [
  {
    id: "subscription" as const,
    name: "AI Chef Premium",
    price: "Rs 1,200",
    cadence: "per month",
    description: "A recurring membership for cooks who want the complete AI Chef experience.",
    icon: Sparkles,
    features: ["Premium cooking tools", "Monthly automatic renewal", "Cancel through the billing portal"],
    action: "Subscribe monthly",
  },
  {
    id: "advertising" as const,
    name: "Advertising Package",
    price: "Rs 2,000",
    cadence: "one-time",
    description: "Submit one advertising order for review after secure payment.",
    icon: Megaphone,
    features: ["One advertising order", "Manual content review", "No automatic publication"],
    action: "Purchase advertising",
  },
];

export default function PricingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [pending, setPending] = useState<BillingProduct | "portal" | null>(null);
  const [billing, setBilling] = useState<BillingStatus | null>(null);

  useEffect(() => {
    if (!user) return;
    void getBillingStatus().then(setBilling).catch(() => undefined);
  }, [user]);

  async function beginCheckout(product: BillingProduct) {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    setPending(product);
    try {
      const { checkout_url } = await createCheckout(product);
      window.location.assign(checkout_url);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to start secure checkout."));
      setPending(null);
    }
  }

  async function openPortal() {
    setPending("portal");
    try {
      const { portal_url } = await createBillingPortal();
      window.location.assign(portal_url);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to open billing management."));
      setPending(null);
    }
  }

  const activeSubscription = ["active", "trialing"].includes(billing?.subscription?.status || "");

  return (
    <div className="container-premium py-12 sm:py-16">
      <div className="mx-auto max-w-3xl text-center">
        <Badge className="rounded-full bg-primary/10 text-primary">
          <CreditCard className="mr-1 size-3.5" /> Secure Stripe checkout
        </Badge>
        <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">Choose what works for you</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Payments are processed by Stripe. AI Chef never receives or stores your card details.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-2">
        {PLANS.map((plan) => (
          <Card key={plan.id} className={plan.id === "subscription" ? "ring-2 ring-primary" : ""}>
            <CardHeader>
              <div className="mb-3 flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <plan.icon className="size-5" />
              </div>
              <CardTitle className="text-2xl font-extrabold">{plan.name}</CardTitle>
              <CardDescription className="leading-relaxed">{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div><span className="text-4xl font-extrabold">{plan.price}</span> <span className="text-muted-foreground">{plan.cadence}</span></div>
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2 text-sm"><Check className="mt-0.5 size-4 shrink-0 text-primary" />{feature}</li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {plan.id === "subscription" && activeSubscription ? (
                <Button className="w-full rounded-full" variant="outline" disabled={pending !== null} onClick={openPortal}>
                  {pending === "portal" ? "Opening…" : "Manage subscription"}
                </Button>
              ) : (
                <Button className="w-full rounded-full shadow-premium" disabled={loading || pending !== null} onClick={() => void beginCheckout(plan.id)}>
                  {pending === plan.id ? "Opening checkout…" : plan.action}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mx-auto mt-8 flex max-w-2xl items-start gap-3 rounded-2xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
        <p>The subscription renews monthly until cancelled. Advertising purchases create an order for review; payment does not guarantee approval or immediate publication.</p>
      </div>
    </div>
  );
}
