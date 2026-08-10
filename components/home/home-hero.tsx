"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { foodHeroImage } from "@/lib/food-images";
import { useLanguage } from "@/providers/language-provider";

export function HomeHero() {
  const router = useRouter();
  const { t } = useLanguage();
  const [query, setQuery] = useState("");

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const dish = query.trim();
    if (!dish) {
      router.push("/families");
      return;
    }
    router.push(`/families?search=${encodeURIComponent(dish)}`);
  }

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={foodHeroImage()}
          alt="Chef preparing a premium meal"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      <div className="container-premium relative flex min-h-[78vh] flex-col justify-end pb-16 pt-28 sm:min-h-[82vh] sm:pb-20 lg:justify-center lg:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl space-y-6 text-white"
        >
          <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] backdrop-blur-md">
            <Sparkles className="size-3.5 text-accent" />
            AI powered kitchen
          </p>
          <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            AI Chef
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-white/85 sm:text-xl">
            Scale any dish for 10 or 100 guests — exact ingredients, less waste,
            confident cooking.
          </p>

          <form
            onSubmit={onSearch}
            className="glass-panel flex max-w-xl items-center gap-2 rounded-full border border-white/40 p-1.5 shadow-float"
          >
            <Search className="ml-3 size-5 shrink-0 text-primary" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("discovery.searchPlaceholder")}
              className="h-11 w-full bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground"
              aria-label={t("discovery.search")}
            />
            <Button type="submit" className="rounded-full px-5 shadow-premium">
              {t("discovery.search")}
              <ArrowRight className="size-4" />
            </Button>
          </form>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="rounded-full shadow-premium">
              <Link href="/calculate">Calculate ingredients</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              <Link href="/suggest">Suggest from pantry</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
