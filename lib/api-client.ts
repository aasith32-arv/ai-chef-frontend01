import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { ApiError, ApiSuccess } from "@/types/api";

function normalizeApiBaseUrl(value?: string): string {
  const raw = (value || "http://localhost:5000").trim();
  if (!raw) return "http://localhost:5000/api/v1";

  const withoutTrailingSlash = raw.replace(/\/$/, "");
  if (/\/api\/v1$/i.test(withoutTrailingSlash)) {
    return withoutTrailingSlash;
  }
  if (/\/api$/i.test(withoutTrailingSlash)) {
    return `${withoutTrailingSlash}/v1`;
  }
  return `${withoutTrailingSlash}/api/v1`;
}

export function resolveApiBaseUrl(value?: string): string {
  return normalizeApiBaseUrl(value);
}

export function resolveRuntimeApiBaseUrl(
  environment = process.env.NODE_ENV,
  configured = process.env.NEXT_PUBLIC_API_URL
): string {
  // Production requests stay on the Vercel origin. next.config.ts proxies this
  // private path to Railway so JWT and CSRF cookies remain first-party.
  return environment === "production"
    ? "/api/backend/v1"
    : resolveApiBaseUrl(configured);
}

export const API_BASE_URL = resolveRuntimeApiBaseUrl();

const LEGACY_TOKEN_KEY = "ai-chef-token";
const LEGACY_USER_KEY = "ai-chef-user";

/** Clear pre-migration localStorage auth artifacts once. */
export function clearLegacyAuthStorage() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.removeItem(LEGACY_USER_KEY);
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function csrfHeaderForUrl(url?: string): string | null {
  const path = url || "";
  // Refresh endpoint must use the refresh CSRF cookie.
  if (path.includes("/refresh")) {
    return readCookie("csrf_refresh_token");
  }
  return readCookie("csrf_access_token") || readCookie("csrf_refresh_token");
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const method = (config.method || "get").toLowerCase();
  if (["post", "put", "patch", "delete"].includes(method)) {
    const csrf = csrfHeaderForUrl(config.url);
    if (csrf) {
      config.headers.set("X-CSRF-TOKEN", csrf);
    }
  }
  return config;
});

let refreshPromise: Promise<boolean> | null = null;

async function tryRefreshAccessToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = apiClient
      .post("/refresh")
      .then(() => true)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (!original || status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    const url = original.url || "";
    if (
      url.includes("/login") ||
      url.includes("/register") ||
      url.includes("/refresh")
    ) {
      return Promise.reject(error);
    }

    original._retry = true;
    const refreshed = await tryRefreshAccessToken();
    if (!refreshed) {
      return Promise.reject(error);
    }
    return apiClient(original);
  }
);

export function getErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(error)) {
    const ax = error as AxiosError<ApiError>;
    const data = ax.response?.data;
    if (data?.message) return data.message;
    if (ax.message) return ax.message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

export async function unwrap<T>(promise: Promise<{ data: ApiSuccess<T> }>): Promise<T> {
  const { data } = await promise;
  return data.data;
}
