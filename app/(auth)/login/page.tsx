import type { Metadata } from "next";

import { AuthHeading } from "@/components/auth/auth-heading";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Đăng nhập | Classio" };

export default function LoginPage() {
  return (
    <div className="w-full max-w-100">
      <AuthHeading title="Đăng nhập" />
      <LoginForm />
    </div>
  );
}
