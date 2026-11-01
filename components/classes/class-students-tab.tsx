"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  ArrowDownWideNarrowIcon,
  CopyIcon,
  ListFilterIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Can } from "@/components/auth/guards";
import { DialogForm } from "@/components/form/dialog-form";
import { EmailField } from "@/components/form/fields";
import { SelectMenu } from "@/components/form/select-menu";
import { ConfirmDialog } from "@/components/layout/confirm-dialog";
import { EmptyState } from "@/components/layout/empty-state";
import { Pagination } from "@/components/layout/pagination";
import { QueryState } from "@/components/layout/query-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataRow, DataTable } from "@/components/ui/data-table";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/status-badge";
import { useRefreshClasses } from "@/hooks/use-classroom";
import { usePagination } from "@/hooks/use-pagination";
import {
  applyFieldError,
  applyValidationErrors,
  memberApi,
  submitForm,
  toastApiError,
  type ClassMemberResponse,
  type ClassMemberStatus,
} from "@/lib/api";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { formatDate } from "@/lib/format";
import {
  addStudentSchema,
  type AddStudentValues,
} from "@/lib/validations/classes";

import { copyJoinCode } from "./join-code";
import { MemberIdentity } from "./member-identity";

type StudentFilter = "ACTIVE" | "ALL";

const FILTER_OPTIONS: { value: StudentFilter; label: string }[] = [
  { value: "ACTIVE", label: "Đang học" },
  { value: "ALL", label: "Tất cả" },
];

const SORT_OPTIONS = [
  { value: "user.fullName,asc", label: "Tên A → Z" },
  { value: "user.fullName,desc", label: "Tên Z → A" },
  { value: "joinedAt,desc", label: "Mới tham gia" },
];

const INACTIVE_LABELS: Record<Exclude<ClassMemberStatus, "ACTIVE">, string> = {
  PENDING: "Chờ duyệt",
  INACTIVE: "Tạm nghỉ",
  REMOVED: "Đã xóa",
};

interface ClassStudentsTabProps {
  classId: number;
  /** false khi lớp đã lưu trữ: vẫn xem được nhưng khoá mọi thao tác ghi. */
  editable: boolean;
  joinCode: string | null;
}

export function ClassStudentsTab({
  classId,
  editable,
  joinCode,
}: ClassStudentsTabProps) {
  const refreshClasses = useRefreshClasses();
  const [filter, setFilter] = useState<StudentFilter>("ALL");
  const [sort, setSort] = useState(SORT_OPTIONS[0].value);
  const { page, size, setPage, setSize } = usePagination();
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<ClassMemberResponse | null>(null);

  const students = useQuery({
    queryKey: ["classes", classId, "students", { filter, sort, page, size }],
    queryFn: () =>
      memberApi.list(classId, {
        role: "USER",
        status: filter === "ACTIVE" ? "ACTIVE" : undefined,
        sort,
        page,
        size,
      }),
    placeholderData: keepPreviousData,
  });

  const handleFilterChange = (next: StudentFilter) => {
    setFilter(next);
    setPage(0);
  };

  const handleSortChange = (next: string) => {
    setSort(next);
    setPage(0);
  };

  const handleRemove = async () => {
    if (!removing) return;
    await memberApi.removeStudent(classId, removing.userId);
    if (students.data?.content.length === 1 && page > 0) setPage(page - 1);
    await refreshClasses();
    toast.success("Đã xóa học sinh khỏi lớp.");
  };

  // Chỉ lọc "Tất cả" mới chắc lớp không có ai: "Đang học" rỗng vẫn có thể còn học sinh đã xóa.
  const noStudents =
    filter === "ALL" &&
    students.data?.totalElements === 0 &&
    !students.isPlaceholderData;
  const inviteCode = editable ? joinCode : null;

  if (noStudents) {
    return (
      <>
        <Card>
          <EmptyState
            icon={UsersIcon}
            title="Lớp chưa có học sinh"
            description={
              inviteCode && (
                <>
                  Gửi mã{" "}
                  <span className="font-semibold text-foreground">
                    {inviteCode}
                  </span>{" "}
                  cho học sinh để tham gia.
                </>
              )
            }
            action={
              editable && (
                <>
                  {inviteCode && (
                    <Button
                      variant="outline"
                      onClick={() => copyJoinCode(inviteCode)}
                    >
                      <CopyIcon />
                      Sao chép mã
                    </Button>
                  )}
                  <Can permission={PERMISSIONS.STUDENT_MANAGE}>
                    <Button onClick={() => setAdding(true)}>
                      <UserPlusIcon />
                      Thêm học sinh
                    </Button>
                  </Can>
                </>
              )
            }
          />
        </Card>
        <AddStudentDialog
          classId={classId}
          open={adding}
          onOpenChange={setAdding}
        />
      </>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SelectMenu
          label="Lọc học sinh"
          icon={ListFilterIcon}
          size="sm"
          align="start"
          options={FILTER_OPTIONS}
          value={filter}
          onChange={handleFilterChange}
        />
        <div className="flex flex-wrap items-center gap-2">
          <SelectMenu
            label="Sắp xếp"
            icon={ArrowDownWideNarrowIcon}
            size="sm"
            options={SORT_OPTIONS}
            value={sort}
            onChange={handleSortChange}
          />
          <Can permission={PERMISSIONS.STUDENT_MANAGE}>
            <Button
              size="sm"
              disabled={!editable}
              onClick={() => setAdding(true)}
            >
              <UserPlusIcon />
              Thêm học sinh
            </Button>
          </Can>
        </div>
      </div>

      <Card className="overflow-hidden">
        <DataTable
          head={
            <>
              <th className="pr-4 pl-5">Họ và tên</th>
              <th className="pr-4">Email</th>
              <th className="w-34">Tham gia</th>
              <th className="w-37.5" />
            </>
          }
        >
          {students.data?.content.map((student) => (
            <DataRow key={student.userId}>
              <td className="pr-4 pl-5">
                <MemberIdentity fullName={student.fullName} />
              </td>
              <td className="truncate pr-4 text-muted-foreground">
                {student.email ?? "—"}
              </td>
              <td className="text-muted-foreground">
                {formatDate(student.joinedAt)}
              </td>
              <td className="pr-5">
                {student.status === "ACTIVE" ? (
                  <Can permission={PERMISSIONS.STUDENT_MANAGE}>
                    <Button
                      variant="destructive-outline"
                      size="sm"
                      disabled={!editable}
                      onClick={() => setRemoving(student)}
                    >
                      Xóa khỏi lớp
                    </Button>
                  </Can>
                ) : (
                  <StatusBadge tone="neutral">
                    {INACTIVE_LABELS[student.status]}
                  </StatusBadge>
                )}
              </td>
            </DataRow>
          ))}
        </DataTable>
        <QueryState
          query={students}
          isEmpty={students.data?.content.length === 0}
          emptyMessage="Chưa có học sinh nào."
        />
        {students.data && (
          <Pagination
            data={students.data}
            onPageChange={setPage}
            onPageSizeChange={setSize}
          />
        )}
      </Card>

      <AddStudentDialog
        classId={classId}
        open={adding}
        onOpenChange={setAdding}
      />
      <ConfirmDialog
        open={removing !== null}
        onOpenChange={(open) => !open && setRemoving(null)}
        title={`Xóa “${removing?.fullName}” khỏi lớp?`}
        description="Học sinh sẽ không còn thấy lớp này."
        confirmLabel="Xóa khỏi lớp"
        destructive
        onConfirm={handleRemove}
      />
    </>
  );
}

interface AddStudentDialogProps {
  classId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function AddStudentDialog({
  classId,
  open,
  onOpenChange,
}: AddStudentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title="Thêm học sinh">
        <AddStudentForm classId={classId} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function AddStudentForm({
  classId,
  onDone,
}: {
  classId: number;
  onDone: () => void;
}) {
  const refreshClasses = useRefreshClasses();
  const form = useForm<AddStudentValues>({
    resolver: zodResolver(addStudentSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = submitForm(form, async ({ email }) => {
    try {
      await memberApi.addStudent(classId, email);
      await refreshClasses();
      toast.success("Đã thêm học sinh vào lớp.");
      onDone();
    } catch (error) {
      const handled =
        applyFieldError(error, form, "email", {
          RESOURCE_NOT_FOUND: "Không tìm thấy tài khoản với email này",
          INVALID_MEMBER_ROLE: "Tài khoản này không phải học sinh",
          MEMBERSHIP_CONFLICT: "Học sinh này đã ở trong lớp",
        }) || applyValidationErrors(error, form);
      if (!handled) toastApiError(error);
    }
  });

  return (
    <DialogForm
      onSubmit={onSubmit}
      pending={form.formState.isSubmitting}
      submitLabel="Thêm vào lớp"
    >
      <EmailField
        control={form.control}
        name="email"
        label="Email học sinh"
        required
        autoFocus
        autoComplete="off"
      />
    </DialogForm>
  );
}
