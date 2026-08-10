"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BookOpen,
  CircleCheckBig,
  Clock3,
  FolderTree,
  Megaphone,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/api-client";
import { getAdminDashboard, type AdminDashboard } from "@/services/admin";

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getAdminDashboard().then(setDashboard).catch((reason) =>
      setError(getErrorMessage(reason, "Unable to load the admin dashboard."))
    );
  }, []);

  const cards = dashboard ? [
    ["Total recipes", dashboard.statistics.total_recipes, BookOpen],
    ["Dish families", dashboard.statistics.total_families, FolderTree],
    ["Users", dashboard.statistics.total_users, Users],
    ["Premium users", dashboard.statistics.premium_users, Sparkles],
    ["Published", dashboard.statistics.published_recipes, CircleCheckBig],
    ["Draft recipes", dashboard.statistics.draft_recipes, Clock3],
    ["Advertisements", dashboard.statistics.total_advertisements, Megaphone],
    ["Pending reviews", dashboard.statistics.pending_advertisements, ShieldCheck],
  ] as const : [];

  return (
    <div>
      <AdminPageHeader
        eyebrow="Overview"
        title="Admin Dashboard"
        description="Live catalog, membership, advertising, and moderation statistics from the AI Chef database."
        actions={<Button asChild><Link href="/admin/recipes/new">Create recipe</Link></Button>}
      />

      {error && <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}
      {!dashboard && !error && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => <Skeleton key={index} className="h-28 rounded-2xl" />)}
        </div>
      )}
      {dashboard && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map(([label, value, Icon]) => (
              <Card key={label}>
                <CardContent className="flex items-center justify-between p-5">
                  <div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-3xl font-extrabold">{value}</p></div>
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Icon className="size-5" /></div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Recently added recipes</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {dashboard.recent_recipes.map((recipe) => (
                  <Link key={recipe.id} href={`/admin/recipes/${recipe.id}/edit`} className="flex items-center justify-between rounded-xl border border-border p-3 hover:bg-muted/50">
                    <div><p className="font-semibold">{recipe.name}</p><p className="text-xs text-muted-foreground">{recipe.category}</p></div>
                    <Badge variant="outline">{recipe.publication_status}</Badge>
                  </Link>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Recently updated recipes</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {dashboard.recent_updated_recipes.map((recipe) => (
                  <Link key={recipe.id} href={`/admin/recipes/${recipe.id}/edit`} className="flex items-center justify-between rounded-xl border border-border p-3 hover:bg-muted/50">
                    <div><p className="font-semibold">{recipe.name}</p><p className="text-xs text-muted-foreground">{new Date(recipe.updated_at).toLocaleString()}</p></div>
                    <Badge variant="outline">{recipe.publication_status}</Badge>
                  </Link>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Recently registered users</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {dashboard.recent_users.map((user) => (
                  <Link key={user.id} href="/admin/users" className="block rounded-xl border border-border p-3 hover:bg-muted/50">
                    <p className="font-semibold">{user.full_name || user.username}</p>
                    <p className="text-xs text-muted-foreground">{user.email} · {new Date(user.created_at).toLocaleDateString()}</p>
                  </Link>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Recent advertising orders</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {dashboard.recent_advertisements.length ? dashboard.recent_advertisements.map((order) => (
                  <Link key={order.id} href="/admin/advertisements" className="flex items-center justify-between rounded-xl border border-border p-3 hover:bg-muted/50">
                    <div><p className="font-semibold">Order #{order.id}</p><p className="text-xs text-muted-foreground">{order.customer?.email || "Unknown user"}</p></div>
                    <Badge variant="outline">{order.review_status.replaceAll("_", " ")}</Badge>
                  </Link>
                )) : <p className="text-sm text-muted-foreground">No advertising orders yet.</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Recent admin activity</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {dashboard.recent_audit.length ? dashboard.recent_audit.map((entry) => (
                  <div key={entry.id} className="rounded-xl border border-border p-3">
                    <p className="font-semibold">{entry.action.replaceAll("_", " ")}</p>
                    <p className="text-xs text-muted-foreground">{entry.admin || `Admin ${entry.admin_user_id}`} · {entry.target_type} {entry.target_id ?? ""} · {new Date(entry.created_at).toLocaleString()}</p>
                  </div>
                )) : <p className="text-sm text-muted-foreground">No admin actions recorded yet.</p>}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
