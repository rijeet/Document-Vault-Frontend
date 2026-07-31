import { apiClient } from "@/lib/api-client";
import type { PaginatedResponse, SuccessResponse } from "@/types/api-response";
import type { Document } from "@/types/entities";
import type { UploadSignature, UploadedFileMeta } from "@/lib/cloudinary-upload";
import type { DocumentsQuery, CreateDocumentMetadata, UpdateDocumentPayload } from "./types";

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

  createDocument: async (payload: CreateDocumentMetadata) => {
    const res = await apiClient.post<SuccessResponse<Document>>("/documents", payload);
    return res.data;
  },

  getUploadSignature: async () => {
    const res = await apiClient.get<SuccessResponse<UploadSignature>>("/documents/upload-signature");
    return res.data;
  },

  attachFiles: async (id: string, files: UploadedFileMeta[]) => {
    const res = await apiClient.post<SuccessResponse<Document>>(`/documents/${id}/attach-files`, { files });
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