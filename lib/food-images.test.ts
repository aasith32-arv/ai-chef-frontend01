import { describe, expect, it } from "vitest";
import { foodImageFor } from "@/lib/food-images";

describe("foodImageFor", () => {
  it("uses curated biryani photography for regional varieties without stored images", () => {
    const chicken = foodImageFor("Hyderabadi Chicken Biryani", "Rice Dishes");
    const vegetable = foodImageFor("Vegetable Biryani", "Rice Dishes");

    expect(chicken).toContain("images.unsplash.com");
    expect(vegetable).toContain("images.unsplash.com");
    expect(chicken).not.toBe(foodImageFor("Plain Rice", "Rice Dishes"));
  });
});
