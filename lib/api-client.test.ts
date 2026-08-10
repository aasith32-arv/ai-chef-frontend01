import axios from "axios";
import { describe, expect, it } from "vitest";
import {
  getErrorMessage,
  resolveApiBaseUrl,
  resolveRuntimeApiBaseUrl,
} from "@/lib/api-client";

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

  it("uses the same-origin Vercel proxy in production", () => {
    expect(
      resolveRuntimeApiBaseUrl(
        "production",
        "https://example-api.up.railway.app/api/v1"
      )
    ).toBe("/api/backend/v1");
  });

  it("uses the configured API directly during local development", () => {
    expect(
      resolveRuntimeApiBaseUrl("development", "http://localhost:5000/api/v1")
    ).toBe("http://localhost:5000/api/v1");
  });

  it("shows a useful sign-in message when a proxy returns a bare server error", () => {
    const error = new axios.AxiosError(
      "Request failed with status code 500",
      "ERR_BAD_RESPONSE",
      { url: "/login", headers: new axios.AxiosHeaders() },
      undefined,
      {
        status: 500,
        statusText: "Internal Server Error",
        headers: {},
        config: { url: "/login", headers: new axios.AxiosHeaders() },
        data: "Internal Server Error",
      }
    );

    expect(getErrorMessage(error)).toContain("backend migration is current");
  });
});
