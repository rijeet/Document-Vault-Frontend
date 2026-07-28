"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PageInfo } from "@/types/api-response";

export function Pagination({
  pageInfo,
  onPrev,
  onNext,
  isLoading,
}: {
  pageInfo: PageInfo | undefined;
  onPrev: () => void;
  onNext: () => void;
  isLoading?: boolean;
}) {
  if (!pageInfo) return null;

  return (
    <div className="flex items-center justify-between border-t border-border-subtle pt-4">
      <Button variant="secondary" size="sm" onClick={onPrev} disabled={!pageInfo.hasPrev || isLoading}>
        <ChevronLeft className="h-4 w-4" /> Previous
      </Button>
      <Button variant="secondary" size="sm" onClick={onNext} disabled={!pageInfo.hasNext || isLoading}>
        Next <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}