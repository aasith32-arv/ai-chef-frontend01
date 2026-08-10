// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RecipeForm } from "@/components/admin/recipe-form";

describe("RecipeForm", () => {
  it("adds, reorders, and removes dynamic ingredients and curated cooking steps", () => {
    render(<RecipeForm families={[]} pending={false} onSubmit={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /add ingredient/i }));
    expect(screen.getByText("Ingredient 2")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /move ingredient up/i })).toHaveLength(2);

    fireEvent.click(screen.getByRole("button", { name: /add curated step/i }));
    expect(screen.getByText("Structured step 1")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Remove" }));
    expect(screen.queryByText("Structured step 1")).not.toBeInTheDocument();
  });

  it("validates required recipe fields before calling the API", async () => {
    const submit = vi.fn();
    render(<RecipeForm families={[]} pending={false} onSubmit={submit} />);

    fireEvent.click(screen.getByRole("button", { name: /create recipe/i }));

    await waitFor(() => expect(screen.getByText("Recipe name is required")).toBeInTheDocument());
    expect(screen.getByText("Category is required")).toBeInTheDocument();
    expect(submit).not.toHaveBeenCalled();
  });
});
