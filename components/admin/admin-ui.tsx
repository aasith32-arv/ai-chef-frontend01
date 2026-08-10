import Link from "next/link";
import { AlertCircle, Inbox, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Pagination } from "@/types/api";

type Tone = "success" | "warning" | "danger" | "neutral" | "primary";

const toneClasses: Record<Tone, string> = {
  success: "border-transparent bg-[var(--admin-success-soft)] text-[var(--admin-success)]",
  warning: "border-transparent bg-[var(--admin-warning-soft)] text-[var(--admin-warning)]",
  danger: "border-transparent bg-[var(--admin-danger-soft)] text-[var(--admin-danger)]",
  neutral: "border-[var(--admin-border)] bg-[var(--admin-surface-soft)] text-[var(--admin-muted-foreground)]",
  primary: "border-transparent bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]",
};

export function AdminStatusBadge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: Tone }) {
  return <Badge variant="outline" className={cn("rounded-lg px-2.5 py-1 text-xs font-semibold capitalize", toneClasses[tone])}>{children}</Badge>;
}

export function publicationTone(status: string): Tone {
  if (status === "published" || status === "active" || status === "paid" || status === "approved") return "success";
  if (["draft", "pending", "under_review", "awaiting_payment", "past_due"].includes(status)) return "warning";
  if (["inactive", "rejected", "failed", "canceled", "suspended"].includes(status)) return "danger";
  return "neutral";
}

export function AdminEmptyState({ title, description, actionHref, actionLabel }: { title: string; description: string; actionHref?: string; actionLabel?: string }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center px-6 py-10 text-center">
      <span className="mb-4 flex size-11 items-center justify-center rounded-xl bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]"><Inbox className="size-5" /></span>
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="mt-1 max-w-md text-sm text-[var(--admin-muted-foreground)]">{description}</p>
      {actionHref && actionLabel && <Button asChild className="mt-4 rounded-xl"><Link href={actionHref}>{actionLabel}</Link></Button>}
    </div>
  );
}

export function AdminErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="admin-card flex items-start gap-3 border-[var(--admin-danger)]/30 bg-[var(--admin-danger-soft)] p-4 text-sm text-[var(--admin-danger)]">
      <AlertCircle className="mt-0.5 size-5 shrink-0" />
      <div className="flex-1"><p className="font-semibold">Unable to load this view</p><p className="mt-0.5 opacity-90">{message}</p></div>
      {onRetry && <Button type="button" variant="outline" size="sm" className="border-current bg-transparent" onClick={onRetry}><RefreshCw /> Retry</Button>}
    </div>
  );
}

export function AdminTableSkeleton({ rows = 6, columns = 6 }: { rows?: number; columns?: number }) {
  return (
    <div aria-label="Loading table" className="admin-card overflow-hidden p-4">
      <Skeleton className="mb-5 h-10 w-full rounded-xl" />
      <div className="space-y-3">{Array.from({ length: rows }).map((_, row) => <div key={row} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>{Array.from({ length: columns }).map((__, column) => <Skeleton key={column} className="h-9 rounded-lg" />)}</div>)}</div>
    </div>
  );
}

export function AdminStatCardSkeleton({ count = 8 }: { count?: number }) {
  return <div aria-label="Loading dashboard statistics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: count }).map((_, index) => <Skeleton key={index} className="h-36 rounded-2xl" />)}</div>;
}

export function AdminRecipeGridSkeleton({ count = 8 }: { count?: number }) {
  return <div aria-label="Loading recipes" className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{Array.from({ length: count }).map((_, index) => <div key={index} className="admin-card overflow-hidden"><Skeleton className="aspect-[16/10] w-full rounded-none" /><div className="space-y-3 p-4"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-7 w-full" /></div></div>)}</div>;
}

export function AdminPagination({ meta, onPage }: { meta: Pagination | null; onPage: (page: number) => void }) {
  if (!meta || meta.pages <= 1) return null;
  return <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-[var(--admin-muted-foreground)]">Page {meta.page} of {meta.pages} · {meta.total} results</p><div className="flex gap-2"><Button variant="outline" className="rounded-xl" disabled={!meta.has_prev} onClick={() => onPage(meta.page - 1)}>Previous</Button><Button variant="outline" className="rounded-xl" disabled={!meta.has_next} onClick={() => onPage(meta.page + 1)}>Next</Button></div></div>;
}
