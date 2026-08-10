"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Tags } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminEmptyState, AdminTableSkeleton } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getErrorMessage } from "@/lib/api-client";
import { getAdminCategories, renameAdminCategory, type AdminCategory } from "@/services/admin";

export default function AdminCategoriesPage() {
  const [items, setItems] = useState<AdminCategory[]>([]);
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const load = useCallback(async () => { try { setItems((await getAdminCategories()).items); } catch (error) { toast.error(getErrorMessage(error, "Unable to load categories.")); } finally { setLoading(false); } }, []);
  useEffect(() => { const request = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(request); }, [load]);
  async function rename() { if (!editing || !name.trim()) return; setPending(true); try { await renameAdminCategory(editing.name, name.trim()); toast.success("Category renamed across recipes and dish families."); setEditing(null); await load(); } catch (error) { toast.error(getErrorMessage(error, "Unable to rename category.")); } finally { setPending(false); } }
  return <div><AdminPageHeader eyebrow="Taxonomy" title="Categories" description="Manage the shared category taxonomy used across recipes and dish families." />{loading ? <AdminTableSkeleton rows={5} columns={4} /> : <div className="admin-card overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead className="border-b border-[var(--admin-border)] bg-[var(--admin-surface-soft)] text-xs uppercase tracking-wide text-[var(--admin-muted-foreground)]"><tr><th className="px-5 py-3">Category</th><th className="px-5 py-3">Recipes</th><th className="px-5 py-3">Dish families</th><th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-[var(--admin-border)]">{items.map((item) => <tr key={item.name} className="hover:bg-[var(--admin-surface-soft)]"><td className="px-5 py-4"><span className="flex items-center gap-3 font-semibold"><span className="flex size-9 items-center justify-center rounded-xl bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]"><Tags className="size-4" /></span>{item.name}</span></td><td className="px-5 py-4">{item.recipe_count}</td><td className="px-5 py-4">{item.family_count}</td><td className="px-5 py-4 text-right"><Button size="sm" variant="ghost" onClick={() => { setEditing(item); setName(item.name); }}><Pencil /> Rename</Button></td></tr>)}</tbody></table>{!items.length && <AdminEmptyState title="No categories found" description="Categories will appear when recipes or dish families use them." />}</div>}<Dialog open={Boolean(editing)} onOpenChange={(value) => !value && setEditing(null)}><DialogContent><DialogHeader><DialogTitle>Rename category</DialogTitle><DialogDescription>This updates every matching recipe and dish family in one transaction.</DialogDescription></DialogHeader><div className="space-y-2"><Label htmlFor="category-name">Category name</Label><Input id="category-name" value={name} onChange={(event) => setName(event.target.value)} /></div><DialogFooter><Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button disabled={pending || !name.trim()} onClick={() => void rename()}>{pending ? "Renaming…" : "Rename category"}</Button></DialogFooter></DialogContent></Dialog></div>;
}
