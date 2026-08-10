"use client";

import { useEffect, useState } from "react";
import { CreditCard, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/api-client";
import { getAdminPayments, type AdminPayment } from "@/services/admin";
import type { Pagination } from "@/types/api";

export default function AdminPaymentsPage() {
  const [items, setItems] = useState<AdminPayment[]>([]);
  const [meta, setMeta] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  useEffect(() => { let active = true; void getAdminPayments(page).then((data) => { if (active) { setItems(data.items); setMeta(data.meta); } }).catch((error) => toast.error(getErrorMessage(error, "Unable to load subscriptions."))); return () => { active = false; }; }, [page]);
  return <div><AdminPageHeader eyebrow="Billing" title="Payment Monitoring" description="Read-only subscription records synchronized from trusted Stripe events. Card data and secrets are never stored here." /><div className="overflow-x-auto rounded-2xl border border-border bg-card"><table className="w-full min-w-[900px] text-left text-sm"><thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground"><tr><th className="p-3">User</th><th className="p-3">Status</th><th className="p-3">Stripe references</th><th className="p-3">Period end</th><th className="p-3">Updated</th></tr></thead><tbody>{items.map((item) => <tr key={item.id} className="border-b border-border last:border-0"><td className="p-3"><p className="font-semibold">{item.user.username}</p><p className="text-xs text-muted-foreground">{item.user.email}</p></td><td className="p-3"><Badge>{item.status}</Badge>{item.cancel_at_period_end && <p className="mt-1 text-xs text-warning">Cancels at period end</p>}</td><td className="p-3 font-mono text-xs"><p>{item.stripe_customer_id || "—"}</p><p>{item.stripe_subscription_id}</p></td><td className="p-3">{item.current_period_end ? new Date(item.current_period_end).toLocaleDateString() : "—"}</td><td className="p-3 text-muted-foreground">{new Date(item.updated_at).toLocaleDateString()}</td></tr>)}</tbody></table>{!items.length && <div className="flex flex-col items-center gap-2 p-10 text-center text-muted-foreground"><CreditCard className="size-8" /><p>No subscription records yet.</p><p className="text-xs">Financial management remains in the Stripe Dashboard <ExternalLink className="inline size-3" />.</p></div>}</div>{meta && meta.pages > 1 && <div className="mt-4 flex items-center justify-between"><p className="text-sm text-muted-foreground">Page {meta.page} of {meta.pages}</p><div className="flex gap-2"><Button variant="outline" disabled={!meta.has_prev} onClick={() => setPage((value) => value - 1)}>Previous</Button><Button variant="outline" disabled={!meta.has_next} onClick={() => setPage((value) => value + 1)}>Next</Button></div></div>}</div>;
}
