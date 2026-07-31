"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, X, FileText, Image as ImageIcon, File as FileIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatBytes } from "@/lib/format";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "application/pdf"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return ImageIcon;
  if (mimeType === "application/pdf") return FileText;
  return FileIcon;
}

export function UploadDropzone({
  files,
  onFilesChange,
}: {
  files: File[];
  onFilesChange: (files: File[]) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const validFiles: File[] = [];
      let rejectionReason: string | null = null;

      Array.from(incoming).forEach((file) => {
        if (!ALLOWED_TYPES.includes(file.type)) {
          rejectionReason = `"${file.name}" isn't a supported file type (PNG, JPG, WEBP, PDF only).`;
          return;
        }
        if (file.size > MAX_SIZE_BYTES) {
          rejectionReason = `"${file.name}" exceeds the 20MB size limit.`;
          return;
        }
        validFiles.push(file);
      });

      setError(rejectionReason);
      if (validFiles.length > 0) {
        onFilesChange([...files, ...validFiles]);
      }
    },
    [files, onFilesChange],
  );

  function removeFile(index: number) {
    onFilesChange(files.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors",
          isDragging ? "border-accent bg-accent-muted" : "border-border-subtle hover:border-border",
        )}
      >
        <Upload className="h-8 w-8 text-text-muted" />
        <p className="mt-3 text-sm font-medium text-text-primary">
          Drag files here, or click to browse
        </p>
        <p className="mt-1 text-xs text-text-muted">PNG, JPG, WEBP, or PDF — up to 20MB each</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ALLOWED_TYPES.join(",")}
          className="hidden"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = ""; // allow re-selecting the same file after removal
          }}
        />
      </div>

      {error && <p className="mt-2 text-xs text-danger">{error}</p>}

      {files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {files.map((file, index) => {
            const Icon = getFileIcon(file.type);
            return (
              <li
                key={`${file.name}-${index}`}
                className="flex items-center gap-3 rounded-md border border-border-subtle bg-surface px-3 py-2"
              >
                <Icon className="h-4 w-4 shrink-0 text-text-secondary" />
                <span className="flex-1 truncate text-sm text-text-primary">{file.name}</span>
                <span className="shrink-0 text-xs text-text-muted">{formatBytes(file.size)}</span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="shrink-0 rounded p-1 text-text-muted hover:bg-hover hover:text-danger focus-ring"
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}