"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, ShieldCheck, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminEmptyState, AdminPagination, AdminStatusBadge, AdminTableSkeleton } from "@/components/admin/admin-ui";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/lib/api-client";
import { getAdminUsers, updateAdminUser, type AdminUser } from "@/services/admin";
import type { Pagination } from "@/types/api";

type PendingAction = { user: AdminUser; payload: { role?: "user" | "admin"; is_active?: boolean }; title: string; description: string };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [meta, setMeta] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [action, setAction] = useState<PendingAction | null>(null);
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { try { const data = await getAdminUsers({ search: search || undefined, role: role || undefined, page }); setUsers(data.items); setMeta(data.meta); } catch (error) { toast.error(getErrorMessage(error, "Unable to load users.")); } finally { setLoading(false); } }, [page, role, search]);
  useEffect(() => { const request = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(request); }, [load]);
  async function confirm() { if (!action) return; setPending(true); try { await updateAdminUser(action.user.id, action.payload); toast.success("User updated successfully."); setAction(null); await load(); } catch (error) { toast.error(getErrorMessage(error, "Unable to update user.")); } finally { setPending(false); } }
  return <div><AdminPageHeader eyebrow="Customers" title="Users" description="Review non-sensitive account details and securely manage roles and access status." />
    <div className="admin-card mb-5 grid gap-3 p-4 sm:grid-cols-[1fr_180px]"><div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--admin-subtle-foreground)]" /><Input className="h-11 rounded-xl pl-9" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search name or email…" /></div><select aria-label="User role" className="admin-control h-11 rounded-xl border px-3 text-sm" value={role} onChange={(event) => { setRole(event.target.value); setPage(1); }}><option value="">All roles</option><option value="user">Users</option><option value="admin">Administrators</option></select></div>
    {loading ? <AdminTableSkeleton columns={6} /> : <div className="admin-card overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="border-b border-[var(--admin-border)] bg-[var(--admin-surface-soft)] text-xs uppercase tracking-wide text-[var(--admin-muted-foreground)]"><tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Plan</th><th className="px-4 py-3">Joined</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-[var(--admin-border)]">{users.map((user) => { const displayName = user.full_name || user.username; return <tr key={user.id} className="hover:bg-[var(--admin-surface-soft)]"><td className="px-4 py-3"><div className="flex items-center gap-3"><Avatar size="lg"><AvatarFallback className="bg-[var(--admin-primary-soft)] text-sm font-bold text-[var(--admin-primary)]">{displayName.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar><div><p className="font-semibold">{displayName}</p><p className="text-xs text-[var(--admin-muted-foreground)]">{user.email}</p></div></div></td><td className="px-4 py-3"><AdminStatusBadge tone={user.role === "admin" ? "primary" : "neutral"}>{user.role}</AdminStatusBadge></td><td className="px-4 py-3"><AdminStatusBadge tone={user.is_active ? "success" : "danger"}>{user.is_active ? "Active" : "Suspended"}</AdminStatusBadge></td><td className="px-4 py-3">{user.is_premium ? <AdminStatusBadge tone="warning">Premium</AdminStatusBadge> : <span className="text-[var(--admin-muted-foreground)]">Standard</span>}</td><td className="px-4 py-3 text-[var(--admin-muted-foreground)]">{new Date(user.created_at).toLocaleDateString()}</td><td className="px-4 py-3"><div className="flex justify-end gap-2"><Button size="sm" variant="outline" className="rounded-xl" onClick={() => setAction({ user, payload: { role: user.role === "admin" ? "user" : "admin" }, title: user.role === "admin" ? "Demote administrator?" : "Promote to administrator?", description: "Role changes take effect on the backend immediately. The acting and final active administrator remain protected by server safeguards." })}><ShieldCheck /> {user.role === "admin" ? "Demote" : "Promote"}</Button><Button size="sm" variant={user.is_active ? "ghost" : "outline"} className={user.is_active ? "rounded-xl text-[var(--admin-danger)]" : "rounded-xl"} onClick={() => setAction({ user, payload: { is_active: !user.is_active }, title: user.is_active ? "Suspend this account?" : "Reactivate this account?", description: user.is_active ? "Suspended users cannot authenticate or use protected features." : "The user will regain access to protected account features." })}>{user.is_active ? <UserX /> : <UserCheck />}{user.is_active ? "Suspend" : "Activate"}</Button></div></td></tr>; })}</tbody></table>{!users.length && <AdminEmptyState title="No users found" description="Try changing the search term or role filter." />}</div>}
    <AdminPagination meta={meta} onPage={setPage} />
    <ConfirmationDialog open={Boolean(action)} onOpenChange={(value) => !value && setAction(null)} title={action?.title || "Confirm action"} description={action?.description || ""} confirmLabel="Confirm change" pending={pending} onConfirm={confirm} />
  </div>;
}
