import type { Metadata } from "next";

import { RequirePermission } from "@/components/auth/guards";
import { StudentClassList } from "@/components/classes/student-class-list";
import { PERMISSIONS } from "@/lib/auth/permissions";

export const metadata: Metadata = { title: "Lớp của tôi | Classio" };

export default function StudentHomePage() {
  return (
    <RequirePermission permission={PERMISSIONS.STUDENT_WORKSPACE_VIEW}>
      <StudentClassList />
    </RequirePermission>
  );
}
