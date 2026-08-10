// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AdminShell } from "@/components/admin/admin-shell";

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/recipes",
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock("@/providers/language-provider", () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));
vi.mock("@/providers/auth-provider", () => ({
  useAuth: () => ({
    user: { username: "chefadmin", full_name: "Chef Admin", email: "admin@example.com" },
    logout: vi.fn(),
  }),
}));
vi.mock("@/components/theme-toggle", () => ({ ThemeToggle: () => <button>Theme</button> }));

describe("AdminShell", () => {
  it("provides every management destination and renders page content", () => {
    render(<AdminShell><h1>Recipe management</h1></AdminShell>);

    expect(screen.getByRole("heading", { name: "Recipe management" })).toBeInTheDocument();
    for (const destination of [
      "admin.dashboard",
      "admin.recipes",
      "admin.families",
      "admin.categories",
      "admin.users",
      "admin.advertisements",
      "admin.payments",
      "admin.settings",
    ]) {
      expect(screen.getByRole("link", { name: destination })).toBeInTheDocument();
    }
    expect(screen.getByRole("link", { name: "admin.recipes" })).toHaveAttribute("href", "/admin/recipes");
    expect(screen.getByRole("link", { name: /add recipe/i })).toHaveAttribute("href", "/admin/recipes/new");
    expect(screen.getByRole("button", { name: /open admin navigation/i })).toBeInTheDocument();
  });
});
