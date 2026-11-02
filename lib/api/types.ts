export type UserRole = "ADMIN" | "SP_ADMIN" | "TEACHER" | "ASSISTANT" | "USER";
export type UserStatus = "ACTIVE" | "LOCKED" | "INACTIVE";
export type Gender = "MALE" | "FEMALE" | "OTHER";
export type MembershipLevel = "FREE" | "PLUS" | "PRO" | "PREMIUM";
export type ClassStatus = "PENDING" | "ACTIVE" | "ARCHIVED";
export type ClassMemberStatus = "PENDING" | "ACTIVE" | "INACTIVE" | "REMOVED";

export type ErrorCode =
  | "VALIDATION_FAILED"
  | "INVALID_REQUEST"
  | "GUARDIAN_REQUIRED"
  | "INVALID_RESET_OTP"
  | "INVALID_RESET_TOKEN"
  | "INVALID_CURRENT_PASSWORD"
  | "INVALID_MEMBER_ROLE"
  | "AUTHENTICATION_REQUIRED"
  | "AUTHENTICATION_FAILED"
  | "ACCESS_DENIED"
  | "CLASSROOM_NOT_FOUND"
  | "RESOURCE_NOT_FOUND"
  | "METHOD_NOT_ALLOWED"
  | "EMAIL_ALREADY_REGISTERED"
  | "CLASSROOM_NAME_ALREADY_USED"
  | "CLASSROOM_ARCHIVED"
  | "CLASSROOM_NOT_ARCHIVED"
  | "CLASSROOM_PENDING_APPROVAL"
  | "CLASSROOM_NOT_PENDING"
  | "MEMBERSHIP_CONFLICT"
  | "INTERNAL_ERROR"
  | "PASSWORD_CHANGE_UNAVAILABLE"
  | "PASSWORD_CHANGE_REQUIRED"
  | "CANNOT_MODIFY_SELF"
  | "USER_HAS_ACTIVE_MEMBERSHIP"
  | "INVALID_IMPORT_FILE";

export interface ProblemDetail {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  code: ErrorCode;
  correlationId?: string;
  errors?: { field: string; message: string }[];
}

export interface UserSummary {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  dateOfBirth: string;
  gender: Gender | null;
  address: string | null;
  school: string | null;
  grade: string | null;
  role: UserRole;
  membershipLevel: MembershipLevel;
  mustChangePassword: boolean;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: "Bearer";
  accessExpiresAt: string;
  refreshExpiresAt: string;
  user: UserSummary;
}

export interface MessageResponse {
  message: string;
}

export interface GuardianRequest {
  fullName: string;
  phone: string;
  address: string;
  relationship?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  dateOfBirth: string;
  gender?: Gender;
  address?: string;
  school?: string;
  grade?: string;
  guardians?: GuardianRequest[];
}

export interface LoginRequest {
  email: string;
  password: string;
  deviceName?: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse {
  resetToken: string;
  expiresInSeconds: number;
}

export interface ResetPasswordRequest {
  email: string;
  resetToken: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  fullName: string;
  dateOfBirth: string;
  phone?: string;
  gender?: Gender;
  address?: string;
  school?: string;
  grade?: string;
}

export interface CreateClassRequest {
  name: string;
  description?: string;
}

export interface UpdateClassRequest {
  name?: string;
  description?: string;
}

export interface PageParams {
  page?: number;
  size?: number;
  sort?: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ClassroomResponse {
  id: number;
  name: string;
  description: string | null;
  status: ClassStatus;
  joinCode: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MembershipResponse {
  classId: number;
  userId: number;
  status: ClassMemberStatus;
  joinedAt: string;
}

export interface ClassMemberResponse {
  userId: number;
  fullName: string;
  email: string | null;
  userRole: UserRole;
  status: ClassMemberStatus;
  joinedAt: string;
}

export interface UserAdminResponse {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  dateOfBirth: string;
  gender: Gender | null;
  school: string | null;
  grade: string | null;
  role: UserRole;
  status: UserStatus;
  mustChangePassword: boolean;
  createdAt: string;
}

export interface CreateUserRequest {
  email: string;
  fullName: string;
  phone?: string;
  dateOfBirth: string;
  gender?: Gender;
  address?: string;
  school?: string;
  grade?: string;
  role: UserRole;
  guardians?: GuardianRequest[];
}

export interface CreatedUserResponse {
  user: UserAdminResponse;
  temporaryPassword: string;
}

export interface TemporaryPasswordResponse {
  temporaryPassword: string;
}

export interface AssignableUserResponse {
  id: number;
  fullName: string;
  email: string;
}

export type ImportErrorCode =
  | "REQUIRED"
  | "INVALID_FORMAT"
  | "TOO_LONG"
  | "DUPLICATE_IN_FILE"
  | "EMAIL_ALREADY_REGISTERED"
  | "GUARDIAN_REQUIRED";

export interface ImportRowError {
  row: number;
  field: string;
  code: ImportErrorCode;
}

export interface UserImportResponse {
  dryRun: boolean;
  totalRows: number;
  createdCount: number;
  errors: ImportRowError[];
}
