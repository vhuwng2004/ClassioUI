import { StatusBadge } from "@/components/ui/status-badge";
import type { ClassStatus } from "@/lib/api";

export function ClassStatusBadge({ status }: { status: ClassStatus }) {
  if (status === "PENDING") {
    return <StatusBadge tone="warning">Chờ duyệt</StatusBadge>;
  }
  return status === "ACTIVE" ? (
    <StatusBadge tone="success">Đang hoạt động</StatusBadge>
  ) : (
    <StatusBadge tone="neutral">Đã lưu trữ</StatusBadge>
  );
}
