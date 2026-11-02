import { z } from "zod";

import { emailSchema } from "./auth";

export const CLASS_DESCRIPTION_MAX_LENGTH = 2000;

export const classSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tên lớp")
    .max(150, "Tên lớp tối đa 150 ký tự"),
  description: z
    .string()
    .trim()
    .max(
      CLASS_DESCRIPTION_MAX_LENGTH,
      `Mô tả tối đa ${CLASS_DESCRIPTION_MAX_LENGTH} ký tự`,
    ),
});

export type ClassValues = z.infer<typeof classSchema>;

export const addStudentSchema = z.object({ email: emailSchema });

export type AddStudentValues = z.infer<typeof addStudentSchema>;

export const assignStaffSchema = z.object({
  userId: z.number("Vui lòng chọn một người trong danh sách"),
});

export type AssignStaffValues = z.infer<typeof assignStaffSchema>;
