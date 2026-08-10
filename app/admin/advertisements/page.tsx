"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, CirclePlay, Flag, X } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Pagination } from "@/types/api";
import { getErrorMessage } from "@/lib/api-client";
import { getAdminAdvertisements, updateAdminAdvertisement, type AdminAdvertisement } from "@/services/admin";

export default function AdminAdvertisementsPage() {
  const [items, setItems] = useState<AdminAdvertisement[]>([]);
  const [meta, setMeta] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const load = useCallback(async () => { try { const data = await getAdminAdvertisements({ status: status || undefined, page }); setItems(data.items); setMeta(data.meta); } catch (error) { toast.error(getErrorMessage(error, "Unable to load advertisements.")); } }, [page, status]);
  useEffect(() => {
    let active = true;
    void getAdminAdvertisements({ status: status || undefined, page })
      .then((data) => { if (active) { setItems(data.items); setMeta(data.meta); } })
      .catch((error) => toast.error(getErrorMessage(error, "Unable to load advertisements.")));
    return () => { active = false; };
  }, [page, status]);
  async function transition(item: AdminAdvertisement, next: string) { try { await updateAdminAdvertisement(item.id, next); toast.success(`Advertisement marked ${next.replace("_", " ")}.`); await load(); } catch (error) { toast.error(getErrorMessage(error, "Unable to update advertisement.")); } }
  const actions = (item: AdminAdvertisement) => item.review_status === "under_review" ? [["approved", "Approve", Check], ["rejected", "Reject", X]] as const : item.review_status === "approved" ? [["active", "Activate", CirclePlay], ["rejected", "Reject", X]] as const : item.review_status === "active" ? [["completed", "Complete", Flag]] as const : [];
  return <div><AdminPageHeader eyebrow="Moderation" title="Advertisements" description="Review Stripe-confirmed advertising orders without changing trusted payment status." /><div className="mb-5 flex justify-end"><select className="h-9 rounded-lg border border-input bg-background px-3 text-sm" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="">All review statuses</option><option value="awaiting_payment">Awaiting payment</option><option value="under_review">Under review</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="active">Active</option><option value="completed">Completed</option></select></div><div className="space-y-4">{items.map((item) => <div key={item.id} className="card-premium grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center"><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-extrabold">Order #{item.id}</h2><Badge variant={item.payment_status === "paid" ? "default" : "outline"}>Payment: {item.payment_status}</Badge><Badge variant="outline">Review: {item.review_status.replace("_", " ")}</Badge></div><p className="mt-2 text-sm">{item.customer?.username || "Unknown user"} · {item.customer?.email}</p><p className="text-xs text-muted-foreground">LKR {(item.amount / 100).toLocaleString()} · {new Date(item.created_at).toLocaleString()}</p></div><div className="flex flex-wrap gap-2">{actions(item).map(([next, label, Icon]) => <Button key={next} size="sm" variant={next === "rejected" ? "destructive" : "outline"} onClick={() => void transition(item, next)}><Icon /> {label}</Button>)}</div></div>)}</div>{!items.length && <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">No advertising orders found.</div>}{meta && meta.pages > 1 && <div className="mt-4 flex items-center justify-between"><p className="text-sm text-muted-foreground">Page {meta.page} of {meta.pages}</p><div className="flex gap-2"><Button variant="outline" disabled={!meta.has_prev} onClick={() => setPage((value) => value - 1)}>Previous</Button><Button variant="outline" disabled={!meta.has_next} onClick={() => setPage((value) => value + 1)}>Next</Button></div></div>}</div>;
}
