"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, ShieldCheck, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import { Badge } from "@/components/ui/badge";
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
  const load = useCallback(async () => { try { const data = await getAdminUsers({ search: search || undefined, role: role || undefined, page }); setUsers(data.items); setMeta(data.meta); } catch (error) { toast.error(getErrorMessage(error, "Unable to load users.")); } }, [page, role, search]);
  useEffect(() => {
    let active = true;
    void getAdminUsers({ search: search || undefined, role: role || undefined, page })
      .then((data) => { if (active) { setUsers(data.items); setMeta(data.meta); } })
      .catch((error) => toast.error(getErrorMessage(error, "Unable to load users.")));
    return () => { active = false; };
  }, [page, role, search]);
  async function confirm() { if (!action) return; setPending(true); try { await updateAdminUser(action.user.id, action.payload); toast.success("User updated successfully."); setAction(null); await load(); } catch (error) { toast.error(getErrorMessage(error, "Unable to update user.")); } finally { setPending(false); } }
  return <div><AdminPageHeader eyebrow="Accounts" title="User Management" description="View non-sensitive account information and securely manage roles and suspension status." />
    <div className="mb-5 grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-[1fr_180px]"><div className="relative"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input className="pl-9" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search name or email…" /></div><select className="h-9 rounded-lg border border-input bg-background px-3 text-sm" value={role} onChange={(event) => { setRole(event.target.value); setPage(1); }}><option value="">All roles</option><option value="user">Users</option><option value="admin">Admins</option></select></div>
    <div className="overflow-x-auto rounded-2xl border border-border bg-card"><table className="w-full min-w-[900px] text-left text-sm"><thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground"><tr><th className="p-3">User</th><th className="p-3">Role</th><th className="p-3">Account</th><th className="p-3">Premium</th><th className="p-3">Joined</th><th className="p-3 text-right">Actions</th></tr></thead><tbody>{users.map((user) => <tr key={user.id} className="border-b border-border last:border-0"><td className="p-3"><p className="font-semibold">{user.full_name || user.username}</p><p className="text-xs text-muted-foreground">{user.email}</p></td><td className="p-3"><Badge variant={user.role === "admin" ? "default" : "outline"}>{user.role}</Badge></td><td className="p-3"><Badge variant={user.is_active ? "outline" : "destructive"}>{user.is_active ? "Active" : "Suspended"}</Badge></td><td className="p-3">{user.is_premium ? "Premium" : "Standard"}</td><td className="p-3 text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</td><td className="p-3"><div className="flex justify-end gap-2"><Button size="sm" variant="outline" onClick={() => setAction({ user, payload: { role: user.role === "admin" ? "user" : "admin" }, title: user.role === "admin" ? "Demote administrator?" : "Promote to administrator?", description: "Role changes take effect on the backend immediately. The final active admin cannot be removed." })}><ShieldCheck /> {user.role === "admin" ? "Demote" : "Promote"}</Button><Button size="sm" variant={user.is_active ? "destructive" : "outline"} onClick={() => setAction({ user, payload: { is_active: !user.is_active }, title: user.is_active ? "Suspend this account?" : "Reactivate this account?", description: user.is_active ? "Suspended users cannot authenticate or use protected features." : "The user will regain access to protected account features." })}>{user.is_active ? <UserX /> : <UserCheck />}{user.is_active ? "Suspend" : "Activate"}</Button></div></td></tr>)}</tbody></table>{!users.length && <div className="p-10 text-center text-muted-foreground">No users found.</div>}</div>
    {meta && meta.pages > 1 && <div className="mt-4 flex items-center justify-between"><p className="text-sm text-muted-foreground">Page {meta.page} of {meta.pages}</p><div className="flex gap-2"><Button variant="outline" disabled={!meta.has_prev} onClick={() => setPage((value) => value - 1)}>Previous</Button><Button variant="outline" disabled={!meta.has_next} onClick={() => setPage((value) => value + 1)}>Next</Button></div></div>}
    <ConfirmationDialog open={Boolean(action)} onOpenChange={(value) => !value && setAction(null)} title={action?.title || "Confirm action"} description={action?.description || ""} confirmLabel="Confirm change" pending={pending} onConfirm={confirm} />
  </div>;
}
