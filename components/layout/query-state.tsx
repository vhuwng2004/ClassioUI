"use client";

import { useEffect, type ReactNode } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/api";

interface QueryStateProps {
  query: {
    isPending: boolean;
    isError: boolean;
    error: unknown;
    refetch: () => unknown;
  };
  isEmpty: boolean;
  emptyMessage: string;
}

function Message({ children }: { children: ReactNode }) {
  return (
    <div className="px-5 py-10 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

/** Trạng thái đang tải, lỗi hoặc rỗng. Có dữ liệu thì không hiện gì. Lỗi báo bằng toast. */
export function QueryState({ query, isEmpty, emptyMessage }: QueryStateProps) {
  const failure = query.isError ? query.error : null;

  useEffect(() => {
    if (failure === null) return;
    const message = getErrorMessage(failure);
    // Một trang có thể có nhiều bảng cùng lỗi, id theo nội dung để chỉ hiện một toast.
    toast.error(message, { id: message });
  }, [failure]);

  if (query.isPending) return <Message>Đang tải…</Message>;

  if (query.isError) {
    return (
      <Message>
        <Button variant="outline" size="sm" onClick={() => query.refetch()}>
          Thử lại
        </Button>
      </Message>
    );
  }

  return isEmpty ? <Message>{emptyMessage}</Message> : null;
}
