"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  BookOpen,
  CircleCheckBig,
  Clock3,
  Copy,
  Eye,
  Grid2X2,
  List,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminEmptyState, AdminErrorState, AdminPagination, AdminRecipeGridSkeleton, AdminStatusBadge, AdminTableSkeleton, publicationTone } from "@/components/admin/admin-ui";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/lib/api-client";
import {
  deactivateAdminRecipe,
  duplicateAdminRecipe,
  getAdminRecipes,
  updateAdminRecipe,
} from "@/services/admin";
import type { AdminRecipe, Pagination } from "@/types/api";

const emptyFilters = { category: "", family: "", cuisine: "", region: "", protein: "", diet_type: "", difficulty: "", spice_level: "" };

function RecipeThumbnail({ recipe, large = false }: { recipe: AdminRecipe; large?: boolean }) {
  const duration = recipeDuration(recipe);
  return (
    <div className={`relative shrink-0 overflow-hidden bg-[var(--admin-primary-soft)] ${large ? "aspect-[16/10] w-full" : "size-11 rounded-xl"}`}>
      {recipe.image ? <Image src={recipe.image} alt="" fill sizes={large ? "(max-width: 768px) 100vw, 320px" : "44px"} className="object-cover" /> : <span className="flex size-full items-center justify-center text-[var(--admin-primary)]"><BookOpen className={large ? "size-8" : "size-4"} /></span>}
      {large && duration && <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg border border-[var(--admin-border-strong)] bg-[rgb(4_10_20_/_0.78)] px-2.5 py-1.5 text-xs font-semibold text-white backdrop-blur"><Clock3 className="size-3.5 text-[var(--admin-cyan)]" />{duration}</span>}
    </div>
  );
}

function recipeDuration(recipe: AdminRecipe) {
  const minutes = (recipe.prep_time ?? 0) + (recipe.cook_time ?? 0);
  return minutes > 0 ? `${minutes} min` : null;
}

export default function AdminRecipesPage() {
  const [recipes, setRecipes] = useState<AdminRecipe[]>([]);
  const [meta, setMeta] = useState<Pagination | null>(null);
  const [search, setSearch] = useState(() => typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("search") || "");
  const [status, setStatus] = useState("");
  const [filters, setFilters] = useState(emptyFilters);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [target, setTarget] = useState<AdminRecipe | null>(null);
  const [pending, setPending] = useState(false);
  const [view, setView] = useState<"table" | "grid">(() => typeof window !== "undefined" && window.localStorage.getItem("ai-chef-admin-recipe-view") === "grid" ? "grid" : "table");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const load = useCallback(async () => {
    try {
      const result = await getAdminRecipes({ search: search || undefined, status: status || undefined, ...filters, page, per_page: 20 });
      setRecipes(result.items); setMeta(result.meta); setError(null);
    } catch (reason) {
      const message = getErrorMessage(reason, "Unable to load recipes.");
      setError(message); toast.error(message);
    } finally { setLoading(false); }
  }, [filters, page, search, status]);

  useEffect(() => { const request = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(request); }, [load]);

  function setFilter(name: keyof typeof filters, value: string) {
    setFilters((current) => ({ ...current, [name]: value })); setPage(1);
  }

  function clearFilters() { setSearch(""); setStatus(""); setFilters(emptyFilters); setPage(1); }

  function selectView(next: "table" | "grid") {
    setView(next);
    window.localStorage.setItem("ai-chef-admin-recipe-view", next);
  }

  const activeFilters = [
    ...(search ? [["search", `Search: ${search}`]] : []),
    ...(status ? [["status", `Status: ${status}`]] : []),
    ...Object.entries(filters).filter(([, value]) => value).map(([key, value]) => [key, `${key.replaceAll("_", " ")}: ${value}`]),
  ];

  function removeFilter(key: string) {
    if (key === "search") setSearch("");
    else if (key === "status") setStatus("");
    else setFilter(key as keyof typeof filters, "");
    setPage(1);
  }

  async function publish(recipe: AdminRecipe) {
    try { await updateAdminRecipe(recipe.id, { publication_status: "published" }); toast.success("Recipe published successfully."); await load(); }
    catch (reason) { toast.error(getErrorMessage(reason, "Unable to publish recipe.")); }
  }

  async function duplicate(recipe: AdminRecipe) {
    try { const result = await duplicateAdminRecipe(recipe.id); toast.success(`${result.recipe.name} created as a draft.`); await load(); }
    catch (reason) { toast.error(getErrorMessage(reason, "Unable to duplicate recipe.")); }
  }

  async function deactivate() {
    if (!target) return;
    setPending(true);
    try { await deactivateAdminRecipe(target.id); toast.success("Recipe deactivated successfully."); setTarget(null); await load(); }
    catch (reason) { toast.error(getErrorMessage(reason, "Unable to deactivate recipe.")); }
    finally { setPending(false); }
  }

  function RecipeActions({ recipe }: { recipe: AdminRecipe }) {
    return (
      <div className="flex items-center justify-end gap-1">
        {recipe.publication_status !== "published" && <Button variant="ghost" size="icon" aria-label={`Publish ${recipe.name}`} onClick={() => void publish(recipe)}><CircleCheckBig /></Button>}
        <Button asChild variant="ghost" size="icon" aria-label={`Edit ${recipe.name}`}><Link href={`/admin/recipes/${recipe.id}/edit`}><Pencil /></Link></Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={`More actions for ${recipe.name}`}><MoreHorizontal /></Button></DropdownMenuTrigger>
          <DropdownMenuContent data-admin-theme="futuristic-ai-chef" align="end" className="w-44 border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] p-1.5 text-[var(--admin-foreground)]">
            {recipe.publication_status === "published" && <DropdownMenuItem asChild><Link href={`/recipe/${recipe.id}`}><Eye /> View recipe</Link></DropdownMenuItem>}
            <DropdownMenuItem asChild><Link href={`/admin/recipes/${recipe.id}/edit`}><Pencil /> Edit</Link></DropdownMenuItem>
            <DropdownMenuItem onSelect={() => void duplicate(recipe)}><Copy /> Duplicate</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" disabled={recipe.publication_status === "inactive"} onSelect={() => setTarget(recipe)}><Trash2 /> Deactivate</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader eyebrow="Content Intelligence" title="Recipe Library" description={`${meta ? `${meta.total.toLocaleString()} recipes · ` : ""}Manage AI Chef’s recipe catalog across discovery, scaling, recommendations and Guided Cooking.`} actions={<Button asChild className="min-h-11 rounded-xl bg-[linear-gradient(135deg,var(--admin-primary),var(--admin-primary-hover))] shadow-[0_8px_24px_var(--admin-primary-glow)]"><Link href="/admin/recipes/new"><Plus /> Add Recipe</Link></Button>} />

      <section aria-label="Recipe filters" className="admin-card mb-5 p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="relative min-w-0 flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--admin-subtle-foreground)]" /><Input className="h-11 rounded-xl border-[var(--admin-border-strong)] pl-9" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search recipe, cuisine, family, region…" /></div>
          <select aria-label="Publication status" className="admin-control h-11 rounded-xl border px-3 text-sm xl:w-44" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="">All statuses</option><option value="published">Published</option><option value="draft">Draft</option><option value="inactive">Inactive</option></select>
          <Input className="h-11 rounded-xl xl:w-44" value={filters.category} onChange={(event) => setFilter("category", event.target.value)} placeholder="Category" />
          <Button variant="outline" className="h-11 rounded-xl" aria-expanded={showAdvanced} onClick={() => setShowAdvanced((value) => !value)}><SlidersHorizontal /> Filters</Button>
          <div className="flex rounded-xl border border-[var(--admin-border)] p-1" aria-label="Recipe view">
            <Button variant={view === "table" ? "secondary" : "ghost"} size="icon-sm" aria-label="Table view" aria-pressed={view === "table"} onClick={() => selectView("table")}><List /></Button>
            <Button variant={view === "grid" ? "secondary" : "ghost"} size="icon-sm" aria-label="Card view" aria-pressed={view === "grid"} onClick={() => selectView("grid")}><Grid2X2 /></Button>
          </div>
        </div>
        {showAdvanced && <div className="mt-4 grid gap-3 border-t border-[var(--admin-border)] pt-4 sm:grid-cols-2 xl:grid-cols-4"><Input value={filters.family} onChange={(event) => setFilter("family", event.target.value)} placeholder="Family slug" /><Input value={filters.cuisine} onChange={(event) => setFilter("cuisine", event.target.value)} placeholder="Cuisine" /><Input value={filters.region} onChange={(event) => setFilter("region", event.target.value)} placeholder="Region" /><Input value={filters.protein} onChange={(event) => setFilter("protein", event.target.value)} placeholder="Protein" /><Input value={filters.diet_type} onChange={(event) => setFilter("diet_type", event.target.value)} placeholder="Diet type" /><select aria-label="Difficulty filter" className="admin-control h-9 rounded-lg border px-3 text-sm" value={filters.difficulty} onChange={(event) => setFilter("difficulty", event.target.value)}><option value="">All difficulties</option><option>Easy</option><option>Medium</option><option>Advanced</option></select><select aria-label="Spice level filter" className="admin-control h-9 rounded-lg border px-3 text-sm" value={filters.spice_level} onChange={(event) => setFilter("spice_level", event.target.value)}><option value="">All spice levels</option><option>Mild</option><option>Medium</option><option>Hot</option></select><div className="flex gap-2"><Button variant="ghost" onClick={clearFilters}><X /> Clear all</Button><Button variant="outline" onClick={() => void load()}><RefreshCw /> Refresh</Button></div></div>}
        {activeFilters.length > 0 && <div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--admin-border)] pt-4" aria-label="Active filters">{activeFilters.map(([key, label]) => <Button key={key} variant="secondary" size="sm" className="rounded-lg capitalize" onClick={() => removeFilter(key)}>{label}<X className="size-3.5" /><span className="sr-only">Remove filter</span></Button>)}<Button variant="ghost" size="sm" onClick={clearFilters}>Clear all</Button></div>}
      </section>

      {error && <AdminErrorState message={error} onRetry={() => void load()} />}
      {loading && (view === "grid" ? <AdminRecipeGridSkeleton /> : <AdminTableSkeleton columns={7} />)}
      {!loading && !error && view === "table" && (
        <div className="admin-card overflow-x-auto">
          <table className="w-full min-w-[940px] text-left text-sm">
            <thead className="border-b border-[var(--admin-border)] bg-[var(--admin-surface-soft)] text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted-foreground)]"><tr><th className="px-4 py-3">Recipe</th><th className="px-4 py-3">Family</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Cuisine</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Updated</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-[var(--admin-border)]">{recipes.map((recipe) => <tr key={recipe.id} className="transition-colors hover:bg-[var(--admin-surface-soft)]"><td className="px-4 py-3"><div className="flex items-center gap-3"><RecipeThumbnail recipe={recipe} /><div className="min-w-0"><p className="max-w-64 truncate font-semibold">{recipe.name}</p><p className="text-xs text-[var(--admin-muted-foreground)]">{recipeDuration(recipe) ? `${recipeDuration(recipe)} · ` : ""}{recipe.difficulty || "Not rated"}</p></div></div></td><td className="px-4 py-3">{recipe.family?.name || "—"}</td><td className="px-4 py-3">{recipe.category}</td><td className="px-4 py-3"><p>{recipe.cuisine || "—"}</p><p className="text-xs text-[var(--admin-muted-foreground)]">{recipe.region || ""}</p></td><td className="px-4 py-3"><AdminStatusBadge tone={publicationTone(recipe.publication_status)}>{recipe.publication_status}</AdminStatusBadge></td><td className="px-4 py-3 text-[var(--admin-muted-foreground)]">{new Date(recipe.updated_at).toLocaleDateString()}</td><td className="px-4 py-3"><RecipeActions recipe={recipe} /></td></tr>)}</tbody>
          </table>
          {!recipes.length && <AdminEmptyState title="No recipes found" description="Try changing your filters or create a new recipe." actionHref="/admin/recipes/new" actionLabel="Create Recipe" />}
        </div>
      )}
      {!loading && !error && view === "grid" && (recipes.length ? <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{recipes.map((recipe) => <article key={recipe.id} className="admin-card overflow-hidden transition-transform duration-150 hover:-translate-y-0.5"><RecipeThumbnail recipe={recipe} large /><div className="p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="line-clamp-2 font-semibold">{recipe.name}</h2><p className="mt-1 truncate text-sm text-[var(--admin-muted-foreground)]">{recipe.family?.name || recipe.category}</p></div><RecipeActions recipe={recipe} /></div><div className="mt-4 flex items-center justify-between"><AdminStatusBadge tone={publicationTone(recipe.publication_status)}>{recipe.publication_status}</AdminStatusBadge>{recipeDuration(recipe) && <span className="text-xs text-[var(--admin-muted-foreground)]">{recipeDuration(recipe)}</span>}</div></div></article>)}</div> : <div className="admin-card"><AdminEmptyState title="No recipes found" description="Try changing your filters or create a new recipe." actionHref="/admin/recipes/new" actionLabel="Create Recipe" /></div>)}
      <AdminPagination meta={meta} onPage={setPage} />
      <ConfirmationDialog open={Boolean(target)} onOpenChange={(open) => !open && setTarget(null)} title="Deactivate this recipe?" description="The recipe will remain stored and favorites will be preserved, but it will disappear from public discovery, scaling, and Guided Cooking." confirmLabel="Deactivate recipe" pending={pending} onConfirm={deactivate} />
    </div>
  );
}
