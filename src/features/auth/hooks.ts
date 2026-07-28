"use client";

import { useMutation } from "@tanstack/react-query";
import { useAuth } from "./AuthProvider";

export function useGoogleLogin() {
  const { loginWithGoogle } = useAuth();
  return useMutation({ mutationFn: (idToken: string) => loginWithGoogle(idToken) });
}

export function useLogout() {
  const { logout } = useAuth();
  return useMutation({ mutationFn: () => logout() });
}