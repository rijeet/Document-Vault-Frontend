"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "./api";
import type { UpdateUserPayload } from "./types";
import { ApiError } from "@/lib/api-client";
import { toast } from "@/components/shared/Toaster";
import { useAuth } from "@/features/auth/AuthProvider";

export function useMe() {
  return useQuery({
    queryKey: ["users", "me"],
    queryFn: usersApi.getMe,
  });
}

export function useUpdateMe() {
  const queryClient = useQueryClient();
  const { updateUser } = useAuth();

  return useMutation({
    mutationFn: (payload: UpdateUserPayload) => usersApi.updateMe(payload),
    onSuccess: (user) => {
      queryClient.setQueryData(["users", "me"], user);
      updateUser(user); // keeps the sidebar's name/avatar in sync immediately
      toast.success("Profile updated");
    },
    onError: (err) => {
      toast.error("Failed to update profile", err instanceof ApiError ? err.message : undefined);
    },
  });
}