import { apiClient, setAccessToken } from "@/lib/api-client";
import type { SuccessResponse } from "@/types/api-response";
import type { GoogleAuthResult } from "./types";

export const authApi = {
  // Called on app mount, AND right after the OAuth redirect lands the user
  // back on the frontend — by that point the backend has already set the
  // refreshToken/uid cookies, so this silently picks up the new session.
  refresh: async () => {
    const res = await apiClient.post<SuccessResponse<GoogleAuthResult>>(
      "/auth/refresh",
      undefined,
      { skipAuth: true },
    );
    setAccessToken(res.data.accessToken);
    return res.data;
  },

  logout: async () => {
    await apiClient.post("/auth/logout", undefined, { skipAuth: true });
    setAccessToken(null);
  },
};