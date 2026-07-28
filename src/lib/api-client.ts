import type { ApiEnvelope, PaginatedEnvelope, ErrorResponse } from "@/types/api-response";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

// ── In-memory access token (see auth flow decision, guidelines §9) ──
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

// ── Custom error so callers can distinguish API errors from network errors ──
export class ApiError extends Error {
  status: number;
  errors: ErrorResponse["errors"];

  constructor(status: number, message: string, errors: ErrorResponse["errors"] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

// ── Refresh coordination: only one refresh call in flight at a time ──
let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(`${BASE_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include", // sends the httpOnly refreshToken cookie
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) return false;

        const json = (await res.json()) as ApiEnvelope<{ accessToken: string }>;
        if (!json.success) return false;

        setAccessToken(json.data.accessToken);
        return true;
      } catch {
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown; // plain object — we handle JSON.stringify, or FormData as-is
  skipAuth?: boolean; // for /auth/google, /auth/refresh — no Authorization header needed
  _isRetry?: boolean; // internal: prevents infinite refresh loops
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, skipAuth, _isRetry, headers, ...rest } = options;

  const isFormData = body instanceof FormData;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    credentials: "include",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(skipAuth || !accessToken ? {} : { Authorization: `Bearer ${accessToken}` }),
      ...headers,
    },
    body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
  });

  // Silent refresh-and-retry, once
  if (res.status === 401 && !skipAuth && !_isRetry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return request<T>(path, { ...options, _isRetry: true });
    }
    setAccessToken(null);
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new ApiError(401, "Session expired");
  }

  const json = (await res.json()) as ApiEnvelope<T> | PaginatedEnvelope<any>;

  if (!json.success) {
    throw new ApiError(res.status, json.message, json.errors);
  }

  // Paginated responses need pageInfo alongside data — return the whole
  // success envelope minus the `success` flag; documents.api.ts (Part 6)
  // will type this explicitly per-call.
  return json as unknown as T;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: "DELETE" }),
};