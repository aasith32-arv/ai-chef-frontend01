// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminRecipesPage from "@/app/admin/recipes/page";
import type { AdminRecipe } from "@/types/api";

const mocks = vi.hoisted(() => ({
  getAdminRecipes: vi.fn(),
  updateAdminRecipe: vi.fn(),
  duplicateAdminRecipe: vi.fn(),
  deactivateAdminRecipe: vi.fn(),
}));

vi.mock("@/services/admin", () => mocks);
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const recipe: AdminRecipe = {
  id: 42,
  name: "Admin Test Curry",
  slug: "admin-test-curry",
  category: "Curries",
  family_id: null,
  family: null,
  description: "A test recipe",
  serving_size: 4,
  steps: ["Cook gently."],
  image: null,
  cuisine: "Sri Lankan",
  region: "Jaffna",
  protein: "Lentils",
  diet_type: "Vegetarian",
  difficulty: "Easy",
  prep_time: 10,
  cook_time: 25,
  spice_level: "Medium",
  tags: ["curry"],
  publication_status: "draft",
  managed_by_admin: true,
  created_at: "2026-08-09T00:00:00",
  updated_at: "2026-08-09T00:00:00",
  ingredients: [],
};

const page = {
  items: [recipe],
  meta: {
    page: 1,
    per_page: 20,
    total: 1,
    pages: 1,
    has_next: false,
    has_prev: false,
  },
};

describe("AdminRecipesPage", () => {
  beforeEach(() => {
    mocks.getAdminRecipes.mockReset().mockResolvedValue(page);
    mocks.updateAdminRecipe.mockReset().mockResolvedValue({ recipe });
    mocks.duplicateAdminRecipe.mockReset();
    mocks.deactivateAdminRecipe.mockReset();
  });

  it("renders catalog rows and sends search and classification filters to the Admin API", async () => {
    render(<AdminRecipesPage />);
    expect(await screen.findByText("Admin Test Curry")).toBeInTheDocument();
    expect(screen.getByText("Sri Lankan")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Category"), {
      target: { value: "Curries" },
    });
    fireEvent.change(screen.getByPlaceholderText(/search recipe/i), {
      target: { value: "test" },
    });

    await waitFor(() =>
      expect(mocks.getAdminRecipes).toHaveBeenLastCalledWith(
        expect.objectContaining({ search: "test", category: "Curries" })
      )
    );
  });

  it("publishes a draft through the shared update endpoint", async () => {
    render(<AdminRecipesPage />);
    await screen.findByText("Admin Test Curry");

    fireEvent.click(screen.getByRole("button", { name: "Publish Admin Test Curry" }));
    await waitFor(() =>
      expect(mocks.updateAdminRecipe).toHaveBeenCalledWith(42, {
        publication_status: "published",
      })
    );
  });
});
