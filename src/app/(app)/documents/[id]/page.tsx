"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { DocumentCard } from "@/components/shared/DocumentCard";
import { CategoryFilterSidebar } from "@/components/shared/CategoryFilterSidebar";
import { Pagination } from "@/components/shared/Pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useDocuments } from "@/features/documents/hooks";
import { useCategories } from "@/features/categories/hooks";

export default function DocumentsPage() {
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [direction, setDirection] = useState<"next" | "prev">("next");

  const { data, isLoading, isFetching } = useDocuments({
    categoryId,
    cursor,
    direction,
    limit: 12,
    sort: "createdAt",
    order: "desc",
  });
  const { data: categories } = useCategories();

  const categoryNameById = new Map((categories ?? []).map((c) => [c.id, c.name]));

  function handleSelectCategory(id: string | undefined) {
    setCategoryId(id);
    setCursor(undefined);
    setDirection("next");
  }

  function handleNext() {
    if (!data?.pageInfo.nextCursor) return;
    setCursor(data.pageInfo.nextCursor);
    setDirection("next");
  }

  function handlePrev() {
    if (!data?.pageInfo.prevCursor) return;
    setCursor(data.pageInfo.prevCursor);
    setDirection("prev");
  }

  return (
    <div className="p-4 md:p-6">
      <PageHeader
        title="Documents"
        description="Everything you've uploaded, in one place."
        actions={
          <Button asChild>
            <Link href="/documents/new">
              <Plus className="h-4 w-4" /> Upload
            </Link>
          </Button>
        }
      />

      <div className="mt-6 flex flex-col gap-6 md:flex-row">
        <CategoryFilterSidebar selectedCategoryId={categoryId} onSelect={handleSelectCategory} />

        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : data && data.data.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {data.data.map((document) => (
                  <DocumentCard
                    key={document.id}
                    document={document}
                    categoryName={document.categoryId ? categoryNameById.get(document.categoryId) : undefined}
                  />
                ))}
              </div>
              <div className="mt-6">
                <Pagination pageInfo={data.pageInfo} onPrev={handlePrev} onNext={handleNext} isLoading={isFetching} />
              </div>
            </>
          ) : (
            <EmptyState
              icon={FileText}
              title={categoryId ? "No documents in this category" : "No documents yet"}
              description="Upload your first document to get started."
              action={
                <Button asChild>
                  <Link href="/documents/new">
                    <Plus className="h-4 w-4" /> Upload Document
                  </Link>
                </Button>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}