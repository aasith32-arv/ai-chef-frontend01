"use client";

import { Languages } from "lucide-react";
import { LOCALES, type Locale } from "@/lib/i18n/types";
import { useLanguage } from "@/providers/language-provider";
import { cn } from "@/lib/utils";

type LanguageSwitcherProps = {
  className?: string;
  compact?: boolean;
};

export function LanguageSwitcher({
  className,
  compact = false,
}: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useLanguage();

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border/80 bg-card/90 p-1 shadow-sm",
        className
      )}
      role="group"
      aria-label={t("lang.label")}
    >
      {!compact && (
        <span className="hidden items-center gap-1 px-2 text-xs text-muted-foreground sm:inline-flex">
          <Languages className="size-3.5" aria-hidden />
          {t("lang.label")}
        </span>
      )}
      {LOCALES.map((item) => (
        <button
          key={item.code}
          type="button"
          onClick={() => setLocale(item.code as Locale)}
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-medium transition-all",
            locale === item.code
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
          aria-pressed={locale === item.code}
          title={item.label}
        >
          {item.native}
        </button>
      ))}
    </div>
  );
}
