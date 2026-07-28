"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, Image as ImageIcon, File as FileIcon, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useDeleteDocument } from "@/features/documents/hooks";
import { formatBytes, formatDate } from "@/lib/format";
import { getThumbnailUrl } from "@/lib/cloudinary";
import { cn } from "@/lib/cn";
import type { Document } from "@/types/entities";

function getFileIcon(mimeType?: string) {
  if (!mimeType) return FileIcon;
  if (mimeType.startsWith("image/")) return ImageIcon;
  if (mimeType === "application/pdf") return FileText;
  return FileIcon;
}

function CoverThumbnail({ primaryFile }: { primaryFile: Document["files"][number] | undefined }) {
  const [imgError, setImgError] = useState(false);
  const Icon = getFileIcon(primaryFile?.mimeType);
  const thumbnailUrl = primaryFile ? getThumbnailUrl(primaryFile, "card") : null;

  if (!thumbnailUrl || imgError) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center bg-surface-2">
        <Icon className="h-10 w-10 text-text-muted" />
      </div>
    );
  }

  return (
    <div className="aspect-[4/3] w-full overflow-hidden bg-surface-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={thumbnailUrl}
        alt=""
        className="h-full w-full object-cover"
        onError={() => setImgError(true)}
      />
    </div>
  );
}

export function DocumentCard({
  document,
  categoryName,
  selectable = false,
  selected = false,
  onToggleSelect,
}: {
  document: Document;
  categoryName?: string;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { mutate: deleteDocument, isPending } = useDeleteDocument();

  const primaryFile = document.files[0];
  const totalSize = document.files.reduce((sum, f) => sum + f.fileSize, 0);

  return (
    <>
      <div
        className={cn(
          "group relative flex flex-col overflow-hidden rounded-lg border bg-surface transition-colors",
          selected ? "border-accent" : "border-border-subtle hover:border-border",
        )}
      >
        <div className="relative">
          {selectable ? (
            <button
              onClick={() => onToggleSelect?.(document.id)}
              className="block w-full text-left focus-ring"
            >
              <CoverThumbnail primaryFile={primaryFile} />
              <span
                className={cn(
                  "absolute left-3 top-3 flex h-5 w-5 items-center justify-center rounded border bg-surface",
                  selected ? "border-accent bg-accent" : "border-border",
                )}
              >
                {selected && <span className="h-2 w-2 rounded-sm bg-white" />}
              </span>
            </button>
          ) : (
            <Link href={`/documents/${document.id}`} className="block focus-ring">
              <CoverThumbnail primaryFile={primaryFile} />
            </Link>
          )}

          {!selectable && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Document actions"
                  className="absolute right-2 top-2 rounded-md bg-surface/90 p-1.5 text-text-muted opacity-100 backdrop-blur transition-opacity hover:bg-hover hover:text-text-primary focus-ring md:opacity-0 md:group-hover:opacity-100 data-[state=open]:opacity-100"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/documents/${document.id}`} className="flex items-center gap-2">
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem danger onClick={() => setConfirmOpen(true)} className="flex items-center gap-2">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4">
          {selectable ? (
            <button onClick={() => onToggleSelect?.(document.id)} className="text-left focus-ring">
              <h3 className="truncate text-sm font-medium text-text-primary">{document.title}</h3>
              {document.description && (
                <p className="mt-0.5 line-clamp-1 text-xs text-text-secondary">{document.description}</p>
              )}
            </button>
          ) : (
            <Link href={`/documents/${document.id}`} className="focus-ring">
              <h3 className="truncate text-sm font-medium text-text-primary">{document.title}</h3>
              {document.description && (
                <p className="mt-0.5 line-clamp-1 text-xs text-text-secondary">{document.description}</p>
              )}
            </Link>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {categoryName ? <Badge variant="accent">{categoryName}</Badge> : <Badge>Uncategorized</Badge>}
            <span className="text-xs text-text-muted">
              {document.files.length} file{document.files.length !== 1 ? "s" : ""} · {formatBytes(totalSize)}
            </span>
          </div>

          <p className="mt-2 text-xs text-text-muted">
            {formatDate(document.documentDate ?? document.createdAt)}
          </p>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete document?"
        description={`"${document.title}" will be moved to trash. This can't be undone from here.`}
        confirmLabel="Delete"
        isLoading={isPending}
        onConfirm={() => deleteDocument(document.id, { onSuccess: () => setConfirmOpen(false) })}
      />
    </>
  );
}