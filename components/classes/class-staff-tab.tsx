"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { PlusIcon, UserIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { DialogForm } from "@/components/form/dialog-form";
import { TextField } from "@/components/form/fields";
import { ConfirmDialog } from "@/components/layout/confirm-dialog";
import { QueryState } from "@/components/layout/query-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useRefreshClasses } from "@/hooks/use-classroom";
import {
  applyFieldError,
  applyValidationErrors,
  memberApi,
  submitForm,
  toastApiError,
  type ClassMemberResponse,
} from "@/lib/api";
import { useAuth } from "@/lib/auth/auth-provider";
import { PERMISSIONS } from "@/lib/auth/permissions";
import {
  assignStaffSchema,
  type AssignStaffValues,
} from "@/lib/validations/classes";

import { MemberIdentity } from "./member-identity";

type StaffRole = "TEACHER" | "ASSISTANT";

const STAFF_LABELS: Record<StaffRole, string> = {
  TEACHER: "giáo viên",
  ASSISTANT: "trợ giảng",
};

export function useClassStaff(classId: number, role: StaffRole) {
  return useQuery({
    queryKey: ["classes", classId, "staff", role],
    queryFn: () =>
      memberApi.list(classId, {
        role,
        status: "ACTIVE",
        sort: "user.fullName,asc",
        size: 100,
      }),
  });
}

interface ClassStaffTabProps {
  classId: number;
  /** false khi lớp đã lưu trữ: vẫn xem được nhưng khoá mọi thao tác ghi. */
  editable: boolean;
}

export function ClassStaffTab({ classId, editable }: ClassStaffTabProps) {
  const { can } = useAuth();
  const canAssignTeachers = can(PERMISSIONS.TEACHER_ASSIGN);
  const canAssignAssistants = can(PERMISSIONS.ASSISTANT_ASSIGN);
  const refreshClasses = useRefreshClasses();
  const [assigning, setAssigning] = useState<StaffRole | null>(null);
  const [removing, setRemoving] = useState<ClassMemberResponse | null>(null);

  const handleRemove = async () => {
    if (!removing) return;
    await memberApi.unassignStaff(classId, removing.userId);
    await refreshClasses();
    toast.success("Đã gỡ khỏi lớp.");
  };

  return (
    <>
      <StaffSection
        classId={classId}
        role="TEACHER"
        title="Giáo viên"
        canRemove={canAssignTeachers && editable}
        onRemove={setRemoving}
        action={
          <div className="flex items-center gap-3">
            {!canAssignTeachers && (
              <span className="text-xs text-muted-foreground">
                Chỉ quản trị viên
              </span>
            )}
            <AssignButton
              label="Phân công giáo viên"
              primary={false}
              disabled={!canAssignTeachers || !editable}
              onClick={() => setAssigning("TEACHER")}
            />
          </div>
        }
      />
      <StaffSection
        classId={classId}
        role="ASSISTANT"
        title="Trợ giảng"
        canRemove={canAssignAssistants && editable}
        onRemove={setRemoving}
        action={
          canAssignAssistants && (
            <AssignButton
              label="Phân công trợ giảng"
              primary
              disabled={!editable}
              onClick={() => setAssigning("ASSISTANT")}
            />
          )
        }
      />

      <Dialog
        open={assigning !== null}
        onOpenChange={(open) => !open && setAssigning(null)}
      >
        {assigning && (
          <DialogContent title={`Phân công ${STAFF_LABELS[assigning]}`}>
            <AssignStaffForm
              classId={classId}
              onDone={() => setAssigning(null)}
            />
          </DialogContent>
        )}
      </Dialog>
      <ConfirmDialog
        open={removing !== null}
        onOpenChange={(open) => !open && setRemoving(null)}
        title={`Gỡ “${removing?.fullName}” khỏi lớp?`}
        description="Người này sẽ không còn quyền truy cập lớp."
        confirmLabel="Gỡ khỏi lớp"
        destructive
        onConfirm={handleRemove}
      />
    </>
  );
}

interface AssignButtonProps {
  label: string;
  primary: boolean;
  disabled: boolean;
  onClick: () => void;
}

function AssignButton({
  label,
  primary,
  disabled,
  onClick,
}: AssignButtonProps) {
  return (
    <Button
      variant={primary ? "default" : "outline"}
      size="sm"
      disabled={disabled}
      onClick={onClick}
    >
      <PlusIcon className="size-4" />
      {label}
    </Button>
  );
}

interface StaffSectionProps {
  classId: number;
  role: StaffRole;
  title: string;
  canRemove: boolean;
  onRemove: (member: ClassMemberResponse) => void;
  action: ReactNode;
}

function StaffSection({
  classId,
  role,
  title,
  canRemove,
  onRemove,
  action,
}: StaffSectionProps) {
  const staff = useClassStaff(classId, role);

  return (
    <section className="space-y-3">
      <div className="flex min-h-8 flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg leading-7 font-semibold">{title}</h2>
        {action}
      </div>
      <Card className="divide-y divide-muted overflow-hidden">
        {staff.data?.content.map((member) => (
          <div
            key={member.userId}
            className="flex h-16 items-center justify-between gap-4 px-5 text-sm"
          >
            <MemberIdentity fullName={member.fullName} email={member.email} />
            {canRemove && (
              <Button
                variant="destructive-outline"
                size="sm"
                onClick={() => onRemove(member)}
              >
                Gỡ
              </Button>
            )}
          </div>
        ))}
        <QueryState
          query={staff}
          isEmpty={staff.data?.content.length === 0}
          emptyMessage={`Chưa có ${title.toLowerCase()} nào.`}
        />
      </Card>
    </section>
  );
}

interface AssignStaffFormProps {
  classId: number;
  onDone: () => void;
}

function AssignStaffForm({ classId, onDone }: AssignStaffFormProps) {
  const refreshClasses = useRefreshClasses();
  const form = useForm<AssignStaffValues>({
    resolver: zodResolver(assignStaffSchema),
    defaultValues: { userId: "" },
  });

  const onSubmit = submitForm(form, async ({ userId }) => {
    try {
      await memberApi.assignStaff(classId, Number(userId));
      await refreshClasses();
      toast.success("Đã phân công vào lớp.");
      onDone();
    } catch (error) {
      const handled =
        applyFieldError(error, form, "userId", {
          INVALID_MEMBER_ROLE:
            "Tài khoản này không thể thực hiện vai trò được chọn",
          ACCESS_DENIED: "Bạn không có quyền phân công tài khoản này",
          RESOURCE_NOT_FOUND: "Không tìm thấy người dùng với ID này",
        }) || applyValidationErrors(error, form);
      if (!handled) toastApiError(error);
    }
  });

  return (
    <DialogForm
      onSubmit={onSubmit}
      pending={form.formState.isSubmitting}
      submitLabel="Phân công"
    >
      <TextField
        control={form.control}
        name="userId"
        label="ID người dùng"
        required
        icon={UserIcon}
        inputMode="numeric"
        autoFocus
      />
    </DialogForm>
  );
}
