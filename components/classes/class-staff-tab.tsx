"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { CheckIcon, PlusIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { DialogForm } from "@/components/form/dialog-form";
import { SearchInput } from "@/components/form/search-input";
import { ConfirmDialog } from "@/components/layout/confirm-dialog";
import { QueryState } from "@/components/layout/query-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useRefreshClasses } from "@/hooks/use-classroom";
import { useDebounced } from "@/hooks/use-debounced";
import {
  applyFieldError,
  applyValidationErrors,
  memberApi,
  submitForm,
  toastApiError,
  userApi,
  type ClassMemberResponse,
} from "@/lib/api";
import { useAuth } from "@/lib/auth/auth-provider";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { cn } from "@/lib/utils";
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
              role={assigning}
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
  role: StaffRole;
  onDone: () => void;
}

function AssignStaffForm({ classId, role, onDone }: AssignStaffFormProps) {
  const refreshClasses = useRefreshClasses();
  const [search, setSearch] = useState("");
  const keyword = useDebounced(search.trim());
  const form = useForm<AssignStaffValues>({
    resolver: zodResolver(assignStaffSchema),
  });
  const selectedId = useWatch({ control: form.control, name: "userId" });
  const candidates = useQuery({
    queryKey: ["users", "assignable", { role, keyword }],
    queryFn: () => userApi.assignable({ role, keyword, size: 10 }),
    placeholderData: keepPreviousData,
  });

  const onSubmit = submitForm(form, async ({ userId }) => {
    try {
      await memberApi.assignStaff(classId, userId);
      await refreshClasses();
      toast.success("Đã phân công vào lớp.");
      onDone();
    } catch (error) {
      const handled =
        applyFieldError(error, form, "userId", {
          INVALID_MEMBER_ROLE:
            "Tài khoản này không thể thực hiện vai trò được chọn",
          ACCESS_DENIED: "Bạn không có quyền phân công tài khoản này",
          RESOURCE_NOT_FOUND: "Không tìm thấy người dùng này",
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
      <SearchInput
        label="Tìm theo tên hoặc email"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        autoFocus
      />
      <div className="max-h-64 divide-y divide-muted overflow-y-auto rounded-lg border">
        {candidates.data?.content.map((candidate) => {
          const selected = candidate.id === selectedId;
          return (
            <button
              key={candidate.id}
              type="button"
              aria-pressed={selected}
              onClick={() =>
                form.setValue("userId", candidate.id, {
                  shouldValidate: true,
                })
              }
              className={cn(
                "flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm focus-ring",
                selected ? "bg-info" : "hover:bg-muted",
              )}
            >
              <MemberIdentity
                fullName={candidate.fullName}
                email={candidate.email}
              />
              {selected && <CheckIcon className="size-4 text-primary" />}
            </button>
          );
        })}
        <QueryState
          query={candidates}
          isEmpty={candidates.data?.content.length === 0}
          emptyMessage="Không tìm thấy tài khoản phù hợp."
        />
      </div>
    </DialogForm>
  );
}
