"use client";

import { MailIcon, type LucideIcon } from "lucide-react";
import type { ComponentProps } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { FormField, type FormFieldProps } from "./form-field";
import { IconInput } from "./icon-input";
import { PasswordInput } from "./password-input";

/** Các prop do react-hook-form và FormField quản lý, ô nhập không tự nhận. */
type ManagedProp =
  | "id"
  | "name"
  | "required"
  | "className"
  | "value"
  | "defaultValue"
  | "onChange"
  | "onBlur"
  | "ref";

type BaseProps<T extends FieldValues, N extends FieldPath<T>> = Omit<
  FormFieldProps<T, N>,
  "children"
>;

export type TextFieldProps<
  T extends FieldValues,
  N extends FieldPath<T>,
> = BaseProps<T, N> &
  Omit<ComponentProps<typeof Input>, ManagedProp> & { icon?: LucideIcon };

export function TextField<T extends FieldValues, N extends FieldPath<T>>({
  control,
  name,
  label,
  required,
  invalid,
  hint,
  className,
  icon,
  ...inputProps
}: TextFieldProps<T, N>) {
  return (
    <FormField
      control={control}
      name={name}
      label={label}
      required={required}
      invalid={invalid}
      hint={hint}
      className={className}
    >
      {({ field, invalid }) =>
        icon ? (
          <IconInput
            {...field}
            {...inputProps}
            id={field.name}
            icon={icon}
            aria-invalid={invalid}
          />
        ) : (
          <Input
            {...field}
            {...inputProps}
            id={field.name}
            aria-invalid={invalid}
          />
        )
      }
    </FormField>
  );
}

export function EmailField<T extends FieldValues, N extends FieldPath<T>>({
  label = "Email",
  autoComplete = "email",
  ...props
}: Omit<TextFieldProps<T, N>, "label" | "icon" | "type"> & { label?: string }) {
  return (
    <TextField
      {...(props as TextFieldProps<T, N>)}
      label={label}
      icon={MailIcon}
      type="email"
      autoComplete={autoComplete}
    />
  );
}

type PasswordFieldProps<
  T extends FieldValues,
  N extends FieldPath<T>,
> = BaseProps<T, N> & Omit<ComponentProps<typeof PasswordInput>, ManagedProp>;

export function PasswordField<T extends FieldValues, N extends FieldPath<T>>({
  control,
  name,
  label,
  required,
  invalid,
  hint,
  className,
  ...inputProps
}: PasswordFieldProps<T, N>) {
  return (
    <FormField
      control={control}
      name={name}
      label={label}
      required={required}
      invalid={invalid}
      hint={hint}
      className={className}
    >
      {({ field, invalid }) => (
        <PasswordInput
          {...field}
          {...inputProps}
          id={field.name}
          aria-invalid={invalid}
        />
      )}
    </FormField>
  );
}

type TextareaFieldProps<
  T extends FieldValues,
  N extends FieldPath<T>,
> = BaseProps<T, N> & Omit<ComponentProps<typeof Textarea>, ManagedProp>;

export function TextareaField<T extends FieldValues, N extends FieldPath<T>>({
  control,
  name,
  label,
  required,
  invalid,
  hint,
  className,
  ...textareaProps
}: TextareaFieldProps<T, N>) {
  return (
    <FormField
      control={control}
      name={name}
      label={label}
      required={required}
      invalid={invalid}
      hint={hint}
      className={className}
    >
      {({ field, invalid }) => (
        <Textarea
          {...field}
          {...textareaProps}
          id={field.name}
          aria-invalid={invalid}
        />
      )}
    </FormField>
  );
}
