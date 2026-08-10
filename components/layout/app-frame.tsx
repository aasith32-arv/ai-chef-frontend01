"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { FloatingAiButton } from "@/components/layout/floating-ai-button";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { cn } from "@/lib/utils";

export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <>
      {!isAdmin && <SiteHeader />}
      <main
        id="main-content"
        className={cn("flex-1", !isAdmin && "pb-nav")}
      >
        {children}
      </main>
      {!isAdmin && (
        <>
          <SiteFooter />
          <FloatingAiButton />
          <BottomNav />
        </>
      )}
    </>
  );
}
