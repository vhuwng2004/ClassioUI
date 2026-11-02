import { z } from "zod";

import type { Gender, RegisterRequest, UpdateProfileRequest } from "@/lib/api";

export const PASSWORD_MAX_LENGTH = 72;
export const MAX_GUARDIANS = 5;

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "FEMALE", label: "Nữ" },
  { value: "MALE", label: "Nam" },
  { value: "OTHER", label: "Khác" },
];

const REQUIRED_EMAIL = "Vui lòng nhập email";
const INVALID_EMAIL = "Email không hợp lệ";

export const emailSchema = z
  .string()
  .trim()
  .min(1, REQUIRED_EMAIL)
  .max(320, "Email tối đa 320 ký tự")
  .pipe(z.email(INVALID_EMAIL));

export function optionalText(maxLength: number, label: string) {
  return z.string().trim().max(maxLength, `${label} tối đa ${maxLength} ký tự`);
}

interface PasswordRule {
  label: string;
  shortLabel?: string;
  secondary?: boolean;
  test: (value: string) => boolean;
}

export const passwordRules: PasswordRule[] = [
  {
    label: "Từ 9 đến 72 ký tự",
    test: (value: string) => value.length >= 9 && value.length <= 72,
  },
  {
    label: "Có ít nhất một chữ hoa",
    test: (value: string) => /[A-Z]/.test(value),
  },
  {
    label: "Có ít nhất một ký tự đặc biệt (vd: ! @ #)",
    shortLabel: "Có ít nhất một ký tự đặc biệt",
    test: (value: string) => /[!-/:-@[-`{-~]/.test(value),
  },
  {
    label: "Chỉ dùng ký tự ASCII",
    secondary: true,
    test: (value: string) => /^[\x20-\x7E]*$/.test(value),
  },
];

const newPasswordSchema = z
  .string()
  .refine(
    (value) => passwordRules.every((rule) => rule.test(value)),
    "Mật khẩu chưa đáp ứng yêu cầu",
  );

export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, "Vui lòng nhập mật khẩu")
    .max(PASSWORD_MAX_LENGTH, `Mật khẩu tối đa ${PASSWORD_MAX_LENGTH} ký tự`)
    .regex(/^[\x20-\x7E]*$/, "Mật khẩu chỉ gồm ký tự ASCII"),
});

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const verifyOtpSchema = z.object({
  otp: z.string().regex(/^[0-9]{6}$/, "Vui lòng nhập đủ 6 chữ số"),
});

export const resetPasswordSchema = z.object({
  newPassword: newPasswordSchema,
});

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Vui lòng nhập mật khẩu hiện tại")
      .max(PASSWORD_MAX_LENGTH, `Mật khẩu tối đa ${PASSWORD_MAX_LENGTH} ký tự`),
    newPassword: newPasswordSchema,
    confirmPassword: z.string().min(1, "Vui lòng nhập lại mật khẩu mới"),
  })
  .refine((values) => values.confirmPassword === values.newPassword, {
    message: "Mật khẩu nhập lại không khớp",
    path: ["confirmPassword"],
  });

/** Admin đã thấy mật khẩu tạm nên không được giữ lại. Backend cũng chặn trường hợp này. */
export const temporaryPasswordChangeSchema = changePasswordSchema.refine(
  (values) => values.newPassword !== values.currentPassword,
  {
    message: "Mật khẩu mới phải khác mật khẩu tạm",
    path: ["newPassword"],
  },
);

export const guardianSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập họ và tên")
    .max(150, "Họ và tên tối đa 150 ký tự"),
  phone: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập số điện thoại")
    .max(32, "Số điện thoại tối đa 32 ký tự"),
  address: z.string().trim().min(1, "Vui lòng nhập địa chỉ"),
  relationship: optionalText(50, "Quan hệ"),
});

export const looseGuardianSchema = z.object({
  fullName: z.string(),
  phone: z.string(),
  address: z.string(),
  relationship: z.string(),
});

export const emptyGuardian = {
  fullName: "",
  phone: "",
  address: "",
  relationship: "",
};

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Theo backend: `dateOfBirth + 18 năm` sau ngày hiện tại (UTC). */
export function isUnder18(dateOfBirth: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateOfBirth);
  if (!match) return false;
  const [year, month, day] = match.slice(1).map(Number);
  const adultDate = new Date(Date.UTC(year + 18, month - 1, day));
  // 29/02 + 18 năm rơi vào năm không nhuận thì lùi về 28/02, giống LocalDate.plusYears.
  if (adultDate.getUTCMonth() !== month - 1) adultDate.setUTCDate(0);
  return adultDate.toISOString().slice(0, 10) > todayUtc();
}

export const fullNameSchema = z
  .string()
  .trim()
  .min(1, "Vui lòng nhập họ và tên")
  .max(150, "Họ và tên tối đa 150 ký tự");

export const dateOfBirthSchema = z
  .string()
  .min(1, "Vui lòng nhập ngày sinh")
  .refine(
    (value) => value < todayUtc(),
    "Ngày sinh phải là ngày trong quá khứ",
  );

export const genderSchema = z.enum(["MALE", "FEMALE", "OTHER"]).optional();

export const profileSchema = z.object({
  fullName: fullNameSchema,
  dateOfBirth: dateOfBirthSchema,
  gender: genderSchema,
  phone: optionalText(32, "Số điện thoại"),
  school: optionalText(200, "Trường"),
  grade: optionalText(50, "Lớp / Khối"),
  address: z.string().trim(),
});

export const registerSchema = z
  .object({
    fullName: fullNameSchema,
    dateOfBirth: dateOfBirthSchema,
    gender: genderSchema,
    phone: optionalText(32, "Số điện thoại"),
    email: emailSchema,
    password: newPasswordSchema,
    school: optionalText(200, "Trường"),
    grade: optionalText(50, "Lớp / Khối"),
    address: z.string().trim(),
    // Giữ dữ liệu khi người dùng sửa ngày sinh qua lại; chỉ kiểm tra khi dưới 18 tuổi.
    guardians: z.array(looseGuardianSchema).max(MAX_GUARDIANS),
  })
  .superRefine((values, ctx) => {
    if (!isUnder18(values.dateOfBirth)) return;
    values.guardians.forEach((guardian, index) => {
      guardianSchema.safeParse(guardian).error?.issues.forEach((issue) => {
        ctx.addIssue({
          code: "custom",
          message: issue.message,
          path: ["guardians", index, ...issue.path],
        });
      });
    });
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type VerifyOtpValues = z.infer<typeof verifyOtpSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
export type ProfileValues = z.infer<typeof profileSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;

export const blankToUndefined = (value: string) => value.trim() || undefined;

/** PUT thay toàn bộ hồ sơ: field để trống không gửi đi và bị xoá ở backend. */
export function toUpdateProfileRequest(
  values: ProfileValues,
): UpdateProfileRequest {
  return {
    fullName: values.fullName,
    dateOfBirth: values.dateOfBirth,
    gender: values.gender,
    phone: blankToUndefined(values.phone),
    address: blankToUndefined(values.address),
    school: blankToUndefined(values.school),
    grade: blankToUndefined(values.grade),
  };
}

export function toRegisterRequest(
  values: RegisterValues,
  includeGuardians: boolean,
): RegisterRequest {
  return {
    email: values.email,
    password: values.password,
    fullName: values.fullName,
    dateOfBirth: values.dateOfBirth,
    gender: values.gender,
    phone: blankToUndefined(values.phone),
    address: blankToUndefined(values.address),
    school: blankToUndefined(values.school),
    grade: blankToUndefined(values.grade),
    guardians: includeGuardians
      ? values.guardians.map((guardian) => ({
          fullName: guardian.fullName.trim(),
          phone: guardian.phone.trim(),
          address: guardian.address.trim(),
          relationship: blankToUndefined(guardian.relationship),
        }))
      : undefined,
  };
}
