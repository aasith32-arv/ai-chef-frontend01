"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Beef, Cookie, Droplets, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  estimateNutrition,
  type NutritionPayload,
} from "@/lib/nutrition";

type NutritionStripProps = {
  people: number;
  seed?: string;
  className?: string;
};

export function NutritionStrip({ people, seed, className }: NutritionStripProps) {
  const [data, setData] = useState<NutritionPayload>(() =>
    estimateNutrition(seed || "dish", people)
  );

  useEffect(() => {
    let active = true;
    const q = encodeURIComponent(seed || "recipe");
    fetch(`/api/nutrition?q=${q}&people=${people}`)
      .then((res) => res.json())
      .then((payload: NutritionPayload) => {
        if (active) setData(payload);
      })
      .catch(() => {
        if (active) setData(estimateNutrition(seed || "dish", people));
      });
    return () => {
      active = false;
    };
  }, [people, seed]);

  const items = [
    { label: "Calories", value: `${data.calories}`, unit: "kcal", icon: Flame },
    { label: "Protein", value: `${data.protein}`, unit: "g", icon: Beef },
    { label: "Carbs", value: `${data.carbs}`, unit: "g", icon: Cookie },
    { label: "Fat", value: `${data.fat}`, unit: "g", icon: Droplets },
  ];

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-xs font-medium text-muted-foreground">{data.label}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-2xl border border-border/80 bg-surface/80 p-3 shadow-sm"
          >
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <item.icon className="size-3.5 text-primary" />
              {item.label}
            </div>
            <p className="text-xl font-extrabold tracking-tight">
              {item.value}
              <span className="ml-1 text-xs font-semibold text-muted-foreground">
                {item.unit}
              </span>
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
