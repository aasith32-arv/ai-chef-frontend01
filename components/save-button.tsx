"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getErrorMessage, useAuth } from "@/providers/auth-provider";
import * as favoritesService from "@/services/favorites";

type SaveButtonProps = {
  recipeId: number;
  recipeName: string;
  className?: string;
};

export function SaveButton({
  recipeId,
  recipeName,
  className,
}: SaveButtonProps) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;

    let active = true;
    favoritesService
      .getFavorites()
      .then((data) => {
        if (active) {
          setSaved(data.favorites.some((f) => f.recipe_id === recipeId));
        }
      })
      .catch(() => {
        if (active) setSaved(false);
      });
    return () => {
      active = false;
    };
  }, [user, recipeId]);

  async function handleToggle() {
    if (!user) {
      toast.message("Sign in to save recipes", {
        action: {
          label: "Sign in",
          onClick: () => {
            window.location.href = "/auth/login";
          },
        },
      });
      return;
    }

    setBusy(true);
    try {
      if (saved) {
        await favoritesService.removeFavorite(recipeId);
        setSaved(false);
        toast.success(`${recipeName} removed from favorites`);
      } else {
        await favoritesService.addFavorite(recipeId);
        setSaved(true);
        toast.success(`${recipeName} saved to favorites`);
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not update favorites"));
    } finally {
      setBusy(false);
    }
  }

  if (!user) {
    return (
      <Button asChild variant="outline" className={className}>
        <Link href="/auth/login">
          <Bookmark className="size-4" aria-hidden />
          Sign in to save
        </Link>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant={saved ? "default" : "outline"}
      className={className}
      onClick={handleToggle}
      disabled={busy}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved recipes" : "Save recipe"}
    >
      {saved ? (
        <BookmarkCheck className="size-4" aria-hidden />
      ) : (
        <Bookmark className="size-4" aria-hidden />
      )}
      {saved ? "Saved" : "Save recipe"}
    </Button>
  );
}
