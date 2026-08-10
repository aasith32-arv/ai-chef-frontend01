"use client";

import { useEffect, useState } from "react";
import { Pencil, Tags } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
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
  const load = async () => { try { setItems((await getAdminCategories()).items); } catch (error) { toast.error(getErrorMessage(error, "Unable to load categories.")); } };
  useEffect(() => {
    let active = true;
    void getAdminCategories()
      .then((data) => { if (active) setItems(data.items); })
      .catch((error) => toast.error(getErrorMessage(error, "Unable to load categories.")));
    return () => { active = false; };
  }, []);
  async function rename() { if (!editing || !name.trim()) return; try { await renameAdminCategory(editing.name, name.trim()); toast.success("Category renamed across recipes and dish families."); setEditing(null); await load(); } catch (error) { toast.error(getErrorMessage(error, "Unable to rename category.")); } }
  return <div><AdminPageHeader eyebrow="Taxonomy" title="Categories" description="Categories remain a controlled shared string taxonomy, avoiding an unnecessary duplicate model." /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{items.map((item) => <div key={item.name} className="card-premium flex items-center justify-between gap-4 p-5"><div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Tags /></div><div><h2 className="font-bold">{item.name}</h2><p className="text-xs text-muted-foreground">{item.recipe_count} recipes · {item.family_count} families</p></div></div><Button size="icon" variant="ghost" aria-label={`Rename ${item.name}`} onClick={() => { setEditing(item); setName(item.name); }}><Pencil /></Button></div>)}</div><Dialog open={Boolean(editing)} onOpenChange={(value) => !value && setEditing(null)}><DialogContent><DialogHeader><DialogTitle>Rename category</DialogTitle><DialogDescription>This updates every matching recipe and dish family in one transaction.</DialogDescription></DialogHeader><div className="space-y-2"><Label>Category name</Label><Input value={name} onChange={(event) => setName(event.target.value)} /></div><DialogFooter><Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={() => void rename()}>Rename category</Button></DialogFooter></DialogContent></Dialog></div>;
}
