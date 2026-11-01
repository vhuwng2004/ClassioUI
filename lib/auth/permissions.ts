import type { ClassroomResponse, ClassStatus, UserRole } from "@/lib/api";

export const PERMISSIONS = {
  STAFF_WORKSPACE_VIEW: "staff-workspace:view",
  STUDENT_WORKSPACE_VIEW: "student-workspace:view",
  CLASS_CREATE: "class:create",
  CLASS_EDIT: "class:edit",
  CLASS_ARCHIVE: "class:archive",
  CLASS_APPROVE: "class:approve",
  CLASS_RESTORE: "class:restore",
  JOIN_CODE_ROTATE: "join-code:rotate",
  STUDENT_MANAGE: "student:manage",
  JOIN_REQUEST_REVIEW: "join-request:review",
  TEACHER_ASSIGN: "teacher:assign",
  ASSISTANT_ASSIGN: "assistant:assign",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const ASSISTANT_PERMISSIONS: Permission[] = [
  PERMISSIONS.STAFF_WORKSPACE_VIEW,
  PERMISSIONS.STUDENT_MANAGE,
  PERMISSIONS.JOIN_REQUEST_REVIEW,
];

const TEACHER_PERMISSIONS: Permission[] = [
  ...ASSISTANT_PERMISSIONS,
  PERMISSIONS.CLASS_CREATE,
  PERMISSIONS.CLASS_EDIT,
  PERMISSIONS.CLASS_ARCHIVE,
  PERMISSIONS.JOIN_CODE_ROTATE,
  PERMISSIONS.ASSISTANT_ASSIGN,
];

const ADMIN_PERMISSIONS: Permission[] = [
  ...TEACHER_PERMISSIONS,
  PERMISSIONS.CLASS_APPROVE,
  PERMISSIONS.CLASS_RESTORE,
  PERMISSIONS.TEACHER_ASSIGN,
];

/**
 * Chỉ để ẩn/hiện cho đúng UX, backend vẫn kiểm tra quyền ở từng endpoint.
 * Khi đổi quyền phải giữ khớp với `@PreAuthorize` của backend (docs/api-integration.md, mục 4).
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SP_ADMIN: ADMIN_PERMISSIONS,
  ADMIN: ADMIN_PERMISSIONS,
  TEACHER: TEACHER_PERMISSIONS,
  ASSISTANT: ASSISTANT_PERMISSIONS,
  USER: [PERMISSIONS.STUDENT_WORKSPACE_VIEW],
};

/** Trạng thái lớp cho phép từng quyền; quyền không có ở đây chỉ dùng được khi lớp `ACTIVE`. */
const CLASS_STATUS_RULES: Partial<Record<Permission, ClassStatus[]>> = {
  [PERMISSIONS.CLASS_APPROVE]: ["PENDING"],
  [PERMISSIONS.CLASS_RESTORE]: ["ARCHIVED"],
  // Lưu trữ lớp chờ duyệt là cách huỷ hoặc từ chối yêu cầu tạo lớp.
  [PERMISSIONS.CLASS_ARCHIVE]: ["PENDING", "ACTIVE"],
};

/** Truyền `classroom` để xét thêm trạng thái lớp. */
export function hasPermission(
  role: UserRole | undefined,
  permission: Permission,
  classroom?: Pick<ClassroomResponse, "status">,
): boolean {
  if (!role || !ROLE_PERMISSIONS[role].includes(permission)) return false;
  if (!classroom) return true;
  const allowedStatuses = CLASS_STATUS_RULES[permission] ?? ["ACTIVE"];
  return allowedStatuses.includes(classroom.status);
}
