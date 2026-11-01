import { useState } from "react";

/** API hạ `size` lớn hơn 100 về 100 mà không báo lỗi, nên không cho chọn cao hơn. */
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const DEFAULT_PAGE_SIZE = 20;

export function usePagination() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(DEFAULT_PAGE_SIZE);

  const changeSize = (next: number) => {
    setSize(next);
    setPage(0);
  };

  return { page, size, setPage, setSize: changeSize };
}
