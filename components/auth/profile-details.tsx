"use client";

import { KeyRoundIcon, PencilIcon } from "lucide-react";
import { useState } from "react";

import { PageHeading } from "@/components/layout/page-heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Gender } from "@/lib/api";
import { useAuth } from "@/lib/auth/auth-provider";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { formatDate } from "@/lib/format";

import { ChangePasswordDialog } from "./change-password-dialog";
import { EditProfileDialog } from "./edit-profile-dialog";

const GENDER_LABELS: Record<Gender, string> = {
  FEMALE: "Nữ",
  MALE: "Nam",
  OTHER: "Khác",
};

export function ProfileDetails() {
  const { user } = useAuth().state;
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  if (!user) return null;

  const details = [
    { label: "Họ và tên", value: user.fullName },
    { label: "Email", value: user.email },
    { label: "Vai trò", value: ROLE_LABELS[user.role] },
    { label: "Ngày sinh", value: formatDate(user.dateOfBirth) },
    { label: "Giới tính", value: user.gender && GENDER_LABELS[user.gender] },
    { label: "Số điện thoại", value: user.phone },
    { label: "Trường", value: user.school },
    { label: "Lớp / Khối", value: user.grade },
    { label: "Địa chỉ", value: user.address },
  ];

  return (
    <div className="space-y-5">
      <PageHeading
        title="Trang cá nhân"
        description="Thông tin tài khoản của bạn."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setChangingPassword(true)}>
              <KeyRoundIcon />
              Đổi mật khẩu
            </Button>
            <Button onClick={() => setEditing(true)}>
              <PencilIcon />
              Sửa hồ sơ
            </Button>
          </div>
        }
      />
      <Card className="p-5">
        <dl className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
          {details.map(({ label, value }) => (
            <div key={label} className="min-w-0">
              <dt className="text-[13px] leading-4.5 text-muted-foreground">
                {label}
              </dt>
              <dd className="mt-0.5 text-sm font-medium wrap-break-word">
                {value || "—"}
              </dd>
            </div>
          ))}
        </dl>
      </Card>
      <EditProfileDialog open={editing} onOpenChange={setEditing} user={user} />
      <ChangePasswordDialog
        open={changingPassword}
        onOpenChange={setChangingPassword}
      />
    </div>
  );
}
