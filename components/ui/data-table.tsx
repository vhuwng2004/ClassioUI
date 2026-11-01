import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

interface DataTableProps {
  /** Các ô `<th>` của hàng tiêu đề. */
  head: ReactNode;
  children: ReactNode;
}

/** Bảng đặt trong `Card`. Cột cố định, màn hẹp thì cuộn ngang. */
export function DataTable({ head, children }: DataTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-3xl table-fixed text-sm">
        <thead className="bg-surface text-left text-xs text-muted-foreground">
          <tr className="h-11.25 border-b *:font-semibold">{head}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function DataRow({ className, ...props }: ComponentProps<"tr">) {
  return (
    <tr
      className={cn(
        "h-15.25 border-b border-muted last:h-15 last:border-b-0",
        className,
      )}
      {...props}
    />
  );
}
