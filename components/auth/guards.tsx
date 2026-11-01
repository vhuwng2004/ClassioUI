"use client";

import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import type { ClassroomResponse } from "@/lib/api";
import { useAuth } from "@/lib/auth/auth-provider";
import type { Permission } from "@/lib/auth/permissions";
import { homePathFor, safeNextPath } from "@/lib/auth/roles";

function FullPageSpinner() {
  return (
    <div className="flex min-h-svh items-center justify-center" role="status">
      <Loader2Icon className="size-6 animate-spin text-primary" />
      <span className="sr-only">Đang tải…</span>
    </div>
  );
}

/** Chỉ cho người đã đăng nhập. Phiên nằm trong bộ nhớ nên guard chạy ở client. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { state } = useAuth();

  useEffect(() => {
    if (state.status !== "unauthenticated") return;
    const next = `${window.location.pathname}${window.location.search}`;
    const keepNext = !state.signedOut && next !== "/";
    router.replace(
      keepNext ? `/login?next=${encodeURIComponent(next)}` : "/login",
    );
  }, [router, state]);

  return state.status === "authenticated" ? children : <FullPageSpinner />;
}

/** Dùng bên trong RequireAuth. Thiếu quyền thì chuyển sang /forbidden. */
export function RequirePermission({
  permission,
  children,
}: {
  permission: Permission;
  children: ReactNode;
}) {
  const router = useRouter();
  const { state, can } = useAuth();
  const allowed = can(permission);

  useEffect(() => {
    if (state.user && !allowed) router.replace("/forbidden");
  }, [allowed, router, state.user]);

  return allowed ? children : <FullPageSpinner />;
}

/** Ẩn phần giao diện khi thiếu quyền. Truyền `classroom` để xét thêm trạng thái lớp. */
export function Can({
  permission,
  classroom,
  fallback = null,
  children,
}: {
  permission: Permission;
  classroom?: Pick<ClassroomResponse, "status">;
  fallback?: ReactNode;
  children: ReactNode;
}) {
  const { can } = useAuth();
  return can(permission, classroom) ? children : fallback;
}

/** Trang dành cho khách. Đã đăng nhập thì quay lại `?next=` hoặc trang chủ theo role. */
export function GuestOnly({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { state } = useAuth();

  useEffect(() => {
    if (state.status !== "authenticated") return;
    const next = new URLSearchParams(window.location.search).get("next");
    router.replace(safeNextPath(next) ?? homePathFor(state.user.role));
  }, [router, state]);

  return state.status === "unauthenticated" ? children : <FullPageSpinner />;
}

/** Trang gốc: chuyển về trang chủ theo role. */
export function RoleHomeRedirect() {
  const router = useRouter();
  const { state } = useAuth();

  useEffect(() => {
    if (state.user) router.replace(homePathFor(state.user.role));
  }, [router, state.user]);

  return <FullPageSpinner />;
}
