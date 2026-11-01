import type { Metadata } from "next";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = { title: "Đặt lại mật khẩu | Classio" };

export default function ResetPasswordPage() {
  return (
    <div className="w-full max-w-100">
      <ResetPasswordForm />
    </div>
  );
}
