// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  SubstitutionAssistant,
  type AppliedSubstitution,
} from "./substitution-assistant";

const mocks = vi.hoisted(() => ({ getSubstitutions: vi.fn() }));

vi.mock("@/services/cooking", () => ({ getSubstitutions: mocks.getSubstitutions }));
vi.mock("@/providers/language-provider", () => ({
  useLanguage: () => ({
    t: (key: string) =>
      ({
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
        "substitution.noneTitle": "No suitable substitute found",
        "substitution.noneDescription": "No reliable replacement.",
        "substitution.tryAnother": "Try another ingredient",
        "substitution.error": "Unable to find a substitute right now. Please try again.",
      })[key] ?? key,
  }),
}));

const ingredients = [
  { id: 1, name: "Basmati rice", quantity: 500, unit: "g" },
  { id: 2, name: "Chicken", quantity: 750, unit: "g" },
];
const scaledIngredients = [
  { name: "Basmati rice", quantity: 0, unit: "", displayQuantity: "6.25 kg" },
  { name: "Chicken", quantity: 0, unit: "", displayQuantity: "9.4 kg" },
];

const contextualResult = {
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
    {
      substitution: "jeerakasala rice",
      suitability: "Good Alternative",
      why_it_works: "It is used in layered biryanis.",
      how_much: "Use the same amount.",
      adjustment: "Check doneness earlier.",
      what_changes: "The grain is shorter.",
      display_quantity: "6.25 kg",
    },
  ],
  no_substitute_reason: null,
  context_warning: "Monitor cooking cues.",
  source: "contextual-rule-based",
};

describe("SubstitutionAssistant", () => {
  beforeEach(() => mocks.getSubstitutions.mockReset());

  it("lists only recipe ingredients and requests trusted scaled context", async () => {
    let resolveResult!: (value: typeof contextualResult) => void;
    mocks.getSubstitutions.mockReturnValue(
      new Promise((resolve) => {
        resolveResult = resolve;
      })
    );
    const onApply = vi.fn<(value: AppliedSubstitution) => void>();
    render(
      <SubstitutionAssistant
        recipeId={42}
        servings={50}
        ingredients={ingredients}
        scaledIngredients={scaledIngredients}
        onApply={onApply}
      />
    );

    const select = screen.getByLabelText("Missing ingredient");
    expect(screen.getByRole("option", { name: "Basmati rice" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Chicken" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Coconut milk" })).not.toBeInTheDocument();
    fireEvent.change(select, { target: { value: "1" } });
    expect(screen.getByText("6.25 kg")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", {
        name: "Find substitution for selected ingredient",
      })
    );
    expect(mocks.getSubstitutions).toHaveBeenCalledWith("Basmati rice", 42, {
      ingredientId: 1,
      servings: 50,
    });
    expect(screen.getByText("Finding the best substitute…")).toBeInTheDocument();

    await act(async () => resolveResult(contextualResult));
    expect(screen.getByText("sella basmati rice")).toBeInTheDocument();
    expect(screen.getByText("jeerakasala rice")).toBeInTheDocument();
    expect(screen.getByText("Check the parboil stage before layering.")).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: "Use Substitute" })[0]);
    expect(onApply).toHaveBeenCalledWith({
      originalIngredient: "Basmati rice",
      substitute: "sella basmati rice",
      displayQuantity: "6.25 kg",
      adjustment: "Check the parboil stage before layering.",
      expectedDifference: "The grains are firmer.",
    });
  });

  it("renders a safe no-substitute state", async () => {
    mocks.getSubstitutions.mockResolvedValue({
      ingredient: "Chicken",
      options: [],
      no_substitute_reason: "Chicken is essential to this selected recipe.",
      context_warning: "Chicken is essential to this selected recipe.",
      source: "rule-based-fallback",
    });
    render(
      <SubstitutionAssistant
        recipeId={42}
        servings={8}
        ingredients={ingredients}
        scaledIngredients={scaledIngredients}
        onApply={vi.fn()}
      />
    );
    fireEvent.change(screen.getByLabelText("Missing ingredient"), {
      target: { value: "2" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Find substitution/i }));
    expect(await screen.findByText("No suitable substitute found")).toBeInTheDocument();
    expect(screen.getByText("Chicken is essential to this selected recipe.")).toBeInTheDocument();
  });

  it("shows a user-safe request error and clears stale state when servings change", async () => {
    mocks.getSubstitutions.mockImplementationOnce(async () => {
      throw new Error("provider=gemini HTTP 500");
    });
    const { rerender } = render(
      <SubstitutionAssistant
        key="42-50"
        recipeId={42}
        servings={50}
        ingredients={ingredients}
        scaledIngredients={scaledIngredients}
        onApply={vi.fn()}
      />
    );
    fireEvent.change(screen.getByLabelText("Missing ingredient"), {
      target: { value: "1" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Find substitution/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to find a substitute right now"
    );
    expect(screen.queryByText(/gemini|HTTP 500/i)).not.toBeInTheDocument();

    rerender(
      <SubstitutionAssistant
        key="42-10"
        recipeId={42}
        servings={10}
        ingredients={ingredients}
        scaledIngredients={scaledIngredients}
        onApply={vi.fn()}
      />
    );
    expect(screen.getByLabelText("Missing ingredient")).toHaveValue("");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
