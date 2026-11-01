import type { Metadata } from "next";

import { RequirePermission } from "@/components/auth/guards";
import { ClassList } from "@/components/classes/class-list";
import { PERMISSIONS } from "@/lib/auth/permissions";

export const metadata: Metadata = { title: "Lớp học | Classio" };

export default function StaffHomePage() {
  return (
    <RequirePermission permission={PERMISSIONS.STAFF_WORKSPACE_VIEW}>
      <ClassList />
    </RequirePermission>
  );
}
