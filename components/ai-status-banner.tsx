"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { getAIStatus, type AIStatus } from "@/services/ai";

export function AIStatusBanner() {
  const [status, setStatus] = useState<AIStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getAIStatus()
      .then((data) => {
        if (active) {
          setStatus({
            ...data,
            // API responded, so the backend is reachable even if no provider is configured.
            reachable: data.reachable ?? true,
          });
        }
      })
      .catch(() => {
        if (active) {
          setStatus({
            configured: false,
            provider: "none",
            model: "gpt-4o-mini",
            message:
              "Cannot reach smart-chef-api. Start it with: python run.py (port 5000).",
            reachable: false,
          });
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="mb-4 flex items-center gap-2 rounded-2xl border border-border bg-surface/80 px-3 py-2.5 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        Checking API connection…
      </div>
    );
  }

  if (!status) return null;

  const apiUp = status.reachable !== false;
  const providerOk = Boolean(status.configured) && apiUp;
  const providerName =
    status.provider === "gemini"
      ? "Gemini"
      : status.provider === "openai"
        ? "OpenAI"
        : "AI provider";

  return (
    <div
      className={
        providerOk
          ? "mb-4 flex items-start gap-2 rounded-2xl border border-primary/25 bg-primary/5 px-3 py-2.5 text-sm shadow-sm"
          : "mb-4 flex items-start gap-2 rounded-2xl border border-warning/40 bg-warning/10 px-3 py-2.5 text-sm shadow-sm"
      }
    >
      {providerOk ? (
        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
      ) : (
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
      )}
      <div>
        <p className="font-medium">
          {providerOk
            ? `API + ${providerName} connected`
            : apiUp
              ? "API connected · AI provider key missing"
              : "API not reachable"}
        </p>
        <p className="mt-0.5 text-muted-foreground">{status.message}</p>
        {apiUp && !providerOk && (
          <p className="mt-1 text-muted-foreground">
            Restart the backend after updating{" "}
            <code className="rounded bg-muted px-1">smart-chef-api01/.env</code>.
          </p>
        )}
      </div>
    </div>
  );
}
