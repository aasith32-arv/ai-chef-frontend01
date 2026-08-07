"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calculator,
  Heart,
  Home,
  ShoppingCart,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/calculate", label: "Calc", icon: Calculator },
  { href: "/suggest", label: "Suggest", icon: Wand2 },
  { href: "/shopping-list", label: "Shop", icon: ShoppingCart },
  { href: "/saved", label: "Saved", icon: Heart },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-card/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 shadow-float backdrop-blur-xl md:hidden"
      aria-label="Mobile"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between gap-1">
        {ITEMS.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold transition-all",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("size-5", active && "scale-110")} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
