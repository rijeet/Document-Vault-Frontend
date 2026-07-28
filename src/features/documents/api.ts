import { apiClient } from "@/lib/api-client";
import type { PaginatedResponse, SuccessResponse } from "@/types/api-response";
import type { Document } from "@/types/entities";
import type { DocumentsQuery, CreateDocumentPayload, UpdateDocumentPayload } from "./types";

function toQueryString(query: DocumentsQuery): string {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const documentsApi = {
  getDocuments: async (query: DocumentsQuery = {}) => {
    const res = await apiClient.get<PaginatedResponse<Document>>(`/documents${toQueryString(query)}`);
    return { data: res.data, pageInfo: res.pageInfo };
  },

  getDocumentById: async (id: string) => {
    const res = await apiClient.get<SuccessResponse<Document>>(`/documents/${id}`);
    return res.data;
  },

  createDocument: async (payload: CreateDocumentPayload) => {
    const formData = new FormData();
    formData.set("title", payload.title);
    if (payload.description) formData.set("description", payload.description);
    if (payload.categoryId) formData.set("categoryId", payload.categoryId);
    if (payload.documentDate) formData.set("documentDate", payload.documentDate);
    payload.files?.forEach((file) => formData.append("files", file));

    const res = await apiClient.post<SuccessResponse<Document>>("/documents", formData);
    return res.data;
  },

  updateDocument: async (id: string, payload: UpdateDocumentPayload) => {
    const res = await apiClient.patch<SuccessResponse<Document>>(`/documents/${id}`, payload);
    return res.data;
  },

  deleteDocument: async (id: string) => {
    await apiClient.delete(`/documents/${id}`);
  },
};