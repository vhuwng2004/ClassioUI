import type { Metadata } from "next";

import { RequirePermission } from "@/components/auth/guards";
import { UserList } from "@/components/users/user-list";
import { PERMISSIONS } from "@/lib/auth/permissions";

export const metadata: Metadata = { title: "Người dùng | Classio" };

export default function StaffUsersPage() {
  return (
    <RequirePermission permission={PERMISSIONS.USER_VIEW}>
      <UserList />
    </RequirePermission>
  );
}
