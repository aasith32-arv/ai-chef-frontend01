"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const load = useCallback(async () => {
    try { const data = await getAdminFamilies({ search: search || undefined, page }); setItems(data.items); setMeta(data.meta); }
    catch (error) { toast.error(getErrorMessage(error, "Unable to load families.")); }
  }, [page, search]);
  useEffect(() => {
    let active = true;
    void getAdminFamilies({ search: search || undefined, page })
      .then((data) => { if (active) { setItems(data.items); setMeta(data.meta); } })
      .catch((error) => toast.error(getErrorMessage(error, "Unable to load families.")));
    return () => { active = false; };
  }, [page, search]);

  function open(item?: AdminFamily) {
    setEditing(item ?? "new");
    setForm(item ? { name: item.name, slug: item.slug, description: item.description || "", category: item.category, image: item.image || "", is_active: item.is_active } : empty);
  }
  async function save() {
    if (!form.name.trim() || !form.category.trim()) { toast.error("Name and category are required."); return; }
    setPending(true);
    try {
      if (editing === "new") await createAdminFamily({ ...form, slug: form.slug || undefined });
      else if (editing) await updateAdminFamily(editing.id, form);
      toast.success(editing === "new" ? "Dish family created successfully." : "Dish family updated successfully.");
      setEditing(null); await load();
    } catch (error) { toast.error(getErrorMessage(error, "Unable to save dish family.")); }
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
    <AdminPageHeader eyebrow="Catalog" title="Dish Families" description="Manage the existing category → family → recipe variety hierarchy without orphaning recipes." actions={<Button onClick={() => open()}><Plus /> New family</Button>} />
    <div className="mb-5 flex gap-2 rounded-2xl border border-border bg-card p-4"><div className="relative flex-1"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search families…" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} /></div><Button variant="outline" onClick={() => void load()}>Refresh</Button></div>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map((item) => <div key={item.id} className="card-premium p-5"><div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-extrabold">{item.name}</h2><p className="text-xs text-muted-foreground">/{item.slug}</p></div><Badge variant={item.is_active ? "default" : "outline"}>{item.is_active ? "Active" : "Inactive"}</Badge></div><p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{item.description || "No description"}</p><div className="mt-4 flex items-center justify-between text-sm"><span>{item.category}</span><strong>{item.recipe_count || 0} recipes</strong></div><div className="mt-4 flex gap-2"><Button size="sm" variant="outline" onClick={() => open(item)}><Pencil /> Edit</Button><Button size="sm" variant="destructive" disabled={Boolean(item.recipe_count)} onClick={() => setDeleting(item)}><Trash2 /> Delete</Button></div></div>)}</div>
    {!items.length && <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">No dish families found.</div>}
    {meta && meta.pages > 1 && <div className="mt-4 flex items-center justify-between"><p className="text-sm text-muted-foreground">Page {meta.page} of {meta.pages}</p><div className="flex gap-2"><Button variant="outline" disabled={!meta.has_prev} onClick={() => setPage((value) => value - 1)}>Previous</Button><Button variant="outline" disabled={!meta.has_next} onClick={() => setPage((value) => value + 1)}>Next</Button></div></div>}
    <Dialog open={Boolean(editing)} onOpenChange={(value) => !value && setEditing(null)}><DialogContent className="sm:max-w-xl"><DialogHeader><DialogTitle>{editing === "new" ? "Create dish family" : "Edit dish family"}</DialogTitle><DialogDescription>Family slugs are stable public URLs and must remain unique.</DialogDescription></DialogHeader><div className="grid gap-3 sm:grid-cols-2"><FormField label="Name"><Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></FormField><FormField label="Slug"><Input value={form.slug} placeholder="generated-from-name" onChange={(event) => setForm({ ...form, slug: event.target.value })} /></FormField><FormField label="Category"><Input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} /></FormField><FormField label="Unsplash image URL"><Input value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} /></FormField><div className="sm:col-span-2"><FormField label="Description"><Textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></FormField></div><label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} /> Active in public discovery</label></div><DialogFooter><Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button disabled={pending} onClick={() => void save()}>{pending ? "Saving…" : "Save family"}</Button></DialogFooter></DialogContent></Dialog>
    <ConfirmationDialog open={Boolean(deleting)} onOpenChange={(value) => !value && setDeleting(null)} title="Delete empty family?" description="Only families with no recipes can be permanently deleted." confirmLabel="Delete family" pending={pending} onConfirm={remove} />
  </div>;
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) { return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>; }
