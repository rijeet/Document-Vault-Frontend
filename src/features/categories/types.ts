import type { Category } from "@/types/entities";

export type { Category };

export interface CreateCategoryPayload {
  name: string;
}

export interface RenameCategoryPayload {
  name: string;
}