"use client";

import { useState } from "react";
import { AlertCircle, Loader2, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { troubleshootCooking } from "@/services/cooking";
import type { TroubleshootingResult } from "@/types/api";

const PROBLEMS = [
  "too salty",
  "too spicy",
  "too watery",
  "too dry",
  "burnt",
  "undercooked",
  "rice too soft",
  "rice too hard",
  "chicken too dry",
  "masala too raw",
  "onion burnt",
];

export function TroubleshootingCard({ context = "" }: { context?: string }) {
  const [problem, setProblem] = useState(PROBLEMS[0]);
  const [result, setResult] = useState<TroubleshootingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function getHelp() {
    setLoading(true);
    setError(false);
    try {
      setResult(await troubleshootCooking(problem, context));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl border border-warning/35 bg-warning/10 p-4">
      <h3 className="flex items-center gap-2 font-bold">
        <Wrench className="size-4 text-warning" /> Something went wrong?
      </h3>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <Select value={problem} onValueChange={setProblem}>
          <SelectTrigger className="h-9 w-full bg-background sm:w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PROBLEMS.map((item) => (
              <SelectItem key={item} value={item}>{item}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={getHelp} disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : <AlertCircle />}
          Get recovery guidance
        </Button>
      </div>
      {error && (
        <p className="mt-3 text-sm text-destructive">
          Guidance is unavailable. Pause the heat and assess the food safely.
        </p>
      )}
      {result && (
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          {[
            ["Probable cause", result.probable_cause],
            ["Do now", result.immediate_action],
            ["Recovery", result.recovery_option],
            ["Next time", result.prevention_tip],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-background/80 p-3">
              <dt className="font-bold">{label}</dt>
              <dd className="mt-1 text-muted-foreground">{value}</dd>
            </div>
          ))}
          <p className="text-xs text-muted-foreground sm:col-span-2">{result.disclaimer}</p>
        </dl>
      )}
    </div>
  );
}
