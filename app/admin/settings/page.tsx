"use client";

import { useEffect, useState } from "react";
import { LockKeyhole, Settings } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getErrorMessage } from "@/lib/api-client";
import { getAdminSettings } from "@/services/admin";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, Record<string, unknown>> | null>(null);
  useEffect(() => { void getAdminSettings().then(setSettings).catch((error) => toast.error(getErrorMessage(error, "Unable to load safe settings."))); }, []);
  return <div><AdminPageHeader eyebrow="Configuration" title="Admin Settings" description="Safe application metadata only. Deployment secrets remain server-side environment variables." /><div className="mb-5 flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm"><LockKeyhole className="mt-0.5 size-5 text-primary" /><p>Database URLs, JWT secrets, Stripe keys, webhook secrets, and AI provider keys are intentionally unavailable in this browser dashboard.</p></div><div className="grid gap-4 lg:grid-cols-3">{settings ? Object.entries(settings).map(([section, values]) => <Card key={section}><CardHeader><CardTitle className="flex items-center gap-2 capitalize"><Settings className="size-4 text-primary" />{section}</CardTitle></CardHeader><CardContent className="space-y-3">{Object.entries(values).map(([key, value]) => <div key={key} className="rounded-xl bg-muted/50 p-3"><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{key.replaceAll("_", " ")}</p><p className="mt-1 break-words text-sm font-semibold">{Array.isArray(value) ? value.join(", ") : String(value)}</p></div>)}</CardContent></Card>) : <p className="text-muted-foreground">Loading safe settings…</p>}</div></div>;
}
