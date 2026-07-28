"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { getThumbnailUrl } from "@/lib/cloudinary";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FileText, Image as ImageIcon, File as FileIcon, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Input, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocument, useUpdateDocument, useDeleteDocument } from "@/features/documents/hooks";
import { useCategories } from "@/features/categories/hooks";
import { formatBytes, formatDate } from "@/lib/format";

const schema = z.object({
  title: z.string().min(1, "Title is required").max(150),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  documentDate: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return ImageIcon;
  if (mimeType === "application/pdf") return FileText;
  return FileIcon;
}
interface FileRowProps {
  fileId: string;
  name: string;
  size: number;
  url: string;
  mimeType: string;
}
function FileRow(props: FileRowProps) {
  const [imgError, setImgError] = useState(false);
  const Icon = getFileIcon(props.mimeType);

  const thumbnailUrl = getThumbnailUrl(
    {
      secureUrl: props.url,
      mimeType: props.mimeType,
    },
    "detail",
  );

  const label = `Open ${props.name}`;

  return (
    <li className="overflow-hidden rounded-md border border-border-subtle bg-surface">
      <a
        href={props.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className="block"
      >
        {thumbnailUrl && !imgError ? (
          <div className="flex max-h-[420px] w-full items-center justify-center bg-surface-2">
            <img
              src={thumbnailUrl}
              alt=""
              className="max-h-[420px] w-full object-contain"
              onError={() => setImgError(true)}
            />
          </div>
        ) : (
          <div className="flex h-40 w-full items-center justify-center bg-surface-2">
            <Icon className="h-10 w-10 text-text-muted" />
          </div>
        )}
      </a>

      <div className="flex items-center gap-3 px-3 py-2">
        <span className="flex-1 truncate text-sm text-text-primary">
          {props.name}
        </span>

        <span className="shrink-0 text-xs text-text-muted">
          {formatBytes(props.size)}
        </span>

        <a
          href={props.url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded p-1 text-text-muted hover:bg-hover hover:text-text-primary focus-ring"
          aria-label={label}
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </li>
  );
}

export default function DocumentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: document, isLoading, isError } = useDocument(params.id);
  const { data: categories } = useCategories();
  const { mutate: updateDocument, isPending: isSaving } = useUpdateDocument();
  const { mutate: deleteDocument, isPending: isDeleting } = useDeleteDocument();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (document) {
      reset({
        title: document.title,
        description: document.description ?? "",
        categoryId: document.categoryId ?? "",
        documentDate: document.documentDate ? document.documentDate.split("T")[0] : "",
      });
    }
  }, [document, reset]);

  function onSubmit(values: FormValues) {
    if (!document) return;
    updateDocument({
      id: document.id,
      payload: {
        title: values.title,
        description: values.description || undefined,
        categoryId: values.categoryId || null,
        documentDate: values.documentDate || undefined,
      },
    });
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-5 p-4 md:p-6">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (isError || !document) {
    return (
      <div className="p-6">
        <p className="text-sm text-text-secondary">Document not found.</p>
        <Button variant="secondary" className="mt-4" onClick={() => router.push("/documents")}>
          Back to Documents
        </Button>
      </div>
    );
  }

  const updatedLabel =
    document.updatedAt !== document.createdAt ? " · Updated " + formatDate(document.updatedAt) : "";
  const uploadedLabel = "Uploaded " + formatDate(document.createdAt) + updatedLabel;
  const deleteDescription = "This document will be moved to trash. This can't be undone from here.";

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-6">
      <PageHeader title={document.title} description="View and edit document details." />

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-primary">Title</label>
          <Input {...register("title")} error={!!errors.title} />
          <FieldError message={errors.title?.message} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-primary">Description</label>
          <Input {...register("description")} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">Category</label>
            <select
              {...register("categoryId")}
              className="flex h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-text-primary focus-ring"
            >
              <option value="">Uncategorized</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">Document Date</label>
            <Input type="date" {...register("documentDate")} />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-primary">
            Files ({document.files.length})
          </label>
          <ul className="space-y-2">
            {document.files.map((file) => (
              <FileRow
                key={file.id}
                fileId={file.id}
                name={file.originalName}
                size={file.fileSize}
                url={file.secureUrl}
                mimeType={file.mimeType}
              />
            ))}
          </ul>
        </div>

        <p className="text-xs text-text-muted">{uploadedLabel}</p>

        <div className="flex items-center justify-between border-t border-border-subtle pt-4">
          <Button type="button" variant="danger" onClick={() => setConfirmOpen(true)}>
            Delete
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={() => router.push("/documents")}>
              Back
            </Button>
            <Button type="submit" isLoading={isSaving} disabled={!isDirty}>
              Save Changes
            </Button>
          </div>
        </div>
      </form>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete document?"
        description={deleteDescription}
        confirmLabel="Delete"
        isLoading={isDeleting}
        onConfirm={() =>
          deleteDocument(document.id, {
            onSuccess: () => router.push("/documents"),
          })
        }
      />
    </div>
  );
}