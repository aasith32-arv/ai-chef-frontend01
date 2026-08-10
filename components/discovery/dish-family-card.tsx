"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { DishFamily } from "@/types/api";
import { Badge } from "@/components/ui/badge";
import { foodImageFor } from "@/lib/food-images";
import { useLanguage } from "@/providers/language-provider";

export function DishFamilyCard({
  family,
  eager = false,
}: {
  family: DishFamily;
  eager?: boolean;
}) {
  const { t } = useLanguage();
  const image = family.image?.trim() || foodImageFor(family.name, family.category);

  return (
    <Link
      href={`/families/${family.slug}`}
      className="group card-premium block h-full overflow-hidden transition-all hover:-translate-y-1 hover:shadow-float"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={image}
          alt={family.name}
          fill
          loading={eager ? "eager" : "lazy"}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <Badge className="absolute left-3 top-3 rounded-full bg-white/95 text-foreground">
          {family.category}
        </Badge>
        <p className="absolute bottom-3 left-3 text-sm font-semibold text-white">
          {family.recipe_count ?? 0} {t("discovery.varieties").toLowerCase()}
        </p>
      </div>
      <div className="space-y-2 p-5">
        <h2 className="text-xl font-extrabold tracking-tight group-hover:text-primary">
          {family.name}
        </h2>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {family.description}
        </p>
        <span className="inline-flex items-center gap-1 text-sm font-bold text-primary">
          {t("discovery.viewVarieties")}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
