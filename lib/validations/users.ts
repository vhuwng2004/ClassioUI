import { z } from "zod";

import type { CreateUserRequest, UserRole } from "@/lib/api";

import {
  blankToUndefined,
  dateOfBirthSchema,
  emailSchema,
  fullNameSchema,
  genderSchema,
  guardianSchema,
  isUnder18,
  looseGuardianSchema,
  MAX_GUARDIANS,
  optionalText,
} from "./auth";

export const IMPORT_MAX_BYTES = 2 * 1024 * 1024;

export const createUserSchema = z
  .object({
    role: z.enum(["USER", "TEACHER", "ASSISTANT", "ADMIN", "SP_ADMIN"]),
    fullName: fullNameSchema,
    dateOfBirth: dateOfBirthSchema,
    gender: genderSchema,
    phone: optionalText(32, "Số điện thoại"),
    email: emailSchema,
    school: optionalText(200, "Trường"),
    grade: optionalText(50, "Lớp / Khối"),
    address: z.string().trim(),
    guardians: z.array(looseGuardianSchema).max(MAX_GUARDIANS),
  })
  .superRefine((values, ctx) => {
    if (!guardianRequired(values)) return;
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

export type CreateUserValues = z.infer<typeof createUserSchema>;

/** Theo backend: chỉ học sinh dưới 18 tuổi mới bắt buộc có người giám hộ. */
export function guardianRequired(values: {
  role: UserRole;
  dateOfBirth: string;
}): boolean {
  return values.role === "USER" && isUnder18(values.dateOfBirth);
}

export function toCreateUserRequest(
  values: CreateUserValues,
): CreateUserRequest {
  return {
    role: values.role,
    email: values.email,
    fullName: values.fullName,
    dateOfBirth: values.dateOfBirth,
    gender: values.gender,
    phone: blankToUndefined(values.phone),
    address: blankToUndefined(values.address),
    school: blankToUndefined(values.school),
    grade: blankToUndefined(values.grade),
    guardians: guardianRequired(values)
      ? values.guardians.map((guardian) => ({
          fullName: guardian.fullName.trim(),
          phone: guardian.phone.trim(),
          address: guardian.address.trim(),
          relationship: blankToUndefined(guardian.relationship),
        }))
      : undefined,
  };
}
