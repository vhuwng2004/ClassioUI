"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { EmailField, PasswordField } from "@/components/form/fields";
import { SubmitButton } from "@/components/form/submit-button";
import {
  ApiError,
  applyValidationErrors,
  submitForm,
  toastApiError,
  toastFormError,
} from "@/lib/api";
import { useAuth } from "@/lib/auth/auth-provider";
import { getDeviceName } from "@/lib/auth/device-name";
import { loginSchema, type LoginValues } from "@/lib/validations/auth";

export function LoginForm() {
  const { login } = useAuth();
  const [credentialsRejected, setCredentialsRejected] = useState(false);
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = submitForm(form, async (values) => {
    setCredentialsRejected(false);
    try {
      await login({ ...values, deviceName: getDeviceName() });
      toast.success("Đăng nhập thành công.");
    } catch (error) {
      if (error instanceof ApiError && error.code === "AUTHENTICATION_FAILED") {
        setCredentialsRejected(true);
        toastFormError("Email hoặc mật khẩu không đúng");
      } else if (!applyValidationErrors(error, form)) {
        toastApiError(error);
      }
    }
  });

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      onChange={() => setCredentialsRejected(false)}
      className="space-y-5"
    >
      <EmailField
        control={form.control}
        name="email"
        placeholder="ten@example.com"
        invalid={credentialsRejected}
      />

      <PasswordField
        control={form.control}
        name="password"
        label="Mật khẩu"
        autoComplete="current-password"
        invalid={credentialsRejected}
      />

      <div className="flex justify-end">
        <Link
          href="/forgot-password"
          className="text-sm font-semibold text-primary hover:underline"
        >
          Quên mật khẩu?
        </Link>
      </div>

      <SubmitButton pending={form.formState.isSubmitting}>
        Đăng nhập
      </SubmitButton>

      <p className="flex justify-center gap-2 text-sm text-muted-foreground">
        Chưa có tài khoản?
        <Link
          href="/register"
          className="font-semibold text-primary hover:underline"
        >
          Đăng ký
        </Link>
      </p>
    </form>
  );
}
