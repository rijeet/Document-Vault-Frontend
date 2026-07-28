"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FolderOpen, Plus, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Input, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useCategories,
  useCreateCategory,
  useRenameCategory,
  useDeleteCategory,
} from "@/features/categories/hooks";
import type { Category } from "@/types/entities";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(100),
});
type FormValues = z.infer<typeof schema>;

export default function CategoriesPage() {
  const { data: categories, isLoading } = useCategories();
  const { mutate: createCategory, isPending: isCreating } = useCreateCategory();
  const { mutate: renameCategory, isPending: isRenaming } = useRenameCategory();
  const { mutate: deleteCategory, isPending: isDeleting } = useDeleteCategory();

  const [createOpen, setCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  const createForm = useForm<FormValues>({ resolver: zodResolver(schema) });
  const renameForm = useForm<FormValues>({ resolver: zodResolver(schema) });

  function handleCreate(values: FormValues) {
    createCategory(values, {
      onSuccess: () => {
        createForm.reset();
        setCreateOpen(false);
      },
    });
  }

  function openEdit(category: Category) {
    setEditingCategory(category);
    renameForm.reset({ name: category.name });
  }

  function handleRename(values: FormValues) {
    if (!editingCategory) return;
    renameCategory(
      { id: editingCategory.id, payload: values },
      { onSuccess: () => setEditingCategory(null) },
    );
  }

  function handleDelete() {
    if (!deletingCategory) return;
    deleteCategory(deletingCategory.id, {
      onSuccess: () => setDeletingCategory(null),
    });
  }

  return (
    <div className="p-4 md:p-6">
      <PageHeader
        title="Categories"
        description="Organize your documents into categories."
        actions={
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" /> New Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Category</DialogTitle>
              </DialogHeader>
              <form onSubmit={createForm.handleSubmit(handleCreate)}>
                <label className="mb-1.5 block text-sm font-medium text-text-primary">Name</label>
                <Input
                  placeholder="e.g. Medical"
                  {...createForm.register("name")}
                  error={!!createForm.formState.errors.name}
                />
                <FieldError message={createForm.formState.errors.name?.message} />
                <DialogFooter>
                  <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" isLoading={isCreating}>
                    Create
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mt-6">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : categories && categories.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="group flex items-center justify-between rounded-lg border border-border-subtle bg-surface px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-surface-2">
                    <FolderOpen className="h-4 w-4 text-text-secondary" />
                  </div>
                  <span className="text-sm font-medium text-text-primary">{category.name}</span>
                </div>
                <div className="flex gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                  <button
                    onClick={() => openEdit(category)}
                    className="rounded-md p-1.5 text-text-muted hover:bg-hover hover:text-text-primary focus-ring"
                    aria-label={`Rename ${category.name}`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingCategory(category)}
                    className="rounded-md p-1.5 text-text-muted hover:bg-hover hover:text-danger focus-ring"
                    aria-label={`Delete ${category.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FolderOpen}
            title="No categories yet"
            description="Create categories to organize your documents — like Medical, Passport, or Bills."
            action={
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4" /> New Category
              </Button>
            }
          />
        )}
      </div>

      {/* Rename dialog */}
      <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={renameForm.handleSubmit(handleRename)}>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">Name</label>
            <Input {...renameForm.register("name")} error={!!renameForm.formState.errors.name} />
            <FieldError message={renameForm.formState.errors.name?.message} />
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setEditingCategory(null)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isRenaming}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deletingCategory}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
        title="Delete category?"
        description={`Documents in "${deletingCategory?.name}" will become Uncategorized. This can't be undone.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}