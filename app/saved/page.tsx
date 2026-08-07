"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bookmark, Search } from "lucide-react";
import { toast } from "sonner";
import type { Favorite } from "@/types/api";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { EmptyState } from "@/components/empty-state";
import { RecipeCard } from "@/components/recipe/recipe-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RecipeGridSkeleton } from "@/components/loading-skeletons";
import { getErrorMessage } from "@/lib/api-client";
import { getFavorites } from "@/services/favorites";

export default function SavedPage() {
  return (
    <AuthenticatedRoute>
      <SavedContent />
    </AuthenticatedRoute>
  );
}

function SavedContent() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let active = true;
    getFavorites()
      .then((data) => {
        if (active) setFavorites(data.favorites);
      })
      .catch((error) => {
        if (active) {
          toast.error(getErrorMessage(error, "Could not load favorites"));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return favorites;
    return favorites.filter(
      (f) =>
        f.recipe.name.toLowerCase().includes(q) ||
        f.recipe.category.toLowerCase().includes(q)
    );
  }, [favorites, query]);

  return (
    <div className="container-premium py-10 sm:py-14">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Saved recipes
          </h1>
          <p className="mt-2 text-muted-foreground leading-relaxed">
            Your favorite dishes, ready to scale anytime.
          </p>
        </div>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search saved…"
            className="h-11 rounded-full pl-10"
            aria-label="Search saved recipes"
          />
        </div>
      </div>

      <div className="mt-10">
        {loading ? (
          <RecipeGridSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Bookmark}
            title={favorites.length ? "No matches" : "No saved recipes yet"}
            description={
              favorites.length
                ? "Try a different search term."
                : "Save dishes from Calculate or Recipe detail to build your shortlist."
            }
            action={
              !favorites.length ? (
                <Button asChild className="rounded-full">
                  <Link href="/calculate">Browse dishes</Link>
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map(({ recipe }, index) => (
              <RecipeCard key={recipe.id} recipe={recipe} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
