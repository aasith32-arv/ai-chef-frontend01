"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CircleCheckBig, Copy, Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/api-client";
import {
  deactivateAdminRecipe,
  duplicateAdminRecipe,
  getAdminRecipes,
  updateAdminRecipe,
} from "@/services/admin";
import type { AdminRecipe, Pagination } from "@/types/api";

export default function AdminRecipesPage() {
  const [recipes, setRecipes] = useState<AdminRecipe[]>([]);
  const [meta, setMeta] = useState<Pagination | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [filters, setFilters] = useState({ category: "", family: "", cuisine: "", region: "", protein: "", diet_type: "", difficulty: "", spice_level: "" });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState<AdminRecipe | null>(null);
  const [pending, setPending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAdminRecipes({ search: search || undefined, status: status || undefined, ...filters, page, per_page: 20 });
      setRecipes(result.items);
      setMeta(result.meta);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to load recipes."));
    } finally {
      setLoading(false);
    }
  }, [filters, page, search, status]);

  useEffect(() => {
    let active = true;
    void getAdminRecipes({ search: search || undefined, status: status || undefined, ...filters, page, per_page: 20 })
      .then((result) => {
        if (!active) return;
        setRecipes(result.items);
        setMeta(result.meta);
      })
      .catch((error) => toast.error(getErrorMessage(error, "Unable to load recipes.")))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [filters, page, search, status]);

  function setFilter(name: keyof typeof filters, value: string) {
    setFilters((current) => ({ ...current, [name]: value }));
    setPage(1);
  }

  async function publish(recipe: AdminRecipe) {
    try {
      await updateAdminRecipe(recipe.id, { publication_status: "published" });
      toast.success("Recipe published successfully.");
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to publish recipe."));
    }
  }

  async function duplicate(recipe: AdminRecipe) {
    try {
      const result = await duplicateAdminRecipe(recipe.id);
      toast.success(`${result.recipe.name} created as a draft.`);
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to duplicate recipe."));
    }
  }

  async function deactivate() {
    if (!target) return;
    setPending(true);
    try {
      await deactivateAdminRecipe(target.id);
      toast.success("Recipe deactivated successfully.");
      setTarget(null);
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to deactivate recipe."));
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <AdminPageHeader eyebrow="Catalog" title="Recipe Management" description="Manage the same recipes used by public discovery, scaling, recommendations, favorites, and Guided Cooking." actions={<Button asChild><Link href="/admin/recipes/new"><Plus /> New recipe</Link></Button>} />
      <div className="mb-5 grid gap-3 rounded-2xl border border-border bg-card p-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="relative"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input className="pl-9" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search recipe, cuisine, family, region…" /></div>
        <select className="h-9 rounded-lg border border-input bg-background px-3 text-sm" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="">All statuses</option><option value="published">Published</option><option value="draft">Draft</option><option value="inactive">Inactive</option></select>
        <Input value={filters.category} onChange={(event) => setFilter("category", event.target.value)} placeholder="Category" />
        <Input value={filters.family} onChange={(event) => setFilter("family", event.target.value)} placeholder="Family slug" />
        <Input value={filters.cuisine} onChange={(event) => setFilter("cuisine", event.target.value)} placeholder="Cuisine" />
        <Input value={filters.region} onChange={(event) => setFilter("region", event.target.value)} placeholder="Region" />
        <Input value={filters.protein} onChange={(event) => setFilter("protein", event.target.value)} placeholder="Protein" />
        <Input value={filters.diet_type} onChange={(event) => setFilter("diet_type", event.target.value)} placeholder="Diet type" />
        <select aria-label="Difficulty filter" className="h-9 rounded-lg border border-input bg-background px-3 text-sm" value={filters.difficulty} onChange={(event) => setFilter("difficulty", event.target.value)}><option value="">All difficulties</option><option>Easy</option><option>Medium</option><option>Advanced</option></select>
        <select aria-label="Spice level filter" className="h-9 rounded-lg border border-input bg-background px-3 text-sm" value={filters.spice_level} onChange={(event) => setFilter("spice_level", event.target.value)}><option value="">All spice levels</option><option>Mild</option><option>Medium</option><option>Hot</option></select>
        <div className="flex gap-2 xl:col-span-5 xl:justify-end"><Button variant="outline" onClick={() => { setSearch(""); setStatus(""); setFilters({ category: "", family: "", cuisine: "", region: "", protein: "", diet_type: "", difficulty: "", spice_level: "" }); setPage(1); }}>Clear filters</Button><Button variant="outline" onClick={() => void load()}>Refresh</Button></div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[1050px] text-left text-sm">
          <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="p-3">Recipe</th><th className="p-3">Family</th><th className="p-3">Classification</th><th className="p-3">Difficulty</th><th className="p-3">Status</th><th className="p-3">Updated</th><th className="p-3 text-right">Actions</th></tr></thead>
          <tbody>
            {loading ? Array.from({ length: 6 }).map((_, index) => <tr key={index}><td colSpan={7} className="p-3"><Skeleton className="h-10 w-full" /></td></tr>) : recipes.map((recipe) => (
              <tr key={recipe.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="p-3"><p className="font-semibold">{recipe.name}</p><p className="text-xs text-muted-foreground">{recipe.category}</p></td>
                <td className="p-3">{recipe.family?.name || "—"}</td>
                <td className="p-3"><p>{recipe.cuisine || "—"}</p><p className="text-xs text-muted-foreground">{[recipe.region, recipe.protein, recipe.diet_type].filter(Boolean).join(" · ") || "No metadata"}</p></td>
                <td className="p-3">{recipe.difficulty || "—"}</td>
                <td className="p-3"><Badge variant={recipe.publication_status === "published" ? "default" : "outline"}>{recipe.publication_status}</Badge></td>
                <td className="p-3 text-muted-foreground">{new Date(recipe.updated_at).toLocaleDateString()}</td>
                <td className="p-3"><div className="flex justify-end gap-1">{recipe.publication_status === "published" && <Button asChild variant="ghost" size="icon" aria-label={`View ${recipe.name}`}><Link href={`/recipe/${recipe.id}`}><Eye /></Link></Button>}{recipe.publication_status !== "published" && <Button variant="ghost" size="icon" aria-label={`Publish ${recipe.name}`} onClick={() => void publish(recipe)}><CircleCheckBig /></Button>}<Button asChild variant="ghost" size="icon" aria-label={`Edit ${recipe.name}`}><Link href={`/admin/recipes/${recipe.id}/edit`}><Pencil /></Link></Button><Button variant="ghost" size="icon" aria-label={`Duplicate ${recipe.name}`} onClick={() => void duplicate(recipe)}><Copy /></Button><Button variant="destructive" size="icon" aria-label={`Deactivate ${recipe.name}`} disabled={recipe.publication_status === "inactive"} onClick={() => setTarget(recipe)}><Trash2 /></Button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && recipes.length === 0 && <div className="p-10 text-center text-muted-foreground">No recipes match these filters.</div>}
      </div>
      {meta && meta.pages > 1 && <div className="mt-4 flex items-center justify-between"><p className="text-sm text-muted-foreground">Page {meta.page} of {meta.pages} · {meta.total} recipes</p><div className="flex gap-2"><Button variant="outline" disabled={!meta.has_prev} onClick={() => setPage((value) => value - 1)}>Previous</Button><Button variant="outline" disabled={!meta.has_next} onClick={() => setPage((value) => value + 1)}>Next</Button></div></div>}
      <ConfirmationDialog open={Boolean(target)} onOpenChange={(open) => !open && setTarget(null)} title="Deactivate this recipe?" description="The recipe will remain stored and favorites will be preserved, but it will disappear from public discovery, scaling, and Guided Cooking." confirmLabel="Deactivate recipe" pending={pending} onConfirm={deactivate} />
    </div>
  );
}
