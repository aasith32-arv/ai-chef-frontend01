"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, CirclePlay, Flag, Megaphone, X } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminEmptyState, AdminPagination, AdminStatusBadge, publicationTone } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Pagination } from "@/types/api";
import { getErrorMessage } from "@/lib/api-client";
import { getAdminAdvertisements, updateAdminAdvertisement, type AdminAdvertisement } from "@/services/admin";

const statuses = ["", "awaiting_payment", "under_review", "approved", "rejected", "active", "completed"];

export default function AdminAdvertisementsPage() {
  const [items, setItems] = useState<AdminAdvertisement[]>([]);
  const [meta, setMeta] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { try { const data = await getAdminAdvertisements({ status: status || undefined, page }); setItems(data.items); setMeta(data.meta); } catch (error) { toast.error(getErrorMessage(error, "Unable to load advertisements.")); } finally { setLoading(false); } }, [page, status]);
  useEffect(() => { const request = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(request); }, [load]);
  async function transition(item: AdminAdvertisement, next: string) { try { await updateAdminAdvertisement(item.id, next); toast.success(`Advertisement marked ${next.replace("_", " ")}.`); await load(); } catch (error) { toast.error(getErrorMessage(error, "Unable to update advertisement.")); } }
  const actions = (item: AdminAdvertisement) => item.review_status === "under_review" ? [["approved", "Approve", Check], ["rejected", "Reject", X]] as const : item.review_status === "approved" ? [["active", "Activate", CirclePlay], ["rejected", "Reject", X]] as const : item.review_status === "active" ? [["completed", "Complete", Flag]] as const : [];
  return <div><AdminPageHeader eyebrow="Moderation" title="Advertisements" description="Review Stripe-confirmed advertising orders while keeping trusted payment state read-only." />
    <div className="mb-5 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Advertisement status filters">{statuses.map((value) => <Button key={value || "all"} variant={status === value ? "default" : "outline"} size="sm" className="shrink-0 rounded-xl capitalize" onClick={() => { setStatus(value); setPage(1); }}>{value ? value.replaceAll("_", " ") : "All orders"}</Button>)}</div>
    {loading ? <div className="space-y-4">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-36 rounded-2xl" />)}</div> : items.length ? <div className="space-y-4">{items.map((item) => <article key={item.id} className="admin-card grid gap-5 p-5 md:grid-cols-[1fr_auto] md:items-center"><div className="flex items-start gap-4"><span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]"><Megaphone className="size-5" /></span><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold">Order #{item.id}</h2><AdminStatusBadge tone={publicationTone(item.payment_status)}>Payment: {item.payment_status}</AdminStatusBadge><AdminStatusBadge tone={publicationTone(item.review_status)}>Review: {item.review_status.replaceAll("_", " ")}</AdminStatusBadge></div><p className="mt-2 text-sm font-medium">{item.customer?.username || "Unknown user"}</p><p className="text-xs text-[var(--admin-muted-foreground)]">{item.customer?.email || "No customer email"} · {new Date(item.created_at).toLocaleString()}</p><p className="mt-2 text-sm font-semibold">{item.currency.toUpperCase()} {(item.amount / 100).toLocaleString()}</p></div></div><div className="flex flex-wrap gap-2">{actions(item).map(([next, label, Icon]) => <Button key={next} size="sm" className="rounded-xl" variant={next === "rejected" ? "destructive" : "outline"} onClick={() => void transition(item, next)}><Icon /> {label}</Button>)}</div></article>)}</div> : <div className="admin-card"><AdminEmptyState title="No advertising orders found" description="Orders matching this moderation state will appear here." /></div>}
    <AdminPagination meta={meta} onPage={setPage} />
  </div>;
}
