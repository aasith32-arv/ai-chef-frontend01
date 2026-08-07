"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AiAssistantBanner() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="container-premium"
    >
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-secondary to-[#c2410c] p-6 text-primary-foreground shadow-float sm:p-8">
        <div className="absolute -right-10 -top-10 size-40 rounded-full bg-accent/30 blur-2xl" />
        <div className="absolute -bottom-12 left-1/3 size-48 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl space-y-2">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-white/80">
              <Sparkles className="size-3.5" />
              AI assistant
            </p>
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Tell AI Chef what&apos;s in your pantry
            </h2>
            <p className="text-sm leading-relaxed text-white/85 sm:text-base">
              Get smart dish ideas, scaled quantities, and cooking steps in
              seconds — tailored to your ingredients.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="rounded-full bg-white text-primary hover:bg-white/90"
          >
            <Link href="/suggest">
              <Wand2 className="size-4" />
              Open Suggest
            </Link>
          </Button>
        </div>
      </div>
    </motion.section>
  );
}
