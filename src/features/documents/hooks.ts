"use client";

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { documentsApi } from "./api";
import type { DocumentsQuery, CreateDocumentPayload } from "./types";
import { ApiError } from "@/lib/api-client";
import { toast } from "@/components/shared/Toaster";
import type { UpdateDocumentPayload } from "./types";

export function useUpdateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateDocumentPayload }) =>
      documentsApi.updateDocument(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["documents", id] });
      toast.success("Document updated");
    },
    onError: (err) => {
      toast.error("Failed to update document", err instanceof ApiError ? err.message : undefined);
    },
  });
}
export function useDocuments(query: DocumentsQuery) {
  return useQuery({
    queryKey: ["documents", query],
    queryFn: () => documentsApi.getDocuments(query),
    placeholderData: keepPreviousData,
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: ["documents", id],
    queryFn: () => documentsApi.getDocumentById(id),
    enabled: !!id,
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDocumentPayload) => documentsApi.createDocument(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Document uploaded");
    },
    onError: (err) => {
      toast.error("Failed to upload document", err instanceof ApiError ? err.message : undefined);
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => documentsApi.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Document deleted");
    },
    onError: (err) => {
      toast.error("Failed to delete document", err instanceof ApiError ? err.message : undefined);
    },
  });
}