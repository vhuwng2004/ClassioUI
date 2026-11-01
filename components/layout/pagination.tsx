import { ArrowLeftIcon, ChevronRightIcon } from "lucide-react";

import { SelectMenu } from "@/components/form/select-menu";
import { Button } from "@/components/ui/button";
import { PAGE_SIZE_OPTIONS } from "@/hooks/use-pagination";
import type { PageResponse } from "@/lib/api";

const MAX_PAGE_BUTTONS = 5;
const BUTTON_CLASS_NAME = "rounded-md text-[13px] leading-4.5 font-medium";
const SIZE_ITEMS = PAGE_SIZE_OPTIONS.map((option) => ({
  value: String(option),
  label: String(option),
}));

interface PaginationProps {
  data: PageResponse<unknown>;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function Pagination({
  data,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const { page, size, totalPages } = data;
  const firstButton = Math.max(
    Math.min(page - 2, totalPages - MAX_PAGE_BUTTONS),
    0,
  );
  const pageButtons = Array.from(
    { length: Math.min(Math.max(totalPages, 1), MAX_PAGE_BUTTONS) },
    (_, index) => firstButton + index,
  );

  return (
    <footer className="flex min-h-14.25 flex-wrap items-center justify-end gap-3 border-t px-5 py-2">
      <SelectMenu
        label="Số dòng mỗi trang"
        size="sm"
        options={SIZE_ITEMS}
        value={String(size)}
        onChange={(next) => onPageSizeChange(Number(next))}
      />
      <nav aria-label="Phân trang" className="flex gap-1">
        <Button
          variant="outline"
          size="icon"
          aria-label="Trang trước"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
          className={BUTTON_CLASS_NAME}
        >
          <ArrowLeftIcon className="size-3.5" />
        </Button>
        {pageButtons.map((pageButton) => (
          <Button
            key={pageButton}
            variant={pageButton === page ? "default" : "outline"}
            size="icon"
            aria-current={pageButton === page ? "page" : undefined}
            onClick={() => onPageChange(pageButton)}
            className={BUTTON_CLASS_NAME}
          >
            {pageButton + 1}
          </Button>
        ))}
        <Button
          variant="outline"
          size="icon"
          aria-label="Trang sau"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
          className={BUTTON_CLASS_NAME}
        >
          <ChevronRightIcon className="size-3.5" />
        </Button>
      </nav>
    </footer>
  );
}
