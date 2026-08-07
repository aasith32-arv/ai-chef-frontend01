import { describe, expect, it } from "vitest";
import { resolveApiBaseUrl } from "@/lib/api-client";

describe("resolveApiBaseUrl", () => {
  it("uses the default API base when no override is provided", () => {
    expect(resolveApiBaseUrl()).toBe("http://localhost:5000/api/v1");
  });

  it("appends the API version prefix for a bare host", () => {
    expect(resolveApiBaseUrl("http://127.0.0.1:5000")).toBe(
      "http://127.0.0.1:5000/api/v1"
    );
  });

  it("preserves an existing api/v1 base URL", () => {
    expect(resolveApiBaseUrl("http://localhost:5000/api/v1")).toBe(
      "http://localhost:5000/api/v1"
    );
  });

  it("supports a base URL that already ends in /api", () => {
    expect(resolveApiBaseUrl("http://localhost:5000/api")).toBe(
      "http://localhost:5000/api/v1"
    );
  });
});
