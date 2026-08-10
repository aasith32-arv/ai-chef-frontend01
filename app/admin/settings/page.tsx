"use client";

import { useEffect, useState } from "react";
import { Bot, CheckCircle2, Database, KeyRound, LockKeyhole, ServerCog, Settings, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatusBadge } from "@/components/admin/admin-ui";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/api-client";
import { getAdminSettings } from "@/services/admin";

const icons = [Settings, Database, Bot, KeyRound, ShieldCheck, ServerCog];

function valueTone(value: unknown) {
  const normalized = String(value).toLowerCase();
  if (["true", "enabled", "configured", "healthy", "production", "connected"].some((word) => normalized.includes(word))) return "success" as const;
  if (["false", "disabled", "not configured", "missing"].some((word) => normalized.includes(word))) return "warning" as const;
  return "neutral" as const;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, Record<string, unknown>> | null>(null);
  useEffect(() => { void getAdminSettings().then(setSettings).catch((error) => toast.error(getErrorMessage(error, "Unable to load safe settings."))); }, []);
  return <div><AdminPageHeader eyebrow="System" title="Settings" description="Review safe application and deployment configuration without exposing secret values." />
    <div className="admin-card mb-6 flex items-start gap-3 border-[var(--admin-primary)]/20 bg-[var(--admin-primary-soft)] p-4 text-sm"><LockKeyhole className="mt-0.5 size-5 shrink-0 text-[var(--admin-primary)]" /><div><p className="font-semibold">Secrets remain server-side</p><p className="mt-0.5 text-[var(--admin-muted-foreground)]">Database URLs, JWT secrets, Stripe keys, webhook secrets and AI provider keys are intentionally unavailable in this browser dashboard.</p></div></div>
    <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">{settings ? Object.entries(settings).map(([section, values], index) => { const Icon = icons[index % icons.length]; return <section key={section} className="admin-card overflow-hidden"><div className="flex items-center gap-3 border-b border-[var(--admin-border)] px-5 py-4"><span className="flex size-9 items-center justify-center rounded-xl bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]"><Icon className="size-4" /></span><h2 className="text-base font-semibold capitalize">{section.replaceAll("_", " ")}</h2></div><dl className="divide-y divide-[var(--admin-border)]">{Object.entries(values).map(([key, value]) => <div key={key} className="flex items-start justify-between gap-4 px-5 py-3"><dt className="text-sm capitalize text-[var(--admin-muted-foreground)]">{key.replaceAll("_", " ")}</dt><dd className="max-w-[58%] break-words text-right text-sm font-semibold">{typeof value === "boolean" ? <AdminStatusBadge tone={value ? "success" : "warning"}><CheckCircle2 className="mr-1 size-3" />{value ? "Enabled" : "Disabled"}</AdminStatusBadge> : Array.isArray(value) ? value.join(", ") : <AdminStatusBadge tone={valueTone(value)}>{String(value)}</AdminStatusBadge>}</dd></div>)}</dl></section>; }) : Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-64 rounded-2xl" />)}</div>
  </div>;
}
