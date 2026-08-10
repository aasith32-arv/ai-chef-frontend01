// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminRoute } from "@/components/admin/admin-route";

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  auth: { user: null as null | { role: "user" | "admin" }, loading: false },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace }),
}));
vi.mock("@/providers/auth-provider", () => ({ useAuth: () => mocks.auth }));

describe("AdminRoute", () => {
  beforeEach(() => {
    mocks.replace.mockReset();
    mocks.auth = { user: null, loading: false };
  });

  it("redirects signed-out visitors to login", async () => {
    render(<AdminRoute><p>Private dashboard</p></AdminRoute>);
    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/auth/login"));
    expect(screen.queryByText("Private dashboard")).not.toBeInTheDocument();
  });

  it("shows a permission message to a normal authenticated user", () => {
    mocks.auth = { user: { role: "user" }, loading: false };
    render(<AdminRoute><p>Private dashboard</p></AdminRoute>);
    expect(screen.getByRole("heading", { name: /administrator access required/i })).toBeInTheDocument();
    expect(screen.queryByText("Private dashboard")).not.toBeInTheDocument();
  });

  it("renders the dashboard for an administrator", () => {
    mocks.auth = { user: { role: "admin" }, loading: false };
    render(<AdminRoute><p>Private dashboard</p></AdminRoute>);
    expect(screen.getByText("Private dashboard")).toBeInTheDocument();
  });
});
