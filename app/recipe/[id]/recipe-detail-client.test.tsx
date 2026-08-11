// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Recipe } from "@/types/api";
import { RecipeDetailClient } from "./recipe-detail-client";

const mocks = vi.hoisted(() => ({
  addShoppingItems: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("sonner", () => ({ toast: { success: mocks.toastSuccess } }));
vi.mock("@/lib/shopping-list", () => ({ addShoppingItems: mocks.addShoppingItems }));
vi.mock("@/lib/recent-recipes", () => ({ trackRecipeView: vi.fn() }));
vi.mock("@/services/ai", () => ({ translateRecipeContent: vi.fn() }));
vi.mock("@/providers/language-provider", () => ({
  useLanguage: () => ({
    locale: "en",
    t: (key: string) => ({
      "recipe.ingredients": "Ingredients",
      "recipe.languageNote": "Language:",
      "substitution.applied": "Substitute applied.",
    })[key] || key,
  }),
}));
vi.mock("@/components/recipe-header", () => ({
  RecipeHeader: ({ servingsControl, actions }: { servingsControl: ReactNode; actions: ReactNode }) => (
    <div>{servingsControl}{actions}</div>
  ),
}));
vi.mock("@/components/steps-accordion", () => ({ StepsAccordion: () => <div>Steps</div> }));
vi.mock("@/components/save-button", () => ({ SaveButton: () => <button>Save</button> }));
vi.mock("@/components/recipe/guest-stepper", () => ({ GuestStepper: () => <div>Servings</div> }));
vi.mock("@/components/recipe/nutrition-strip", () => ({ NutritionStrip: () => <div>Nutrition</div> }));
vi.mock("@/components/recipe/cooking-timer", () => ({ CookingTimer: () => <div>Timer</div> }));
vi.mock("@/components/cooking-intelligence/cooking-intelligence-panel", () => ({
  CookingIntelligencePanel: () => <div>Cooking plan</div>,
}));
vi.mock("@/components/ui/tabs", () => ({
  Tabs: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TabsContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children }: { children: ReactNode }) => <button>{children}</button>,
}));
vi.mock("@/components/calculate/substitution-assistant", () => ({
  SubstitutionAssistant: ({ onApply }: { onApply: (value: {
    originalIngredient: string;
    substitute: string;
    displayQuantity: string;
    adjustment: string;
    expectedDifference: string;
  }) => void }) => (
    <section>
      <h3>Missing an ingredient?</h3>
      <button onClick={() => onApply({
        originalIngredient: "Basmati rice",
        substitute: "Sella basmati rice",
        displayQuantity: "500 g",
        adjustment: "Check earlier",
        expectedDifference: "Firmer grains",
      })}>
        Use Substitute
      </button>
    </section>
  ),
}));

const recipe: Recipe = {
  id: 42,
  name: "Chicken Dum Biryani",
  slug: "chicken-dum-biryani",
  category: "Rice Dishes",
  description: "Layered dum biryani",
  serving_size: 4,
  steps: ["Cook"],
  image: null,
  cuisine: "Indian",
  region: "Hyderabad",
  protein: "Chicken",
  diet_type: "Non-Vegetarian",
  difficulty: "Advanced",
  prep_time: 30,
  cook_time: 60,
  spice_level: "Hot",
  tags: ["dum"],
  publication_status: "published",
  created_at: "2026-01-01T00:00:00",
  updated_at: "2026-01-01T00:00:00",
  ingredients: [
    { id: 1, name: "Basmati rice", quantity: 500, unit: "g" },
    { id: 2, name: "Chicken", quantity: 750, unit: "g" },
  ],
};

describe("Recipe detail substitutions", () => {
  beforeEach(() => {
    mocks.addShoppingItems.mockReset();
    mocks.toastSuccess.mockReset();
  });

  it("applies a found substitute to the recipe and shopping list", () => {
    render(<RecipeDetailClient recipe={recipe} />);

    expect(screen.getByRole("heading", { name: "Missing an ingredient?" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Use Substitute" }));
    expect(screen.getByText("Sella basmati rice")).toBeInTheDocument();
    expect(screen.getByText("Replaces Basmati rice")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Shopping list" }));
    expect(mocks.addShoppingItems).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ name: "Sella basmati rice", dish: "Chicken Dum Biryani" }),
      ])
    );
  });
});
