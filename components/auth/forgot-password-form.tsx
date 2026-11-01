"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { EmailField } from "@/components/form/fields";
import { SubmitButton } from "@/components/form/submit-button";
import {
  applyValidationErrors,
  authApi,
  submitForm,
  toastApiError,
} from "@/lib/api";
import { saveResetRequest } from "@/lib/auth/reset-flow";
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from "@/lib/validations/auth";

export function ForgotPasswordForm() {
  const router = useRouter();
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = submitForm(form, async ({ email }) => {
    try {
      await authApi.forgotPassword(email);
      saveResetRequest(email);
      // API trả 200 cả khi email chưa đăng ký nên không được khẳng định là đã gửi.
      toast.info("Nếu email đã đăng ký, mã OTP sẽ được gửi vào hộp thư.");
      router.push("/reset-password");
    } catch (error) {
      if (!applyValidationErrors(error, form)) toastApiError(error);
    }
  });

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-5">
      <EmailField
        control={form.control}
        name="email"
        placeholder="ten@example.com"
      />

      <SubmitButton pending={form.formState.isSubmitting}>
        Gửi mã OTP
      </SubmitButton>

      <Link
        href="/login"
        className="flex items-center justify-center gap-2 text-sm font-semibold text-secondary-text hover:underline"
      >
        <ArrowLeftIcon className="size-4" />
        Quay lại đăng nhập
      </Link>
    </form>
  );
}
