import type { Document } from "@/types/entities";

export type { Document };

export interface DocumentsQuery {
  cursor?: string;
  limit?: number;
  sort?: "createdAt" | "title";
  order?: "asc" | "desc";
  direction?: "next" | "prev";
  categoryId?: string;
}

export interface CreateDocumentPayload {
  title: string;
  description?: string;
  categoryId?: string;
  documentDate?: string;
  files?: File[];
}

export interface UpdateDocumentPayload {
  title?: string;
  description?: string;
  categoryId?: string | null;
  documentDate?: string;
}