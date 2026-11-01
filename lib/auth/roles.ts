import type { UserRole } from "@/lib/api";

import { hasPermission, PERMISSIONS } from "./permissions";

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Quản trị viên",
  SP_ADMIN: "Quản trị viên cấp cao",
  TEACHER: "Giáo viên",
  ASSISTANT: "Trợ giảng",
  USER: "Học sinh",
};

export function homePathFor(role: UserRole): string {
  return hasPermission(role, PERMISSIONS.STAFF_WORKSPACE_VIEW)
    ? "/staff"
    : "/student";
}

/** Chỉ nhận đường dẫn nội bộ, tránh open redirect qua `?next=`. */
export function safeNextPath(next: string | null): string | null {
  return next?.startsWith("/") &&
    !next.startsWith("//") &&
    !next.startsWith("/\\")
    ? next
    : null;
}
