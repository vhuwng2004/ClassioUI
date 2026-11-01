import type { Metadata } from "next";

import { AuthHeading } from "@/components/auth/auth-heading";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Đăng ký | Classio" };

export default function RegisterPage() {
  return (
    <div className="w-full max-w-160">
      <AuthHeading title="Tạo tài khoản học sinh" />
      <RegisterForm />
    </div>
  );
}
