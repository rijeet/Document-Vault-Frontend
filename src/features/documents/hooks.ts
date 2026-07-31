"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { documentsApi } from "./api";
import type { DocumentsQuery, CreateDocumentMetadata } from "./types";
import type { UpdateDocumentPayload } from "./types";
import { uploadFileToCloudinaryDirect, runWithConcurrency, type UploadedFileMeta } from "@/lib/cloudinary-upload";
import { ApiError } from "@/lib/api-client";
import { toast } from "@/components/shared/Toaster";

const UPLOAD_CONCURRENCY = 3;

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

interface UploadProgress {
  fileName: string;
  percent: number;
}

/** Uploads files directly to Cloudinary (concurrency-capped), then attaches
 * the resulting metadata to a document in one small JSON call. Shared by
 * both "create new document with files" and "add files to existing doc". */
function useDirectFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [fileProgress, setFileProgress] = useState<Record<string, number>>({});

  const uploadFiles = useCallback(async (files: File[]): Promise<UploadedFileMeta[]> => {
    if (files.length === 0) return [];

    setIsUploading(true);
    setFileProgress(Object.fromEntries(files.map((f) => [f.name, 0])));

    try {
      const signature = await documentsApi.getUploadSignature();

      const { results, errors } = await runWithConcurrency(files, UPLOAD_CONCURRENCY, (file) =>
        uploadFileToCloudinaryDirect(file, signature, (percent) => {
          setFileProgress((prev) => ({ ...prev, [file.name]: percent }));
        }),
      );

      if (errors.length > 0) {
        toast.error(
          `${errors.length} file(s) failed to upload`,
          errors.map((e) => e.error.message).join(" · "),
        );
      }

      return results;
    } catch (err) {
      toast.error(
        "Couldn't start upload",
        err instanceof ApiError ? err.message : "Failed to get an upload authorization from the server.",
      );
      return [];
    } finally {
      setIsUploading(false);
    }
  }, []);

  return { uploadFiles, isUploading, fileProgress };
}

export function useCreateDocumentWithFiles() {
  const queryClient = useQueryClient();
  const { uploadFiles, isUploading, fileProgress } = useDirectFileUpload();
  const [isCreating, setIsCreating] = useState(false);

  const mutateAsync = useCallback(
    async (payload: CreateDocumentMetadata & { files: File[] }) => {
      const { files, ...metadata } = payload;
      setIsCreating(true);

      try {
        const document = await documentsApi.createDocument(metadata);
        const uploaded = await uploadFiles(files);

        if (uploaded.length > 0) {
          await documentsApi.attachFiles(document.id, uploaded);
        }

        queryClient.invalidateQueries({ queryKey: ["documents"] });

        if (uploaded.length === files.length) {
          toast.success("Document uploaded");
        } else if (uploaded.length > 0) {
          toast.success(`Document created with ${uploaded.length} of ${files.length} files`);
        } else if (files.length > 0) {
          toast.error("Document created, but no files uploaded successfully");
        } else {
          toast.success("Document created");
        }

        return document;
      } catch (err) {
        toast.error("Failed to create document", err instanceof ApiError ? err.message : undefined);
        throw err;
      } finally {
        setIsCreating(false);
      }
    },
    [uploadFiles, queryClient],
  );

  return { mutateAsync, isPending: isCreating || isUploading, fileProgress };
}

export function useAddFilesToDocument(documentId: string) {
  const queryClient = useQueryClient();
  const { uploadFiles, isUploading, fileProgress } = useDirectFileUpload();
  const [isAttaching, setIsAttaching] = useState(false);

  const mutateAsync = useCallback(
    async (files: File[]) => {
      setIsAttaching(true);
      try {
        const uploaded = await uploadFiles(files);
        if (uploaded.length > 0) {
          await documentsApi.attachFiles(documentId, uploaded);
        }

        queryClient.invalidateQueries({ queryKey: ["documents"] });
        queryClient.invalidateQueries({ queryKey: ["documents", documentId] });

        if (uploaded.length === files.length) {
          toast.success("Files added");
        } else if (uploaded.length > 0) {
          toast.success(`Added ${uploaded.length} of ${files.length} files`);
        } else {
          toast.error("No files were added");
        }
      } finally {
        setIsAttaching(false);
      }
    },
    [documentId, uploadFiles, queryClient],
  );

  return { mutateAsync, isPending: isAttaching || isUploading, fileProgress };
}