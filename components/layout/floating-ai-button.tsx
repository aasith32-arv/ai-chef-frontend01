"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function FloatingAiButton() {
  return (
    <motion.div
      className="fixed bottom-24 right-4 z-40 md:bottom-8 md:right-8"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.4 }}
    >
      <Link
        href="/suggest"
        className="group flex items-center gap-2 rounded-full bg-gradient-to-br from-primary to-secondary px-4 py-3 text-sm font-bold text-primary-foreground shadow-float transition-transform hover:scale-105"
        aria-label="Open AI recipe suggestions"
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-white/20">
          <Sparkles className="size-4" />
        </span>
        <span className="pr-1">Ask AI Chef</span>
      </Link>
    </motion.div>
  );
}
