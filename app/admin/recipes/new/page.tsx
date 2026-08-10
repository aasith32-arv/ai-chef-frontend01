"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { RecipeForm } from "@/components/admin/recipe-form";
import { getErrorMessage } from "@/lib/api-client";
import { createAdminRecipe, getAdminFamilies, type AdminRecipePayload } from "@/services/admin";
import type { DishFamily } from "@/types/api";

export default function NewAdminRecipePage() {
  const router = useRouter();
  const [families, setFamilies] = useState<DishFamily[]>([]);
  const [pending, setPending] = useState(false);
  useEffect(() => { void getAdminFamilies({ per_page: 100 }).then((data) => setFamilies(data.items)).catch(() => undefined); }, []);
  async function submit(payload: AdminRecipePayload) {
    setPending(true);
    try {
      const { recipe } = await createAdminRecipe(payload);
      toast.success("Recipe created successfully.");
      router.push(`/admin/recipes/${recipe.id}/edit`);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to create recipe."));
      setPending(false);
    }
  }
  return <div><AdminPageHeader eyebrow="Catalog" title="Create Recipe" description="Create one recipe record that works everywhere in AI Chef." /><RecipeForm families={families} pending={pending} onSubmit={submit} /></div>;
}
