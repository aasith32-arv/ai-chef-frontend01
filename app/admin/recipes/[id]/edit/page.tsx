"use client";

import { use, useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { RecipeForm } from "@/components/admin/recipe-form";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/api-client";
import { getAdminFamilies, getAdminRecipe, updateAdminRecipe, type AdminRecipePayload } from "@/services/admin";
import type { AdminRecipe, DishFamily } from "@/types/api";

export default function EditAdminRecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const recipeId = Number(id);
  const [recipe, setRecipe] = useState<AdminRecipe | null>(null);
  const [families, setFamilies] = useState<DishFamily[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    void Promise.all([getAdminRecipe(recipeId), getAdminFamilies({ per_page: 100 })]).then(([recipeData, familyData]) => {
      setRecipe(recipeData.recipe); setFamilies(familyData.items);
    }).catch((reason) => setError(getErrorMessage(reason, "Unable to load this recipe.")));
  }, [recipeId]);
  async function submit(payload: AdminRecipePayload) {
    setPending(true);
    try {
      const { recipe: updated } = await updateAdminRecipe(recipeId, payload);
      setRecipe(updated);
      toast.success("Recipe updated successfully.");
    } catch (reason) {
      toast.error(getErrorMessage(reason, "Unable to update recipe."));
    } finally { setPending(false); }
  }
  if (error) return <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-destructive">{error}</div>;
  if (!recipe) return <div className="space-y-4"><Skeleton className="h-12 w-80" /><Skeleton className="h-96 rounded-3xl" /></div>;
  return <div><AdminPageHeader eyebrow="Catalog" title={`Edit ${recipe.name}`} description={`Preserving recipe ID ${recipe.id}, favorites, links, and application integrations.`} /><RecipeForm key={recipe.updated_at} recipe={recipe} families={families} pending={pending} onSubmit={submit} /></div>;
}
