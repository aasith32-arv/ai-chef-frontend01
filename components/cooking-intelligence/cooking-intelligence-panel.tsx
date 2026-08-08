"use client";

import { useEffect, useState } from "react";
import { FlaskConical, GraduationCap, Loader2, RefreshCw, SlidersHorizontal } from "lucide-react";
import { CookingPlan } from "./cooking-plan";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCookingPlan } from "@/services/cooking";
import type { CookingPlanData, CookingPreferences } from "@/types/api";

type Settings = Omit<CookingPreferences, "servings" | "available_ingredients">;

const DEFAULT_SETTINGS: Settings = {
  spice_level: "medium",
  oil_level: "standard",
  salt_preference: "standard",
  dietary_restrictions: [],
  cooking_method: "stovetop",
  cookware: "standard pan",
  preferred_texture: "as written",
  beginner_mode: true,
  science_mode: false,
};

export function CookingIntelligencePanel({
  recipeId,
  servings,
}: {
  recipeId: number;
  servings: number;
}) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [plan, setPlan] = useState<CookingPlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;
    void getCookingPlan(recipeId, { ...settings, servings })
      .then((data) => {
        if (!active) return;
        setPlan(data);
        setError(false);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [recipeId, retryKey, servings, settings]);

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setLoading(true);
    setError(false);
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function retry() {
    setLoading(true);
    setError(false);
    setRetryKey((value) => value + 1);
  }

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-bold">
            <SlidersHorizontal className="size-4 text-primary" /> Personalize this plan
          </h2>
          {loading && plan && (
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" /> Updating guidance…
            </span>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <PreferenceSelect
            label="Spice"
            value={settings.spice_level}
            options={["mild", "medium", "hot"]}
            onChange={(value) => update("spice_level", value as Settings["spice_level"])}
          />
          <PreferenceSelect
            label="Oil"
            value={settings.oil_level}
            options={["low", "standard"]}
            onChange={(value) => update("oil_level", value as Settings["oil_level"])}
          />
          <PreferenceSelect
            label="Salt"
            value={settings.salt_preference}
            options={["low", "standard"]}
            onChange={(value) => update("salt_preference", value as Settings["salt_preference"])}
          />
          <PreferenceSelect
            label="Diet"
            value={settings.dietary_restrictions[0] || "none"}
            options={["none", "vegetarian", "vegan", "dairy-free", "gluten-free"]}
            onChange={(value) => update("dietary_restrictions", value === "none" ? [] : [value])}
          />
          <PreferenceSelect
            label="Cookware"
            value={settings.cookware}
            options={["standard pan", "heavy pot", "non-stick pan", "wok"]}
            onChange={(value) => update("cookware", value)}
          />
          <PreferenceSelect
            label="Texture"
            value={settings.preferred_texture}
            options={["as written", "softer", "firmer"]}
            onChange={(value) => update("preferred_texture", value)}
          />
          <Button
            variant={settings.beginner_mode ? "default" : "outline"}
            className="h-14 justify-start rounded-2xl"
            onClick={() => update("beginner_mode", !settings.beginner_mode)}
          >
            <GraduationCap /> Beginner Mode {settings.beginner_mode ? "On" : "Off"}
          </Button>
          <Button
            variant={settings.science_mode ? "default" : "outline"}
            className="h-14 justify-start rounded-2xl"
            onClick={() => update("science_mode", !settings.science_mode)}
          >
            <FlaskConical /> Cooking Science {settings.science_mode ? "On" : "Off"}
          </Button>
        </div>
      </div>

      {loading && !plan && (
        <div className="flex min-h-56 items-center justify-center rounded-3xl border border-border bg-card">
          <p className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="animate-spin" /> Building your cooking plan…
          </p>
        </div>
      )}
      {error && !plan && (
        <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-8 text-center">
          <h2 className="font-bold">Couldn&apos;t build the cooking plan</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The original recipe is still available. Check the API and try again.
          </p>
          <Button className="mt-4" variant="outline" onClick={retry}>
            <RefreshCw /> Retry
          </Button>
        </div>
      )}
      {plan && <CookingPlan plan={plan} />}
    </div>
  );
}

function PreferenceSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-1 text-xs font-semibold text-muted-foreground">
      {label}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9 w-full bg-background capitalize"><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option} className="capitalize">{option}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}
