import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RecipeDetailClient } from "./recipe-detail-client";
import type { ApiSuccess, Recipe } from "@/types/api";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ servings?: string }>;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

async function fetchRecipe(id: string): Promise<Recipe | null> {
  try {
    const res = await fetch(`${API_URL}/recipes/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as ApiSuccess<{ recipe: Recipe }>;
    return json.data?.recipe ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const recipe = await fetchRecipe(id);
  if (!recipe) return { title: "Recipe not found" };
  return {
    title: recipe.name,
    description: recipe.description || `Cook ${recipe.name} with AI Chef.`,
    openGraph: {
      title: `${recipe.name} | AI Chef`,
      description: recipe.description || undefined,
    },
  };
}

export default async function RecipePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { servings } = await searchParams;
  if (!/^\d+$/.test(id)) notFound();

  const recipe = await fetchRecipe(id);
  if (!recipe) notFound();

  const requestedServings = Number(servings);
  const initialServings =
    Number.isInteger(requestedServings) && requestedServings >= 1 && requestedServings <= 200
      ? requestedServings
      : recipe.serving_size;

  return <RecipeDetailClient recipe={recipe} initialServings={initialServings} />;
}
