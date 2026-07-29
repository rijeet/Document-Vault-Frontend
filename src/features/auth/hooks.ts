"use client";

import { useMutation } from "@tanstack/react-query";
import { useAuth } from "./AuthProvider";

export function useLogout() {
  const { logout } = useAuth();
  return useMutation({ mutationFn: () => logout() });
}