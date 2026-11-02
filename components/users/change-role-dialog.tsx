"use client";

import { useState } from "react";
import { toast } from "sonner";

import { SelectMenu } from "@/components/form/select-menu";
import { ConfirmDialog } from "@/components/layout/confirm-dialog";
import { useRefreshUsers } from "@/hooks/use-users";
import { userApi, type UserAdminResponse, type UserRole } from "@/lib/api";
import { ROLE_LABELS } from "@/lib/auth/roles";

const ROLE_OPTIONS = (Object.keys(ROLE_LABELS) as UserRole[]).map((value) => ({
  value,
  label: ROLE_LABELS[value],
}));

interface ChangeRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserAdminResponse;
}

export function ChangeRoleDialog({
  open,
  onOpenChange,
  user,
}: ChangeRoleDialogProps) {
  const refreshUsers = useRefreshUsers();
  const [role, setRole] = useState(user.role);

  const handleConfirm = async () => {
    await userApi.changeRole(user.id, role);
    await refreshUsers();
    toast.success("Đã đổi vai trò.");
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Đổi vai trò của “${user.fullName}”?`}
      description="Quyền mới có hiệu lực ngay. Trừ đổi giữa giáo viên và trợ giảng, người này phải được gỡ khỏi mọi lớp trước."
      confirmLabel="Đổi vai trò"
      onConfirm={handleConfirm}
    >
      <div>
        <SelectMenu
          label="Vai trò mới"
          align="start"
          options={ROLE_OPTIONS}
          value={role}
          onChange={setRole}
        />
      </div>
    </ConfirmDialog>
  );
}
