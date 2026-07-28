"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/shared/PageHeader";
import { UploadDropzone } from "@/components/shared/UploadDropzone";
import { Input, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateDocument } from "@/features/documents/hooks";
import { useCategories } from "@/features/categories/hooks";

const schema = z.object({
  title: z.string().min(1, "Title is required").max(150),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  documentDate: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function NewDocumentPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const { data: categories } = useCategories();
  const { mutateAsync, isPending } = useCreateDocument();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    await mutateAsync({
      title: values.title,
      description: values.description || undefined,
      categoryId: values.categoryId || undefined,
      documentDate: values.documentDate || undefined,
      files,
    });
    router.push("/documents");
  }

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-6">
      <PageHeader title="Upload Document" description="Add a new document to your vault." />

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-primary">Title</label>
          <Input placeholder="e.g. Passport" {...register("title")} error={!!errors.title} />
          <FieldError message={errors.title?.message} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-primary">Description</label>
          <Input placeholder="Optional notes about this document" {...register("description")} />
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
          <label className="mb-1.5 block text-sm font-medium text-text-primary">Files</label>
          <UploadDropzone files={files} onFilesChange={setFiles} />
        </div>

        <div className="flex justify-end gap-2 border-t border-border-subtle pt-4">
          <Button type="button" variant="secondary" onClick={() => router.push("/documents")}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isPending}>
            Upload
          </Button>
        </div>
      </form>
    </div>
  );
}