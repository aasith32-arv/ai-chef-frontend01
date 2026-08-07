"use client";

import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function ShimmerSkeleton({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0.55 }}
      animate={{ opacity: [0.55, 1, 0.55] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
    >
      <Skeleton className={cn(className)} />
    </motion.div>
  );
}

export function IngredientTableSkeleton() {
  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <ShimmerSkeleton className="h-4 w-1/3" />
          <ShimmerSkeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}

export function RecipeGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="overflow-hidden rounded-3xl border-border/80 shadow-premium">
          <ShimmerSkeleton className="h-44 w-full rounded-none" />
          <CardHeader className="space-y-2">
            <ShimmerSkeleton className="h-5 w-2/3" />
            <ShimmerSkeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent className="flex gap-2">
            <ShimmerSkeleton className="h-8 w-20 rounded-full" />
            <ShimmerSkeleton className="h-8 w-16 rounded-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function SuggestPageSkeleton() {
  return (
    <div className="space-y-6">
      <ShimmerSkeleton className="h-12 w-full max-w-xl rounded-2xl" />
      <RecipeGridSkeleton count={3} />
    </div>
  );
}
