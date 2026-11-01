import {
  get,
  type FieldValues,
  type Path,
  type SubmitHandler,
  type UseFormReturn,
} from "react-hook-form";
import { toast } from "sonner";

import { ApiError, SessionExpiredError } from "./client";
import type { ErrorCode } from "./types";

export const SESSION_EXPIRED_MESSAGE =
  "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";

let formErrorToast: string | number | undefined;

const ERROR_MESSAGES: Record<ErrorCode, string> = {
  VALIDATION_FAILED: "Vui lòng kiểm tra lại thông tin",
  INVALID_REQUEST: "Yêu cầu không hợp lệ",
  GUARDIAN_REQUIRED: "Người dùng dưới 18 tuổi cần ít nhất một người giám hộ",
  INVALID_RESET_OTP: "Mã OTP không hợp lệ hoặc đã hết hạn",
  INVALID_RESET_TOKEN:
    "Phiên đặt lại mật khẩu đã hết hạn, vui lòng yêu cầu mã mới",
  INVALID_CURRENT_PASSWORD: "Mật khẩu hiện tại không đúng",
  INVALID_MEMBER_ROLE: "Tài khoản này không thể thực hiện vai trò được chọn",
  AUTHENTICATION_REQUIRED: "Vui lòng đăng nhập lại",
  AUTHENTICATION_FAILED: "Email hoặc mật khẩu không đúng",
  ACCESS_DENIED: "Bạn không có quyền thực hiện thao tác này",
  CLASSROOM_NOT_FOUND: "Không tìm thấy lớp học",
  RESOURCE_NOT_FOUND: "Không tìm thấy dữ liệu",
  METHOD_NOT_ALLOWED: "Yêu cầu không hợp lệ",
  EMAIL_ALREADY_REGISTERED: "Email đã được đăng ký",
  CLASSROOM_NAME_ALREADY_USED: "Tên lớp đã tồn tại",
  CLASSROOM_ARCHIVED: "Lớp đã được lưu trữ",
  CLASSROOM_NOT_ARCHIVED: "Lớp chưa được lưu trữ",
  CLASSROOM_PENDING_APPROVAL: "Lớp đang chờ duyệt",
  CLASSROOM_NOT_PENDING: "Lớp không còn ở trạng thái chờ duyệt",
  MEMBERSHIP_CONFLICT: "Trạng thái thành viên đã thay đổi",
  INTERNAL_ERROR: "Đã có lỗi xảy ra",
  PASSWORD_CHANGE_UNAVAILABLE: "Dịch vụ tạm gián đoạn, vui lòng yêu cầu mã mới",
};

export function getErrorMessage(error: unknown): string {
  if (error instanceof SessionExpiredError) return SESSION_EXPIRED_MESSAGE;
  if (!(error instanceof ApiError))
    return "Không kết nối được máy chủ. Vui lòng thử lại.";
  return error.code
    ? ERROR_MESSAGES[error.code]
    : ERROR_MESSAGES.INTERNAL_ERROR;
}

export function toastApiError(error: unknown): void {
  // AuthProvider đã báo hết phiên, thêm toast ở đây sẽ thành hai thông báo.
  if (error instanceof SessionExpiredError) return;

  const correlationId =
    error instanceof ApiError ? error.problem?.correlationId : undefined;
  toast.error(getErrorMessage(error), {
    description: correlationId ? `Mã tra cứu: ${correlationId}` : undefined,
  });
}

function firstErrorMessage(errors: object): string | undefined {
  for (const error of Object.values(errors)) {
    if (typeof error !== "object" || error === null) continue;
    // Lá của FieldErrors có `ref` trỏ tới DOM nên không được duyệt tiếp vào trong.
    const message = "type" in error ? error.message : firstErrorMessage(error);
    if (message) return message;
  }
  return undefined;
}

/**
 * Mỗi lúc chỉ giữ một toast lỗi của form. Tạo toast mới thay vì cập nhật theo id,
 * vì toast được cập nhật giữ nguyên vị trí và có thể nằm khuất sau toast khác.
 */
export function toastFormError(message: string, description?: string): void {
  dismissFormError();
  formErrorToast = toast.error(message, { description });
}

function dismissFormError(): void {
  // Gọi `toast.dismiss()` không có id sẽ đóng toàn bộ toast.
  if (formErrorToast !== undefined) toast.dismiss(formErrorToast);
}

/** Thay cho `form.handleSubmit`: dữ liệu không hợp lệ thì báo bằng toast, gửi lại thì đóng lỗi cũ. */
export function submitForm<T extends FieldValues>(
  form: UseFormReturn<T>,
  onValid: SubmitHandler<T>,
) {
  return form.handleSubmit(
    (values, event) => {
      dismissFormError();
      return onValid(values, event);
    },
    (errors) => {
      toastFormError(
        firstErrorMessage(errors) ?? ERROR_MESSAGES.VALIDATION_FAILED,
      );
    },
  );
}

/**
 * Báo lỗi nghiệp vụ bằng toast và tô đỏ field liên quan. `messages` là các mã lỗi thuộc field đó.
 * Trả về false nếu mã lỗi không nằm trong danh sách, để nơi gọi xử lý tiếp.
 */
export function applyFieldError<T extends FieldValues>(
  error: unknown,
  form: UseFormReturn<T>,
  field: Path<T>,
  messages: Partial<Record<ErrorCode, string>>,
): boolean {
  const code = error instanceof ApiError ? error.code : undefined;
  const message = code && messages[code];
  if (!message) return false;

  form.setError(field, { type: "server", message }, { shouldFocus: true });
  toastFormError(message);
  return true;
}

/**
 * Tô đỏ các field trong lỗi VALIDATION_FAILED và báo bằng toast.
 * Trả về false nếu có lỗi không gắn được vào field đang hiển thị, để nơi gọi tự báo lỗi.
 */
export function applyValidationErrors<T extends FieldValues>(
  error: unknown,
  form: UseFormReturn<T>,
): boolean {
  if (!(error instanceof ApiError) || error.code !== "VALIDATION_FAILED")
    return false;

  const values = form.getValues();
  const fields = (error.problem?.errors ?? []).map(({ field }) =>
    field.replace(/\[(\d+)\]/g, ".$1"),
  );
  const known = fields.filter((path) => get(values, path) !== undefined);

  // `message` từ backend là tiếng Anh nên chỉ dùng để đánh dấu field, không hiển thị.
  known.forEach((path) => {
    form.setError(path as Path<T>, { type: "server" });
  });
  if (known.length === 0 || known.length !== fields.length) return false;

  toastFormError(ERROR_MESSAGES.VALIDATION_FAILED);
  return true;
}
