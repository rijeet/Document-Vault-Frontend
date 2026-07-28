"use client";

import { useMutation } from "@tanstack/react-query";
import { bulkDownloadApi, triggerBrowserDownload, BulkDownloadError } from "./api";
import { toast } from "@/components/shared/Toaster";

export function useBulkDownload() {
  return useMutation({
    mutationFn: (documentIds: string[]) => bulkDownloadApi.download(documentIds),
    onSuccess: ({ blob, filename, skippedFiles }) => {
      triggerBrowserDownload(blob, filename);
      if (skippedFiles.length > 0) {
        toast.info(
          "Some files were skipped",
          `${skippedFiles.length} file(s) couldn't be included: ${skippedFiles.join(", ")}`,
        );
      } else {
        toast.success("Download started");
      }
    },
    onError: (err) => {
      toast.error(
        "Bulk download failed",
        err instanceof BulkDownloadError ? err.message : undefined,
      );
    },
  });
}