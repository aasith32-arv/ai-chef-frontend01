import Link from "next/link";
import Image from "next/image";

const LINKS = [
  { href: "/calculate", label: "Calculate" },
  { href: "/suggest", label: "Suggest" },
  { href: "/shopping-list", label: "Shopping" },
  { href: "/saved", label: "Saved" },
  { href: "/about", label: "About" },
  { href: "/profile", label: "Profile" },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/70 bg-card/70">
      <div className="container-premium flex flex-col gap-8 py-12 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="AI Chef"
              width={36}
              height={36}
              className="size-9 object-contain"
            />
            <span className="text-lg font-extrabold tracking-tight">
              AI <span className="text-gradient-warm">Chef</span>
            </span>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Premium AI scaling for real kitchens — exact quantities, less waste,
            confident cooking.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Footer">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} AI Chef · Cook smarter. Waste less.
      </div>
    </footer>
  );
}
