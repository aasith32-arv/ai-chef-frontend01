// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AdminShell } from "@/components/admin/admin-shell";

vi.mock("next/navigation", () => ({ usePathname: () => "/admin/recipes" }));
vi.mock("@/providers/language-provider", () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

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
  });
});
