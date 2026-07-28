"use client";

import { cn } from "@/lib/cn";
import { useCategories } from "@/features/categories/hooks";
import { Skeleton } from "@/components/ui/skeleton";

export function CategoryFilterSidebar({
  selectedCategoryId,
  onSelect,
}: {
  selectedCategoryId: string | undefined;
  onSelect: (categoryId: string | undefined) => void;
}) {
  const { data: categories, isLoading } = useCategories();

  if (isLoading) {
    return (
      <div className="flex gap-2 md:w-48 md:shrink-0 md:flex-col">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 shrink-0 md:w-full" />
        ))}
      </div>
    );
  }

  return (
    <nav className="flex gap-2 overflow-x-auto pb-2 md:w-48 md:shrink-0 md:flex-col md:overflow-visible md:pb-0">
      <FilterItem label="All Documents" active={!selectedCategoryId} onClick={() => onSelect(undefined)} />
      {categories?.map((category) => (
        <FilterItem
          key={category.id}
          label={category.name}
          active={selectedCategoryId === category.id}
          onClick={() => onSelect(category.id)}
        />
      ))}
    </nav>
  );
}

function FilterItem({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 whitespace-nowrap rounded-md px-3 py-2 text-left text-sm font-medium transition-colors focus-ring md:w-full",
        active ? "bg-accent-muted text-accent" : "text-text-secondary hover:bg-hover hover:text-text-primary",
      )}
    >
      {label}
    </button>
  );
}