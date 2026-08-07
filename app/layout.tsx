import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { BottomNav } from "@/components/layout/bottom-nav";
import { FloatingAiButton } from "@/components/layout/floating-ai-button";
import { AuthProvider } from "@/providers/auth-provider";
import { LanguageProvider } from "@/providers/language-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { AppErrorBoundary } from "@/components/app-error-boundary";
import "./globals.css";

const fontSans =
  "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export const metadata: Metadata = {
  title: {
    default: "AI Chef — Premium Ingredient Calculator",
    template: "%s | AI Chef",
  },
  description:
    "AI-powered ingredient quantity calculator and recipe assistant. Scale dishes for any guest count and cook smarter with less waste.",
  openGraph: {
    title: "AI Chef — Premium Ingredient Calculator",
    description:
      "Calculate exact ingredient quantities, suggest recipes from what you have, and save favorites.",
    type: "website",
    siteName: "AI Chef",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className="h-full"
      style={{
        "--font-heading": "var(--font-sans)",
        "--font-sans": fontSans,
      } as CSSProperties}
    >
      <body className="flex min-h-full flex-col font-sans">
        <ThemeProvider>
          <AuthProvider>
            <LanguageProvider>
              <TooltipProvider>
                <AppErrorBoundary>
                  <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
                  >
                    Skip to content
                  </a>
                  <SiteHeader />
                  <main id="main-content" className="flex-1 pb-nav">
                    {children}
                  </main>
                  <SiteFooter />
                  <FloatingAiButton />
                  <BottomNav />
                  <Toaster richColors position="top-center" />
                </AppErrorBoundary>
              </TooltipProvider>
            </LanguageProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
