// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { addShoppingItems, clearShoppingList } from "@/lib/shopping-list";
import ShoppingListPage from "./page";

const mocks = vi.hoisted(() => ({ downloadPdf: vi.fn() }));

vi.mock("@/lib/shopping-list-pdf", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/shopping-list-pdf")>();
  return { ...original, downloadShoppingListPdf: mocks.downloadPdf };
});

describe("Shopping list page", () => {
  beforeEach(() => {
    localStorage.clear();
    clearShoppingList();
    mocks.downloadPdf.mockReset().mockResolvedValue(undefined);
  });

  it("adds, picks, and deletes an extra bill item", async () => {
    render(<ShoppingListPage />);

    fireEvent.change(screen.getByLabelText("Item name"), { target: { value: "Dish soap" } });
    fireEvent.change(screen.getByLabelText("Quantity"), { target: { value: "2 bottles" } });
    fireEvent.click(screen.getByRole("button", { name: "Add to bill" }));

    expect(await screen.findByText("Dish soap")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Extra items" })).toBeInTheDocument();
    expect(screen.getByText("2 bottles")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Mark Dish soap as picked" }));
    expect(screen.getByRole("button", { name: "Mark Dish soap as needed" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Delete Dish soap" }));
    expect(screen.queryByText("Dish soap")).not.toBeInTheDocument();
  });

  it("keeps ingredients added from a recipe and can clear picked items", async () => {
    addShoppingItems([{ name: "Basmati rice", quantity: "500 g", dish: "Biryani" }]);
    render(<ShoppingListPage />);

    expect(await screen.findByText("Basmati rice")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Recipe: Biryani" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Mark Basmati rice as picked" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete picked items" }));
    expect(screen.queryByText("Basmati rice")).not.toBeInTheDocument();
  });

  it("downloads the current grouped shopping bill as a PDF", async () => {
    addShoppingItems([{ name: "Basmati rice", quantity: "500 g", dish: "Biryani" }]);
    render(<ShoppingListPage />);

    fireEvent.click(await screen.findByRole("button", { name: "Download shopping PDF" }));
    await waitFor(() => {
      expect(mocks.downloadPdf).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ name: "Basmati rice", dish: "Biryani" })])
      );
      expect(screen.getByRole("button", { name: "Download shopping PDF" })).toBeEnabled();
    });
  });
});
