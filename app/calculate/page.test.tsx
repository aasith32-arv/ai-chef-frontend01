// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CalculatePage from "./page";
import type { Recipe } from "@/types/api";

const mocks = vi.hoisted(() => ({
  getAllRecipes: vi.fn(),
  calculate: vi.fn(),
  addShoppingItems: vi.fn(),
  getSubstitutions: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <div role="img" aria-label={alt} />,
}));
vi.mock("@/services/recipes", () => ({ getAllRecipes: mocks.getAllRecipes }));
vi.mock("@/services/calculator", () => ({
  calculateQuantities: mocks.calculate,
}));
vi.mock("@/services/cooking", () => ({
  getSubstitutions: mocks.getSubstitutions,
}));
vi.mock("@/lib/shopping-list", () => ({
  addShoppingItems: mocks.addShoppingItems,
}));
vi.mock("sonner", () => ({
  toast: { success: mocks.toastSuccess },
}));
vi.mock("@/providers/language-provider", () => ({
  useLanguage: () => ({
    locale: "en",
    t: (key: string) =>
      ({
        "calculate.smartCalculator": "Smart Recipe Calculator",
        "calculate.title": "Ingredient Calculator",
        "calculate.tagline": "Cook for 2 or 200 — get the right amount every time.",
        "calculate.subtitle": "Choose a recipe and tell us how many people you're cooking for.",
        "calculate.chooseRecipe": "Choose Recipe",
        "calculate.searchRecipes": "Search recipes…",
        "calculate.recipeResults": "Recipe search results",
        "calculate.noRecipes": "No recipes found.",
        "calculate.errorLoadRecipes": "Recipes could not be loaded. Please try again.",
        "calculate.chooseHint": "Choose a recipe to calculate ingredients.",
        "calculate.originalRecipe": "Original recipe",
        "calculate.howManyPeople": "How many people are you cooking for?",
        "calculate.decreasePeople": "Decrease people",
        "calculate.increasePeople": "Increase people",
        "calculate.quickPresets": "Quick serving presets",
        "calculate.invalidPeople": "Enter a whole number between 1 and 200.",
        "calculate.originalServings": "Original servings",
        "calculate.calculatingFor": "Calculating for",
        "calculate.calculateIngredients": "Calculate Ingredients",
        "calculate.calculating": "Calculating…",
        "calculate.errorCalculate": "Unable to calculate ingredients. Please try again.",
        "calculate.results": "Calculated ingredients",
        "calculate.ingredientsFor": "Ingredients for",
        "calculate.recipeScale": "recipe",
        "calculate.addShopping": "Add Ingredients to Shopping List",
        "calculate.shoppingAdded": "Ingredients added to your shopping list.",
        "calculate.viewRecipe": "View Full Recipe",
        "calculate.startCooking": "Start Cooking",
        "calculate.readyTitle": "Choose a recipe to begin",
        "calculate.readyDesc": "Search the catalog and calculate exact amounts.",
        "substitution.title": "Missing an ingredient?",
        "substitution.description": "Select an ingredient from this recipe.",
        "substitution.missingIngredient": "Missing ingredient",
        "substitution.selectIngredient": "Select ingredient",
        "substitution.find": "Find Substitute",
        "substitution.findAccessible": "Find substitution for selected ingredient",
        "substitution.finding": "Finding the best substitute…",
        "substitution.bestMatch": "Best Match",
        "substitution.goodAlternative": "Good Alternative",
        "substitution.possibleAlternative": "Possible Alternative",
        "substitution.why": "Why it works",
        "substitution.adjustment": "Adjustment",
        "substitution.expectedDifference": "Expected difference",
        "substitution.use": "Use Substitute",
        "substitution.applied": "Substitute applied to this calculation.",
        "substitution.substitutedFor": "Substituted for",
        "substitution.undo": "Undo",
        "substitution.noneTitle": "No suitable substitute found",
        "substitution.noneDescription": "No reliable replacement.",
        "substitution.tryAnother": "Try another ingredient",
        "substitution.error": "Unable to find a substitute right now.",
        "results.people": "people",
        "results.ingredients": "Ingredient list",
        "results.scaledFor": "scaled for",
        "results.ingredient": "Ingredient",
        "results.quantity": "Quantity",
        "common.loading": "Loading…",
      })[key] ?? key,
  }),
}));

const recipe: Recipe = {
  id: 42,
  name: "Hyderabadi Chicken Biryani",
  slug: "hyderabadi-chicken-biryani",
  category: "Rice Dishes",
  family_id: 1,
  family: {
    id: 1,
    name: "Biryani",
    slug: "biryani",
    description: null,
    category: "Rice Dishes",
    image: null,
    is_active: true,
  },
  description: "A dum-cooked biryani.",
  serving_size: 4,
  steps: [],
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
    { id: 101, name: "Basmati rice", quantity: 500, unit: "g" },
    { id: 102, name: "Chicken", quantity: 750, unit: "g" },
  ],
};

async function loadAndSelectRecipe() {
  await act(async () => {
    vi.runAllTimers();
  });
  fireEvent.click(await screen.findByRole("option", { name: /Hyderabadi Chicken Biryani/i }));
}

describe("Calculate page", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true, toFake: ["setTimeout", "clearTimeout"] });
    mocks.getAllRecipes.mockReset().mockResolvedValue([recipe]);
    mocks.calculate.mockReset().mockResolvedValue({
      recipe: recipe.name,
      people: 50,
      serving_size: 4,
      quantities: { "Basmati rice": "6.25 kg", Chicken: "12.5 kg" },
    });
    mocks.addShoppingItems.mockReset();
    mocks.getSubstitutions.mockReset().mockResolvedValue({
      ingredient: "Basmati rice",
      recipe_id: 42,
      original_display: "6.25 kg",
      options: [
        {
          substitution: "sella basmati rice",
          suitability: "Best Match",
          why_it_works: "It remains separate during dum cooking.",
          how_much: "Use the same amount.",
          adjustment: "Check the parboil stage before layering.",
          what_changes: "The grains are firmer.",
          display_quantity: "6.25 kg",
        },
      ],
      context_warning: "Monitor cooking cues.",
      source: "contextual-rule-based",
    });
    mocks.toastSuccess.mockReset();
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("renders the simple calculator without technical provider status", async () => {
    render(<CalculatePage />);
    expect(await screen.findByRole("option", { name: /Hyderabadi Chicken Biryani/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Ingredient Calculator" })).toBeInTheDocument();
    expect(screen.queryByText(/Gemini|OpenAI|API connected|provider=/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Calculate Ingredients" })).toBeDisabled();
  });

  it("searches and selects a catalog recipe with its real metadata", async () => {
    render(<CalculatePage />);
    expect(await screen.findByRole("option", { name: /Hyderabadi Chicken Biryani/i })).toBeInTheDocument();
    const search = screen.getByRole("combobox", { name: "Search recipes…" });
    fireEvent.change(search, { target: { value: "Hyderabadi" } });
    expect(mocks.getAllRecipes).toHaveBeenCalledTimes(1);
    fireEvent.click(await screen.findByRole("option", { name: /Hyderabadi Chicken Biryani/i }));
    expect(screen.getByText("Indian • Hyderabad")).toBeInTheDocument();
    expect(screen.getByText(/Original recipe.*4 people/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Calculate Ingredients" })).toBeEnabled();
  });

  it("shows the complete catalog whenever the recipe search is focused", async () => {
    const secondRecipe = { ...recipe, id: 43, name: "Jaffna Crab Curry" };
    mocks.getAllRecipes.mockResolvedValueOnce([recipe, secondRecipe]);
    render(<CalculatePage />);

    expect(await screen.findByRole("option", { name: /Jaffna Crab Curry/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("option", { name: /Hyderabadi Chicken Biryani/i }));
    fireEvent.focus(screen.getByRole("combobox", { name: "Search recipes…" }));

    expect(screen.getByRole("option", { name: /Hyderabadi Chicken Biryani/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Jaffna Crab Curry/i })).toBeInTheDocument();
  });

  it("supports direct input, step buttons, presets, and invalid validation", async () => {
    render(<CalculatePage />);
    await loadAndSelectRecipe();
    const input = screen.getByRole("spinbutton", { name: /How many people/i });
    fireEvent.change(input, { target: { value: "50" } });
    expect(input).toHaveValue(50);
    fireEvent.click(screen.getByRole("button", { name: "Increase people" }));
    expect(input).toHaveValue(51);
    fireEvent.click(screen.getByRole("button", { name: "25" }));
    expect(input).toHaveValue(25);
    fireEvent.change(input, { target: { value: "0" } });
    expect(screen.getByRole("alert")).toHaveTextContent("between 1 and 200");
    expect(screen.getByRole("button", { name: "Calculate Ingredients" })).toBeDisabled();
  });

  it("calculates through the existing API and exposes shopping and navigation actions", async () => {
    let finishCalculation!: (value: {
      recipe: string;
      people: number;
      serving_size: number;
      quantities: Record<string, string>;
    }) => void;
    mocks.calculate.mockReturnValueOnce(
      new Promise((resolve) => {
        finishCalculation = resolve;
      })
    );
    render(<CalculatePage />);
    await loadAndSelectRecipe();
    fireEvent.click(screen.getByRole("button", { name: "50" }));
    fireEvent.click(screen.getByRole("button", { name: "Calculate Ingredients" }));
    expect(screen.getByRole("button", { name: "Calculating…" })).toBeDisabled();
    await act(async () => {
      finishCalculation({
        recipe: recipe.name,
        people: 50,
        serving_size: 4,
        quantities: { "Basmati rice": "6.25 kg", Chicken: "12.5 kg" },
      });
    });
    expect((await screen.findAllByText("6.25 kg")).length).toBeGreaterThan(0);
    expect(mocks.calculate).toHaveBeenCalledWith({ recipe: recipe.name, people: 50 });
    fireEvent.change(screen.getByLabelText("Missing ingredient"), {
      target: { value: "101" },
    });
    fireEvent.click(
      screen.getByRole("button", {
        name: "Find substitution for selected ingredient",
      })
    );
    fireEvent.click(await screen.findByRole("button", { name: "Use Substitute" }));
    expect(screen.getAllByText("sella basmati rice").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Substituted for.*Basmati rice/).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "Add Ingredients to Shopping List" }));
    expect(mocks.addShoppingItems).toHaveBeenCalledWith([
      { name: "sella basmati rice", quantity: "6.25 kg", dish: recipe.name },
      { name: "Chicken", quantity: "12.5 kg", dish: recipe.name },
    ]);
    fireEvent.click(screen.getAllByRole("button", { name: "Undo" })[0]);
    expect(screen.queryByText(/Substituted for.*Basmati rice/)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View Full Recipe" })).toHaveAttribute("href", "/recipe/42");
    expect(screen.getByRole("link", { name: "Start Cooking" })).toHaveAttribute(
      "href",
      "/recipe/42?servings=50#guided-cooking"
    );
  });

  it("shows a user-facing error when calculation fails", async () => {
    mocks.calculate.mockRejectedValueOnce(new Error("Unable to calculate ingredients. Please try again."));
    render(<CalculatePage />);
    await loadAndSelectRecipe();
    fireEvent.click(screen.getByRole("button", { name: "Calculate Ingredients" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Unable to calculate ingredients");
  });
});
