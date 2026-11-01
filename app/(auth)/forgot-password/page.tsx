import type { Metadata } from "next";

import { AuthHeading } from "@/components/auth/auth-heading";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { KeyIcon } from "@/components/auth/key-icon";

export const metadata: Metadata = { title: "Quên mật khẩu | Classio" };

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-100">
      <AuthHeading icon={KeyIcon} title="Quên mật khẩu?" />
      <ForgotPasswordForm />
    </div>
  );
}
