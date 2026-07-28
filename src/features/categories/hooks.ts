"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesApi } from "./api";
import type { CreateCategoryPayload, RenameCategoryPayload } from "./types";
import { ApiError } from "@/lib/api-client";
import { toast } from "@/components/shared/Toaster";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.getCategories,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) => categoriesApi.createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category created");
    },
    onError: (err) => {
      // 409 conflict (duplicate name) surfaces here with the backend's exact message
      toast.error("Failed to create category", err instanceof ApiError ? err.message : undefined);
    },
  });
}

export function useRenameCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RenameCategoryPayload }) =>
      categoriesApi.renameCategory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category renamed");
    },
    onError: (err) => {
      toast.error("Failed to rename category", err instanceof ApiError ? err.message : undefined);
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoriesApi.deleteCategory(id),
    onSuccess: () => {
      // Documents' categoryId may have changed to null server-side — invalidate
      // both caches so any document list showing this category refreshes too.
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Category deleted. Documents moved to Uncategorized.");
    },
    onError: (err) => {
      toast.error("Failed to delete category", err instanceof ApiError ? err.message : undefined);
    },
  });
}