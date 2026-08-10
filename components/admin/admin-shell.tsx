"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  CreditCard,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Plus,
  Search,
  Settings,
  Tags,
  Users,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { useLanguage } from "@/providers/language-provider";

const groups = [
  {
    label: "Management",
    items: [
      { href: "/admin", label: "admin.dashboard", fallback: "Overview", icon: LayoutDashboard },
      { href: "/admin/recipes", label: "admin.recipes", fallback: "Recipes", icon: BookOpen },
      { href: "/admin/families", label: "admin.families", fallback: "Dish Families", icon: FolderTree },
      { href: "/admin/categories", label: "admin.categories", fallback: "Categories", icon: Tags },
    ],
  },
  {
    label: "Customers",
    items: [
      { href: "/admin/users", label: "admin.users", fallback: "Users", icon: Users },
      { href: "/admin/advertisements", label: "admin.advertisements", fallback: "Advertisements", icon: Megaphone },
      { href: "/admin/payments", label: "admin.payments", fallback: "Payments", icon: CreditCard },
    ],
  },
  {
    label: "System",
    items: [{ href: "/admin/settings", label: "admin.settings", fallback: "Settings", icon: Settings }],
  },
] as const;

const routeTitles: Array<[string, string]> = [
  ["/admin/recipes/new", "New recipe"],
  ["/admin/recipes/", "Edit recipe"],
  ["/admin/recipes", "Recipes"],
  ["/admin/families", "Dish families"],
  ["/admin/categories", "Categories"],
  ["/admin/users", "Users"],
  ["/admin/advertisements", "Advertisements"],
  ["/admin/payments", "Payments"],
  ["/admin/settings", "Settings"],
  ["/admin", "Dashboard"],
];

function initials(name: string) {
  return name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function AdminNav({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <nav aria-label="Admin" className="space-y-6">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--admin-subtle-foreground)]">
            {group.label}
          </p>
          <div className="space-y-1">
            {group.items.map((item) => {
              const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
              const label = t(item.label) || item.fallback;
              const link = (
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors",
                    active
                      ? "border border-[var(--admin-border-strong)] bg-[image:var(--admin-sidebar-active)] text-[var(--admin-foreground)] shadow-[0_0_20px_rgb(40_184_255_/_0.05)]"
                      : "border border-transparent text-[var(--admin-muted-foreground)] hover:bg-[var(--admin-cyan-soft)] hover:text-[var(--admin-foreground)]"
                  )}
                >
                  <item.icon className={cn("size-[18px]", active && "text-[var(--admin-cyan)]")} strokeWidth={1.8} />
                  {label}
                </Link>
              );
              return mobile ? <SheetClose key={item.href} asChild>{link}</SheetClose> : <div key={item.href}>{link}</div>;
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function AdminIdentity({ compact = false }: { compact?: boolean }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const displayName = user?.full_name || user?.username || "Administrator";

  async function signOut() {
    await logout();
    router.push("/auth/login");
  }

  if (compact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-11 gap-2 rounded-xl px-2" aria-label="Open administrator menu">
            <Avatar><AvatarFallback className="bg-[var(--admin-primary-soft)] text-xs font-bold text-[var(--admin-primary)]">{initials(displayName)}</AvatarFallback></Avatar>
            <span className="hidden max-w-32 truncate text-sm font-semibold sm:inline">{displayName}</span>
            <ChevronDown className="size-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent data-admin-theme="futuristic-ai-chef" align="end" className="w-56 border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] p-2 text-[var(--admin-foreground)]">
          <DropdownMenuLabel>
            <span className="block truncate text-sm text-foreground">{displayName}</span>
            <span className="block truncate font-normal">{user?.email}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => router.push("/profile")}>Profile</DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={() => void signOut()}><LogOut /> Sign out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="border-t border-[var(--admin-border)] pt-4">
      <div className="flex items-center gap-3 px-2">
        <Avatar size="lg"><AvatarFallback className="bg-[var(--admin-primary-soft)] font-bold text-[var(--admin-primary)]">{initials(displayName)}</AvatarFallback></Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[var(--admin-foreground)]">{displayName}</p>
          <p className="flex items-center gap-1.5 text-xs text-[var(--admin-muted-foreground)]"><span className="size-1.5 rounded-full bg-[var(--admin-success)]" /> Administrator</p>
        </div>
        <Button variant="ghost" size="icon" className="size-10" aria-label="Sign out" onClick={() => void signOut()}><LogOut className="size-4" /></Button>
      </div>
    </div>
  );
}

function AdminSidebar({ mobile = false }: { mobile?: boolean }) {
  return (
    <div className="flex h-full flex-col">
      <Link href="/admin" className="flex items-center gap-3 px-2 py-1">
        <span className="relative size-11 overflow-hidden rounded-xl bg-white ring-1 ring-black/5">
          <Image src="/logo.png" alt="" width={1254} height={1254} className="absolute left-1/2 top-[-20%] size-[188%] max-w-none -translate-x-1/2" />
        </span>
        <span>
          <span className="block text-lg font-bold tracking-tight text-[var(--admin-foreground)]">AI Chef</span>
          <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--admin-muted-foreground)]">Admin Control Center</span>
        </span>
      </Link>
      <Button asChild className="mt-6 min-h-12 rounded-xl border-0 bg-[linear-gradient(135deg,var(--admin-primary),var(--admin-primary-hover))] text-white shadow-[0_8px_24px_var(--admin-primary-glow)] hover:brightness-110">
        <Link href="/admin/recipes/new"><Plus className="size-4" /> Add Recipe</Link>
      </Button>
      <div className="mt-7 flex-1 overflow-y-auto"><AdminNav mobile={mobile} /></div>
      <AdminIdentity />
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const title = routeTitles.find(([route]) => route === "/admin" ? pathname === route : pathname.startsWith(route))?.[1] || "Admin Console";

  useEffect(() => {
    document.body.dataset.adminTheme = "futuristic-ai-chef";
    return () => { delete document.body.dataset.adminTheme; };
  }, []);

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    if (search.trim()) router.push(`/admin/recipes?search=${encodeURIComponent(search.trim())}`);
  }

  return (
    <div data-admin-theme="futuristic-ai-chef" className="min-h-screen bg-[var(--admin-background)] text-[var(--admin-foreground)]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] border-r border-[var(--admin-border)] bg-[var(--admin-sidebar)] p-5 lg:block">
        <AdminSidebar />
      </aside>

      <div className="lg:pl-[264px]">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[var(--admin-border)] bg-[rgb(7_13_24_/_0.78)] px-4 backdrop-blur-xl sm:px-6 lg:h-[72px] lg:px-8">
          <Sheet>
            <SheetTrigger asChild><Button variant="outline" size="icon" className="size-11 rounded-xl lg:hidden" aria-label="Open admin navigation"><Menu className="size-5" /></Button></SheetTrigger>
            <SheetContent data-admin-theme="futuristic-ai-chef" side="left" className="w-[300px] border-[var(--admin-border)] bg-[var(--admin-sidebar)] p-5 text-[var(--admin-foreground)]">
              <SheetHeader className="sr-only"><SheetTitle>AI Chef Admin</SheetTitle><SheetDescription>Admin navigation</SheetDescription></SheetHeader>
              <AdminSidebar mobile />
            </SheetContent>
          </Sheet>
          <div className="min-w-0">
            <p className="hidden text-xs font-medium text-[var(--admin-subtle-foreground)] sm:block">AI Chef / Command Center</p>
            <p className="truncate text-base font-semibold">{title}</p>
          </div>
          <form onSubmit={submitSearch} className="relative ml-auto hidden w-full max-w-sm md:block">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--admin-cyan)]" />
            <Input aria-label="Search admin recipes" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search recipes…" className="h-10 rounded-xl border-[var(--admin-border)] bg-[rgb(16_32_54_/_0.75)] pl-9 placeholder:text-[var(--admin-subtle-foreground)]" />
          </form>
          <ThemeToggle />
          <AdminIdentity compact />
        </header>
        <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
