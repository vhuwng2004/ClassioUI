import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RequirePermission } from "@/components/auth/guards";
import { ClassDetail } from "@/components/classes/class-detail";
import { PERMISSIONS } from "@/lib/auth/permissions";

export const metadata: Metadata = { title: "Chi tiết lớp | Classio" };

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;
  if (!/^\d+$/.test(classId)) notFound();

  return (
    <RequirePermission permission={PERMISSIONS.STAFF_WORKSPACE_VIEW}>
      <ClassDetail classId={Number(classId)} />
    </RequirePermission>
  );
}
