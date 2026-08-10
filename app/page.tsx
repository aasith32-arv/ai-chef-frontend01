"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { HomeHero } from "@/components/home/home-hero";
import { HomeSections } from "@/components/home/home-sections";
import { EmptyState } from "@/components/empty-state";
import { RecipeGridSkeleton } from "@/components/loading-skeletons";
import { Button } from "@/components/ui/button";
import { getRecipes } from "@/services/recipes";
import type { Recipe } from "@/types/api";
import { AlertCircle } from "lucide-react";

export default function HomePage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    void getRecipes({ page: 1, per_page: 16 })
      .then((data) => {
        if (cancelled) return;
        startTransition(() => {
          setRecipes(data.items);
          setError(false);
          setLoading(false);
        });
      })
      .catch(() => {
        if (cancelled) return;
        startTransition(() => {
          setRecipes([]);
          setError(true);
          setLoading(false);
        });
      });
    return () => {
      cancelled = true;
    };
  }, [retryKey, startTransition]);

  const retry = useCallback(() => {
    startTransition(() => {
      setLoading(true);
      setError(false);
      setRetryKey((k) => k + 1);
    });
  }, [startTransition]);

  return (
    <>
      <HomeHero />
      {loading ? (
        <div className="container-premium py-14">
          <RecipeGridSkeleton />
        </div>
      ) : error ? (
        <div className="container-premium py-14">
          <EmptyState
            icon={AlertCircle}
            title="Couldn't load recipes"
            description="Check that the API is running, then try again."
          />
          <div className="mt-6 flex justify-center">
            <Button className="rounded-full" onClick={retry}>
              Retry
            </Button>
          </div>
        </div>
      ) : (
        <HomeSections recipes={recipes} />
      )}
    </>
  );
}
