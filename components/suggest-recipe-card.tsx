"use client";

import { useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, ChefHat } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { recipeAccent, recipeImage } from "@/lib/recipe-utils";

type SuggestRecipeCardProps = {
  title: string;
  category: string;
  description: string;
  matchPercent: number;
  matchLabel?: string;
  missing?: string[];
  image?: string | null;
  href?: string;
  onAction?: () => void;
  actionLabel?: string;
  index?: number;
};

export function SuggestRecipeCard({
  title,
  category,
  description,
  matchPercent,
  matchLabel,
  missing = [],
  image,
  href,
  onAction,
  actionLabel = "View recipe",
  index = 0,
}: SuggestRecipeCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const accent = recipeAccent(title);
  const src = recipeImage({
    image: image ?? null,
    name: title,
    category,
  });
  const hasPhoto = !src.includes("unsplash.com")
    ? src !== "/placeholders/dish.svg"
    : true;

  function handleMove(e: MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setTilt({
      x: (py - 0.5) * -10,
      y: (px - 0.5) * 12,
    });
  }

  function handleLeave() {
    setTilt({ x: 0, y: 0 });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: "easeOut" }}
      className="perspective-scene h-full"
    >
      <div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        className="preserve-3d h-full"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: "transform 160ms ease-out",
        }}
      >
        <article className="glass-3d preserve-3d relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/50">
          <div
            className="pointer-events-none absolute -right-8 -top-10 size-32 rounded-full opacity-40 blur-2xl"
            style={{ background: accent.from }}
            aria-hidden
          />
          <div
            className="relative h-44 overflow-hidden"
            style={{
              background: `linear-gradient(145deg, ${accent.from}, ${accent.to})`,
              transform: "translateZ(24px)",
            }}
          >
            {hasPhoto ? (
              <Image
                src={src}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 33vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="flex size-20 items-center justify-center rounded-full bg-white/20 shadow-lg ring-1 ring-white/40 backdrop-blur-md"
                  style={{ transform: "translateZ(40px)" }}
                >
                  <ChefHat className="size-9 text-white drop-shadow" aria-hidden />
                </div>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 to-transparent" />
            <Badge className="absolute left-3 top-3 rounded-full bg-white/90 text-foreground shadow-md">
              {category}
            </Badge>
            <span className="absolute right-3 top-3 rounded-full bg-black/45 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              {Math.round(matchPercent)}% match
            </span>
          </div>

          <div
            className="flex flex-1 flex-col gap-3 p-5"
            style={{ transform: "translateZ(18px)" }}
          >
            <div>
              <h3 className="font-heading text-xl leading-tight tracking-tight">
                {title}
              </h3>
              <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
                <span>Ingredient fit</span>
                <span className="font-medium text-foreground">
                  {matchLabel || `${Math.round(matchPercent)}%`}
                </span>
              </div>
              <Progress
                value={Math.min(100, matchPercent)}
                className="h-2 overflow-hidden rounded-full"
              />
            </div>

            {missing.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Missing: {missing.slice(0, 4).join(", ")}
                {missing.length > 4 ? "…" : ""}
              </p>
            )}

            {href ? (
              <Button asChild className="mt-auto w-full rounded-2xl shadow-md">
                <Link href={href}>
                  {actionLabel}
                  <ArrowUpRight className="size-4" aria-hidden />
                </Link>
              </Button>
            ) : (
              <Button
                className="mt-auto w-full rounded-2xl shadow-md"
                onClick={onAction}
              >
                {actionLabel}
                <ArrowUpRight className="size-4" aria-hidden />
              </Button>
            )}
          </div>
        </article>
      </div>
    </motion.div>
  );
}
