import { apiClient, unwrap } from "@/lib/api-client";
import type { AuthPayload, User } from "@/types/api";

export type RegisterPayload = {
  username: string;
  email: string;
  password: string;
  full_name?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type UpdateProfilePayload = {
  username?: string;
  email?: string;
  full_name?: string;
  password?: string;
};

export async function register(payload: RegisterPayload) {
  return unwrap<AuthPayload>(apiClient.post("/register", payload));
}

export async function login(payload: LoginPayload) {
  return unwrap<AuthPayload>(apiClient.post("/login", payload));
}

export async function logout() {
  await apiClient.post("/logout");
}

export async function refreshSession() {
  await apiClient.post("/refresh");
}

export async function getProfile() {
  return unwrap<{ user: User }>(apiClient.get("/profile"));
}

export async function updateProfile(payload: UpdateProfilePayload) {
  return unwrap<{ user: User }>(apiClient.put("/profile", payload));
}
