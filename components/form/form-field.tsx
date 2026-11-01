"use client";

import type { ReactNode } from "react";
import {
  Controller,
  type Control,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { Field, FieldLabel } from "@/components/ui/field";

export interface FormFieldProps<T extends FieldValues, N extends FieldPath<T>> {
  control: Control<T>;
  name: N;
  label: string;
  required?: boolean;
  /** Tô đỏ dù field hợp lệ, ví dụ khi server từ chối cả cặp email và mật khẩu. */
  invalid?: boolean;
  /** Nội dung phụ ngay dưới ô nhập. */
  hint?: ReactNode;
  className?: string;
  children: (props: {
    field: ControllerRenderProps<T, N>;
    invalid: boolean;
  }) => ReactNode;
}

export function FormField<T extends FieldValues, N extends FieldPath<T>>({
  control,
  name,
  label,
  required,
  invalid,
  hint,
  className,
  children,
}: FormFieldProps<T, N>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={className}>
          <FieldLabel
            htmlFor={field.name}
            className="gap-0.75 text-[13px] leading-4.5 text-label"
          >
            {label}
            {required && <span className="text-destructive">*</span>}
          </FieldLabel>
          {children({ field, invalid: fieldState.invalid || Boolean(invalid) })}
          {hint}
        </Field>
      )}
    />
  );
}
