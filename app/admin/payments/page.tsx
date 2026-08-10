"use client";

import { useEffect, useState } from "react";
import { CreditCard, ExternalLink, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminEmptyState, AdminPagination, AdminStatusBadge, AdminTableSkeleton, publicationTone } from "@/components/admin/admin-ui";
import { getErrorMessage } from "@/lib/api-client";
import { getAdminPayments, type AdminPayment } from "@/services/admin";
import type { Pagination } from "@/types/api";

export default function AdminPaymentsPage() {
  const [items, setItems] = useState<AdminPayment[]>([]);
  const [meta, setMeta] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  useEffect(() => { let active = true; void getAdminPayments(page).then((data) => { if (active) { setItems(data.items); setMeta(data.meta); } }).catch((error) => toast.error(getErrorMessage(error, "Unable to load subscriptions."))).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [page]);
  return <div><AdminPageHeader eyebrow="Billing" title="Payments" description="Read-only subscription records synchronized from trusted Stripe webhook events." />
    <div className="admin-card mb-5 flex items-start gap-3 bg-[var(--admin-surface-soft)] p-4 text-sm"><LockKeyhole className="mt-0.5 size-5 shrink-0 text-[var(--admin-primary)]" /><div><p className="font-semibold">Financial data is read-only</p><p className="mt-0.5 text-[var(--admin-muted-foreground)]">Card details, secret keys and payment mutations remain in Stripe and are never exposed here.</p></div></div>
    {loading ? <AdminTableSkeleton columns={5} /> : <div className="admin-card overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="border-b border-[var(--admin-border)] bg-[var(--admin-surface-soft)] text-xs uppercase tracking-wide text-[var(--admin-muted-foreground)]"><tr><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Stripe references</th><th className="px-4 py-3">Renewal / period end</th><th className="px-4 py-3">Updated</th></tr></thead><tbody className="divide-y divide-[var(--admin-border)]">{items.map((item) => <tr key={item.id} className="hover:bg-[var(--admin-surface-soft)]"><td className="px-4 py-4"><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]"><CreditCard className="size-4" /></span><div><p className="font-semibold">{item.user.username}</p><p className="text-xs text-[var(--admin-muted-foreground)]">{item.user.email}</p></div></div></td><td className="px-4 py-4"><AdminStatusBadge tone={publicationTone(item.status)}>{item.status}</AdminStatusBadge>{item.cancel_at_period_end && <p className="mt-1 text-xs text-[var(--admin-warning)]">Cancels at period end</p>}</td><td className="px-4 py-4 font-mono text-xs"><p className="max-w-52 truncate">{item.stripe_customer_id || "—"}</p><p className="max-w-52 truncate text-[var(--admin-muted-foreground)]">{item.stripe_subscription_id}</p></td><td className="px-4 py-4">{item.current_period_end ? new Date(item.current_period_end).toLocaleDateString() : "—"}</td><td className="px-4 py-4 text-[var(--admin-muted-foreground)]">{new Date(item.updated_at).toLocaleDateString()}</td></tr>)}</tbody></table>{!items.length && <AdminEmptyState title="No subscription records yet" description="Subscription records will appear after trusted Stripe events are processed." />}</div>}
    {!loading && !items.length && <p className="mt-3 text-center text-xs text-[var(--admin-muted-foreground)]">Financial management remains in the Stripe Dashboard <ExternalLink className="inline size-3" />.</p>}
    <AdminPagination meta={meta} onPage={setPage} />
  </div>;
}
