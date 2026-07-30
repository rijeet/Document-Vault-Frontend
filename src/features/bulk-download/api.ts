import { getAccessToken } from "@/lib/api-client";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

export class BulkDownloadError extends Error {}

export interface BulkDownloadResult {
  blob: Blob;
  filename: string;
  skippedFiles: string[];
}

export const bulkDownloadApi = {
  download: async (documentIds: string[]): Promise<BulkDownloadResult> => {
    const token = getAccessToken();

    const res = await fetch(`${BASE_URL}/documents/bulk-download`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ documentIds }),
    });

    if (!res.ok) {
      let message = "Failed to download documents";
      try {
        const json = await res.json();
        message = json.message ?? message;
      } catch {
        // response wasn't JSON — keep the default message
      }
      throw new BulkDownloadError(message);
    }

    const blob = await res.blob();

    const disposition = res.headers.get("Content-Disposition") ?? "";
    const match = disposition.match(/filename="?([^"]+)"?/);
    const filename = match?.[1] ?? `Documents_${new Date().toISOString().split("T")[0]}.zip`;

    const skippedHeader = res.headers.get("X-Skipped-Files") ?? "";
    const skippedFiles = skippedHeader
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);

    return { blob, filename, skippedFiles };
  },
};

export function triggerBrowserDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}