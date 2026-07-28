import { apiClient } from "@/lib/api-client";
import type { SuccessResponse } from "@/types/api-response";
import type { User } from "@/types/entities";
import type { UpdateUserPayload } from "./types";

export const usersApi = {
  getMe: async () => {
    const res = await apiClient.get<SuccessResponse<User>>("/users/me");
    return res.data;
  },

  updateMe: async (payload: UpdateUserPayload) => {
    const res = await apiClient.patch<SuccessResponse<User>>("/users/me", payload);
    return res.data;
  },
};