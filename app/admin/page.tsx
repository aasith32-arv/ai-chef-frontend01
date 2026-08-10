"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CircleCheckBig,
  Clock3,
  FolderTree,
  Megaphone,
  Plus,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminEmptyState, AdminErrorState, AdminStatCardSkeleton, AdminStatusBadge, publicationTone } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/api-client";
import { useAuth } from "@/providers/auth-provider";
import { getAdminDashboard, type AdminDashboard } from "@/services/admin";

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try { setDashboard(await getAdminDashboard()); setError(null); }
    catch (reason) { setError(getErrorMessage(reason, "Unable to load the admin dashboard.")); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { const request = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(request); }, [load]);

  const cards = dashboard ? [
    { label: "Total recipes", value: dashboard.statistics.total_recipes, context: `${dashboard.statistics.published_recipes} published`, icon: BookOpen, primary: true },
    { label: "Dish families", value: dashboard.statistics.total_families, context: "Active catalog groups", icon: FolderTree },
    { label: "Registered users", value: dashboard.statistics.total_users, context: `${dashboard.statistics.premium_users} premium`, icon: Users },
    { label: "Draft recipes", value: dashboard.statistics.draft_recipes, context: `${dashboard.statistics.inactive_recipes} inactive`, icon: Clock3 },
    { label: "Published recipes", value: dashboard.statistics.published_recipes, context: "Visible in discovery", icon: CircleCheckBig },
    { label: "Premium users", value: dashboard.statistics.premium_users, context: "Current premium accounts", icon: Sparkles },
    { label: "Advertising orders", value: dashboard.statistics.total_advertisements, context: `${dashboard.statistics.pending_advertisements} pending review`, icon: Megaphone },
    { label: "Pending reviews", value: dashboard.statistics.pending_advertisements, context: "Needs moderation", icon: ShieldCheck },
  ] : [];

  return (
    <div>
      <AdminPageHeader
        eyebrow="Overview"
        title={`Welcome back, ${user?.full_name || user?.username || "Administrator"}`}
        description="Here’s what’s happening across AI Chef’s recipes, customers and intelligent cooking operations."
        actions={<Button asChild className="min-h-11 rounded-xl bg-[var(--admin-primary)] hover:bg-[var(--admin-primary-hover)]"><Link href="/admin/recipes/new"><Plus /> Add Recipe</Link></Button>}
      />

      {error && <AdminErrorState message={error} onRetry={() => void load()} />}
      {loading && <AdminStatCardSkeleton />}
      {dashboard && !loading && (
        <>
          <section aria-label="Dashboard statistics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map(({ label, value, context, icon: Icon, primary }) => (
              <article key={label} className="admin-card p-5">
                <div className={`flex size-10 items-center justify-center rounded-xl border ${primary ? "border-[var(--admin-primary)]/30 bg-[var(--admin-primary-soft)] text-[var(--admin-primary)] shadow-[0_0_20px_var(--admin-primary-glow)]" : "border-[var(--admin-border-strong)] bg-[var(--admin-cyan-soft)] text-[var(--admin-cyan)]"}`}><Icon className="size-5" strokeWidth={1.8} /></div>
                <p className="mt-5 text-[28px] font-bold leading-none tracking-tight">{value.toLocaleString()}</p>
                <p className="mt-2 text-sm font-semibold">{label}</p>
                <p className="mt-1 text-xs text-[var(--admin-muted-foreground)]">{context}</p>
              </article>
            ))}
          </section>

          <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,.65fr)]">
            <section className="admin-card overflow-hidden">
              <div className="flex items-center justify-between border-b border-[var(--admin-border)] px-5 py-4">
                <div><h2 className="text-lg font-semibold">Recent recipes</h2><p className="mt-0.5 text-sm text-[var(--admin-muted-foreground)]">Latest catalog additions and their publishing state.</p></div>
                <Button asChild variant="ghost" size="sm"><Link href="/admin/recipes">View all <ArrowRight /></Link></Button>
              </div>
              {dashboard.recent_recipes.length ? (
                <div className="divide-y divide-[var(--admin-border)]">
                  {dashboard.recent_recipes.map((recipe) => (
                    <Link key={recipe.id} href={`/admin/recipes/${recipe.id}/edit`} className="flex min-h-16 items-center gap-4 px-5 py-3 transition-colors hover:bg-[var(--admin-surface-soft)]">
                      <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--admin-border)] bg-[var(--admin-cyan-soft)] text-[var(--admin-cyan)]">{recipe.image ? <Image src={recipe.image} alt="" fill sizes="48px" className="object-cover" /> : <BookOpen className="size-4" />}</span>
                      <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{recipe.name}</span><span className="block truncate text-xs text-[var(--admin-muted-foreground)]">{recipe.family?.name || recipe.category} · {formatDate(recipe.created_at)}</span></span>
                      <AdminStatusBadge tone={publicationTone(recipe.publication_status)}>{recipe.publication_status}</AdminStatusBadge>
                    </Link>
                  ))}
                </div>
              ) : <AdminEmptyState title="No recent recipes" description="Newly created recipes will appear here." actionHref="/admin/recipes/new" actionLabel="Create recipe" />}
            </section>

            <section className="admin-card overflow-hidden">
              <div className="border-b border-[var(--admin-border)] px-5 py-4"><h2 className="text-lg font-semibold">Admin activity</h2><p className="mt-0.5 text-sm text-[var(--admin-muted-foreground)]">Recent audited management actions.</p></div>
              {dashboard.recent_audit.length ? (
                <ol className="divide-y divide-[var(--admin-border)]">
                  {dashboard.recent_audit.map((entry) => (
                    <li key={entry.id} className="flex gap-3 px-5 py-4">
                      <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[var(--admin-cyan)] shadow-[0_0_10px_var(--admin-cyan-glow)]" />
                      <div className="min-w-0"><p className="text-sm font-semibold capitalize">{entry.action.replaceAll("_", " ")}</p><p className="mt-1 text-xs leading-5 text-[var(--admin-muted-foreground)]">{entry.admin || `Admin ${entry.admin_user_id}`} · {entry.target_type} {entry.target_id ?? ""}<br />{formatDate(entry.created_at)}</p></div>
                    </li>
                  ))}
                </ol>
              ) : <AdminEmptyState title="No admin activity" description="Audited management actions will appear here." />}
            </section>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <section className="admin-card overflow-hidden">
              <div className="flex items-center justify-between border-b border-[var(--admin-border)] px-5 py-4"><div><h2 className="text-lg font-semibold">Recently updated</h2><p className="text-sm text-[var(--admin-muted-foreground)]">Latest catalog edits.</p></div></div>
              <div className="divide-y divide-[var(--admin-border)]">{dashboard.recent_updated_recipes.map((recipe) => <Link key={recipe.id} href={`/admin/recipes/${recipe.id}/edit`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-[var(--admin-surface-soft)]"><div className="min-w-0"><p className="truncate text-sm font-semibold">{recipe.name}</p><p className="text-xs text-[var(--admin-muted-foreground)]">{formatDate(recipe.updated_at)}</p></div><AdminStatusBadge tone={publicationTone(recipe.publication_status)}>{recipe.publication_status}</AdminStatusBadge></Link>)}</div>
            </section>
            <section className="admin-card overflow-hidden">
              <div className="flex items-center justify-between border-b border-[var(--admin-border)] px-5 py-4"><div><h2 className="text-lg font-semibold">Advertising review</h2><p className="text-sm text-[var(--admin-muted-foreground)]">Recent paid and pending orders.</p></div><Button asChild variant="ghost" size="sm"><Link href="/admin/advertisements">View all <ArrowRight /></Link></Button></div>
              {dashboard.recent_advertisements.length ? <div className="divide-y divide-[var(--admin-border)]">{dashboard.recent_advertisements.map((order) => <Link key={order.id} href="/admin/advertisements" className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-[var(--admin-surface-soft)]"><div className="min-w-0"><p className="text-sm font-semibold">Order #{order.id}</p><p className="truncate text-xs text-[var(--admin-muted-foreground)]">{order.customer?.email || "Unknown user"}</p></div><AdminStatusBadge tone={publicationTone(order.review_status)}>{order.review_status.replaceAll("_", " ")}</AdminStatusBadge></Link>)}</div> : <AdminEmptyState title="No advertising orders" description="New advertising purchases will appear here after Stripe reports them." />}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
