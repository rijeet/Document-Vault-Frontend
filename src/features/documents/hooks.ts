"use client";

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { documentsApi } from "./api";
import type { DocumentsQuery, CreateDocumentPayload } from "./types";
import { ApiError } from "@/lib/api-client";
import { toast } from "@/components/shared/Toaster";

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