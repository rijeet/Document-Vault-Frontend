import { apiClient } from "@/lib/api-client";
import type { SuccessResponse } from "@/types/api-response";
import type { Category } from "@/types/entities";
import type { CreateCategoryPayload, RenameCategoryPayload } from "./types";

export const categoriesApi = {
  getCategories: async () => {
    const res = await apiClient.get<SuccessResponse<Category[]>>("/categories");
    return res.data;
  },

  createCategory: async (payload: CreateCategoryPayload) => {
    const res = await apiClient.post<SuccessResponse<Category>>("/categories", payload);
    return res.data;
  },

  renameCategory: async (id: string, payload: RenameCategoryPayload) => {
    const res = await apiClient.patch<SuccessResponse<Category>>(`/categories/${id}`, payload);
    return res.data;
  },

  deleteCategory: async (id: string) => {
    await apiClient.delete(`/categories/${id}`);
  },
};