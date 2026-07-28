import { apiClient, setAccessToken } from "@/lib/api-client";
import type { SuccessResponse } from "@/types/api-response";
import type { GoogleAuthResult } from "./types";

export const authApi = {
  loginWithGoogle: async (idToken: string) => {
    const res = await apiClient.post<SuccessResponse<GoogleAuthResult>>(
      "/auth/google",
      { idToken },
      { skipAuth: true },
    );
    setAccessToken(res.data.accessToken);
    return res.data;
  },

  // Called on app mount to silently re-establish a session from the
  // httpOnly refreshToken cookie (access token is in-memory only, lost on reload)
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