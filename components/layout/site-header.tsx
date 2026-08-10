"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Calculator,
  CreditCard,
  Heart,
  Home,
  Menu,
  ShoppingCart,
  ShieldCheck,
  Sparkles,
  UserRound,
  UtensilsCrossed,
  Wand2,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/providers/auth-provider";
import { useLanguage } from "@/providers/language-provider";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", labelKey: "nav.home", fallback: "Home", icon: Home },
  { href: "/families", labelKey: "nav.discover", fallback: "Discover", icon: UtensilsCrossed },
  { href: "/calculate", labelKey: "nav.calculate", fallback: "Calculate", icon: Calculator },
  { href: "/suggest", labelKey: "nav.suggest", fallback: "Suggest", icon: Wand2 },
  { href: "/pricing", labelKey: "nav.pricing", fallback: "Pricing", icon: CreditCard },
  { href: "/shopping-list", labelKey: "nav.shopping", fallback: "Shop", icon: ShoppingCart },
  { href: "/saved", labelKey: "nav.saved", fallback: "Saved", icon: Heart },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="container-premium flex h-16 items-center justify-between gap-3 lg:h-[4.25rem]">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-black/5 transition-transform group-hover:scale-105">
            <Image
              src="/logo.png"
              alt=""
              width={1254}
              height={1254}
              className="absolute left-1/2 top-[-20%] size-[188%] max-w-none -translate-x-1/2"
              preload
            />
          </span>
          <span className="text-xl font-extrabold tracking-tight sm:text-2xl">
            AI <span className="text-gradient-warm">Chef</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-primary/10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">
                  {t(item.labelKey) || item.fallback}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <LanguageSwitcher />
          {user ? (
            <>
              {user.role === "admin" && (
                <Button asChild variant="outline" className="rounded-full">
                  <Link href="/admin">
                    <ShieldCheck className="size-4" />
                    {t("admin.open") || "Admin Console"}
                  </Link>
                </Button>
              )}
              <Button asChild variant="ghost" className="rounded-full">
                <Link href="/profile">
                  <UserRound className="size-4" />
                  {user.username}
                </Link>
              </Button>
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => {
                  void logout();
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" className="rounded-full">
                <Link href="/auth/login">{t("nav.signIn") || "Sign in"}</Link>
              </Button>
              <Button asChild className="rounded-full shadow-premium">
                <Link href="/calculate">
                  <Sparkles className="size-4" />
                  {t("nav.getStarted") || "Get started"}
                </Link>
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <LanguageSwitcher />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] rounded-l-3xl">
              <SheetHeader>
                <SheetTitle>AI Chef</SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-2">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold hover:bg-muted"
                  >
                    <item.icon className="size-4 text-primary" />
                    {t(item.labelKey) || item.fallback}
                  </Link>
                ))}
                <div className="my-2 h-px bg-border" />
                {user ? (
                  <>
                    {user.role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold hover:bg-muted"
                      >
                        <ShieldCheck className="size-4 text-primary" />
                        {t("admin.open") || "Admin Console"}
                      </Link>
                    )}
                    <Link
                      href="/profile"
                      onClick={() => setOpen(false)}
                      className="rounded-2xl px-3 py-3 text-sm font-semibold hover:bg-muted"
                    >
                      Profile
                    </Link>
                    <button
                      type="button"
                      className="rounded-2xl px-3 py-3 text-left text-sm font-semibold hover:bg-muted"
                      onClick={() => {
                        void logout();
                        setOpen(false);
                      }}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    href="/auth/login"
                    onClick={() => setOpen(false)}
                    className="rounded-2xl bg-primary px-3 py-3 text-center text-sm font-semibold text-primary-foreground"
                  >
                    Sign in
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
