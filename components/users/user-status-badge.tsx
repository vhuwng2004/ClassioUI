import { StatusBadge } from "@/components/ui/status-badge";
import type { UserStatus } from "@/lib/api";

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  ACTIVE: "Đang hoạt động",
  LOCKED: "Đã khoá",
  INACTIVE: "Ngừng hoạt động",
};

export function UserStatusBadge({ status }: { status: UserStatus }) {
  return (
    <StatusBadge tone={status === "ACTIVE" ? "success" : "neutral"}>
      {USER_STATUS_LABELS[status]}
    </StatusBadge>
  );
}
