"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { FolderTree, Pencil, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminEmptyState, AdminPagination, AdminStatusBadge, publicationTone } from "@/components/admin/admin-ui";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/lib/api-client";
import { createAdminFamily, deleteAdminFamily, getAdminFamilies, updateAdminFamily, type AdminFamily } from "@/services/admin";
import type { Pagination } from "@/types/api";

type FamilyForm = { name: string; slug: string; description: string; category: string; image: string; is_active: boolean };
const empty: FamilyForm = { name: "", slug: "", description: "", category: "", image: "", is_active: true };

export default function AdminFamiliesPage() {
  const [items, setItems] = useState<AdminFamily[]>([]);
  const [meta, setMeta] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<AdminFamily | "new" | null>(null);
  const [form, setForm] = useState<FamilyForm>(empty);
  const [deleting, setDeleting] = useState<AdminFamily | null>(null);
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try { const data = await getAdminFamilies({ search: search || undefined, page }); setItems(data.items); setMeta(data.meta); }
    catch (error) { toast.error(getErrorMessage(error, "Unable to load families.")); }
    finally { setLoading(false); }
  }, [page, search]);
  useEffect(() => { const request = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(request); }, [load]);

  function open(item?: AdminFamily) {
    setEditing(item ?? "new");
    setForm(item ? { name: item.name, slug: item.slug, description: item.description || "", category: item.category, image: item.image || "", is_active: item.is_active } : empty);
  }
  async function save() {
    if (!form.name.trim() || !form.category.trim()) { toast.error("Name and category are required."); return; }
    setPending(true);
    try { if (editing === "new") await createAdminFamily({ ...form, slug: form.slug || undefined }); else if (editing) await updateAdminFamily(editing.id, form); toast.success(editing === "new" ? "Dish family created successfully." : "Dish family updated successfully."); setEditing(null); await load(); }
    catch (error) { toast.error(getErrorMessage(error, "Unable to save dish family.")); }
    finally { setPending(false); }
  }
  async function remove() {
    if (!deleting) return;
    setPending(true);
    try { await deleteAdminFamily(deleting.id); toast.success("Dish family deleted successfully."); setDeleting(null); await load(); }
    catch (error) { toast.error(getErrorMessage(error, "Unable to delete dish family.")); }
    finally { setPending(false); }
  }

  return <div>
    <AdminPageHeader eyebrow="Catalog" title="Dish Families" description="Organize the category → family → recipe variety hierarchy without orphaning recipes." actions={<Button className="min-h-11 rounded-xl" onClick={() => open()}><Plus /> Add Family</Button>} />
    <div className="admin-card mb-5 flex flex-col gap-3 p-4 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--admin-subtle-foreground)]" /><Input className="h-11 rounded-xl pl-9" placeholder="Search dish families…" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} /></div><Button variant="outline" className="h-11 rounded-xl" onClick={() => void load()}><RefreshCw /> Refresh</Button></div>
    {loading ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-72 rounded-2xl" />)}</div> : items.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{items.map((item) => <article key={item.id} className="admin-card overflow-hidden"><div className="relative h-32 bg-[var(--admin-primary-soft)]">{item.image ? <Image src={item.image} alt="" fill sizes="(max-width: 768px) 100vw, 420px" className="object-cover" /> : <FolderTree className="absolute left-5 top-5 size-8 text-[var(--admin-primary)]" />}</div><div className="p-5"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="truncate text-lg font-semibold">{item.name}</h2><p className="text-xs text-[var(--admin-muted-foreground)]">/{item.slug}</p></div><AdminStatusBadge tone={publicationTone(item.is_active ? "active" : "inactive")}>{item.is_active ? "Active" : "Inactive"}</AdminStatusBadge></div><p className="mt-3 line-clamp-2 min-h-10 text-sm leading-5 text-[var(--admin-muted-foreground)]">{item.description || "No description added."}</p><div className="mt-4 flex items-center justify-between border-t border-[var(--admin-border)] pt-4 text-sm"><span>{item.category}</span><strong>{item.recipe_count || 0} recipes</strong></div><div className="mt-4 flex gap-2"><Button className="rounded-xl" size="sm" variant="outline" onClick={() => open(item)}><Pencil /> Edit</Button><Button className="rounded-xl" size="sm" variant="ghost" disabled={Boolean(item.recipe_count)} onClick={() => setDeleting(item)}><Trash2 /> Delete</Button></div></div></article>)}</div> : <div className="admin-card"><AdminEmptyState title="No dish families found" description="Try another search or create the first dish family." actionHref={undefined} actionLabel={undefined} /></div>}
    <AdminPagination meta={meta} onPage={setPage} />
    <Dialog open={Boolean(editing)} onOpenChange={(value) => !value && setEditing(null)}><DialogContent className="sm:max-w-xl"><DialogHeader><DialogTitle>{editing === "new" ? "Create dish family" : "Edit dish family"}</DialogTitle><DialogDescription>Family slugs are stable public URLs and must remain unique.</DialogDescription></DialogHeader><div className="grid gap-4 sm:grid-cols-2"><FormField label="Name"><Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></FormField><FormField label="Slug"><Input value={form.slug} placeholder="generated-from-name" onChange={(event) => setForm({ ...form, slug: event.target.value })} /></FormField><FormField label="Category"><Input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} /></FormField><FormField label="Unsplash image URL"><Input value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} /></FormField><div className="sm:col-span-2"><FormField label="Description"><Textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></FormField></div><label className="flex min-h-11 items-center gap-2 text-sm font-medium"><input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} /> Active in public discovery</label></div><DialogFooter><Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button disabled={pending} onClick={() => void save()}>{pending ? "Saving…" : "Save family"}</Button></DialogFooter></DialogContent></Dialog>
    <ConfirmationDialog open={Boolean(deleting)} onOpenChange={(value) => !value && setDeleting(null)} title="Delete empty family?" description="Only families with no recipes can be permanently deleted." confirmLabel="Delete family" pending={pending} onConfirm={remove} />
  </div>;
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) { return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>; }
