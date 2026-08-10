"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ChartNoAxesCombined,
  CreditCard,
  FolderTree,
  LayoutDashboard,
  Menu,
  Megaphone,
  Settings,
  ShieldCheck,
  Tags,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/providers/language-provider";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navigation = [
  { href: "/admin", label: "admin.dashboard", icon: LayoutDashboard },
  { href: "/admin/recipes", label: "admin.recipes", icon: BookOpen },
  { href: "/admin/families", label: "admin.families", icon: FolderTree },
  { href: "/admin/categories", label: "admin.categories", icon: Tags },
  { href: "/admin/users", label: "admin.users", icon: Users },
  { href: "/admin/advertisements", label: "admin.advertisements", icon: Megaphone },
  { href: "/admin/payments", label: "admin.payments", icon: CreditCard },
  { href: "/admin/settings", label: "admin.settings", icon: Settings },
];

function AdminNav({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  const { t } = useLanguage();
  return (
    <nav aria-label="Admin" className="space-y-1">
      {navigation.map((item) => {
        const active =
          item.href === "/admin"
            ? pathname === item.href
            : pathname.startsWith(item.href);
        const link = (
          <Link
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
              active
                ? "bg-primary text-primary-foreground shadow-premium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="size-4" />
            {t(item.label)}
          </Link>
        );
        return mobile ? <SheetClose key={item.href} asChild>{link}</SheetClose> : <div key={item.href}>{link}</div>;
      })}
    </nav>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-premium py-6 sm:py-8">
      <div className="mb-5 flex items-center justify-between rounded-2xl border border-border bg-card p-3 lg:hidden">
        <div className="flex items-center gap-2 font-extrabold">
          <ShieldCheck className="size-5 text-primary" /> Admin Console
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Open admin navigation">
              <Menu className="size-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>AI Chef Admin</SheetTitle>
              <SheetDescription>Secure catalog and account management</SheetDescription>
            </SheetHeader>
            <div className="px-3"><AdminNav mobile /></div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="sticky top-24 hidden h-fit rounded-3xl border border-border bg-card p-4 shadow-sm lg:block">
          <div className="mb-5 flex items-center gap-3 border-b border-border pb-4">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ChartNoAxesCombined className="size-5" />
            </div>
            <div>
              <p className="font-extrabold">AI Chef Admin</p>
              <p className="text-xs text-muted-foreground">Management Console</p>
            </div>
          </div>
          <AdminNav />
        </aside>
        <section className="min-w-0">{children}</section>
      </div>
    </div>
  );
}
