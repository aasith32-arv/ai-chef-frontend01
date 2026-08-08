import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BillingSuccessPage() {
  return (
    <div className="container-premium flex min-h-[60vh] items-center justify-center py-16">
      <div className="card-premium max-w-lg space-y-5 p-8 text-center">
        <CheckCircle2 className="mx-auto size-14 text-primary" />
        <h1 className="text-3xl font-extrabold tracking-tight">Payment received</h1>
        <p className="leading-relaxed text-muted-foreground">
          Stripe is confirming your payment. Your subscription or advertising order will appear after secure webhook verification.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild className="rounded-full"><Link href="/profile">View profile</Link></Button>
          <Button asChild variant="outline" className="rounded-full"><Link href="/">Return home</Link></Button>
        </div>
      </div>
    </div>
  );
}
