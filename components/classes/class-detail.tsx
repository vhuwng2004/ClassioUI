"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArchiveIcon,
  ArrowLeftIcon,
  CheckIcon,
  EllipsisIcon,
  PencilIcon,
  RotateCcwIcon,
  TriangleAlertIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { Can } from "@/components/auth/guards";
import { QueryState } from "@/components/layout/query-state";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useClassroom, useRefreshClasses } from "@/hooks/use-classroom";
import {
  classApi,
  memberApi,
  toastApiError,
  type ClassroomResponse,
} from "@/lib/api";
import { useAuth } from "@/lib/auth/auth-provider";
import { PERMISSIONS } from "@/lib/auth/permissions";

import { ArchiveClassDialog } from "./archive-class-dialog";
import { ClassFormDialog } from "./class-form-dialog";
import { ClassRequestsTab } from "./class-requests-tab";
import { ClassStaffTab, useClassStaff } from "./class-staff-tab";
import { ClassStatusBadge } from "./class-status-badge";
import { ClassStudentsTab } from "./class-students-tab";
import { JoinCodePanel } from "./join-code-panel";

export function ClassDetail({ classId }: { classId: number }) {
  const classroom = useClassroom(classId);

  return (
    <div className="space-y-5">
      <Link
        href="/staff"
        className="flex w-fit items-center gap-2 rounded text-[13px] leading-4.5 font-medium text-secondary-text focus-ring hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        Tất cả lớp học
      </Link>

      {classroom.data ? (
        <ClassContent classroom={classroom.data} />
      ) : (
        <Card>
          <QueryState query={classroom} isEmpty={false} emptyMessage="" />
        </Card>
      )}
    </div>
  );
}

function ClassContent({ classroom }: { classroom: ClassroomResponse }) {
  const { can } = useAuth();
  const { id, name, description, status, joinCode } = classroom;
  const active = status === "ACTIVE";
  const canReviewRequests = can(PERMISSIONS.JOIN_REQUEST_REVIEW);
  const canEdit = can(PERMISSIONS.CLASS_EDIT, classroom);
  const canArchive = can(PERMISSIONS.CLASS_ARCHIVE, classroom);
  const refreshClasses = useRefreshClasses();
  const [dialog, setDialog] = useState<"edit" | "archive" | null>(null);

  const studentCount = useQuery({
    queryKey: ["classes", id, "students", "count"],
    queryFn: () =>
      memberApi.list(id, { role: "USER", status: "ACTIVE", size: 1 }),
  });
  const requestCount = useQuery({
    queryKey: ["classes", id, "join-requests", "count"],
    queryFn: () => memberApi.joinRequests(id, { size: 1 }),
    enabled: canReviewRequests,
  });
  const teachers = useClassStaff(id, "TEACHER");
  const assistants = useClassStaff(id, "ASSISTANT");
  const staffCount =
    teachers.data && assistants.data
      ? teachers.data.totalElements + assistants.data.totalElements
      : undefined;

  const approve = useMutation({
    mutationFn: () => classApi.approve(id),
    onSuccess: async () => {
      await refreshClasses();
      toast.success("Đã duyệt lớp.");
    },
    onError: toastApiError,
  });

  const restore = useMutation({
    mutationFn: () => classApi.restore(id),
    onSuccess: async () => {
      await refreshClasses();
      toast.success("Đã khôi phục lớp.");
    },
    onError: toastApiError,
  });

  return (
    <>
      {status === "PENDING" && (
        <Alert variant="warning">
          <TriangleAlertIcon />
          <AlertTitle>Lớp đang chờ quản trị viên duyệt.</AlertTitle>
        </Alert>
      )}

      {status === "ARCHIVED" && (
        <Alert variant="warning">
          <TriangleAlertIcon />
          <AlertTitle>Lớp đã được lưu trữ — chỉ xem.</AlertTitle>
        </Alert>
      )}

      {/* Tỉ lệ 2/8 từ `xl`; hẹp hơn thì cột trái quá chật nên phần thông tin nằm trên bảng. */}
      <div className="grid gap-6 xl:grid-cols-[minmax(14rem,1fr)_minmax(0,4fr)] xl:items-start">
        <Card className="flex flex-col gap-4 p-3.5 sm:flex-row sm:items-start sm:justify-between sm:gap-6 xl:flex-col xl:items-stretch xl:gap-4">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h1 className="min-w-0 text-xl leading-7 font-bold tracking-[-0.3px] break-words">
                {name}
              </h1>
              {(canEdit || canArchive) && (
                // modal={false}: menu đóng lại trước khi mở hộp thoại, tránh khoá con trỏ.
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Thao tác với lớp ${name}`}
                      className="text-muted-foreground"
                    >
                      <EllipsisIcon />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    {canEdit && (
                      <DropdownMenuItem onSelect={() => setDialog("edit")}>
                        <PencilIcon />
                        Sửa thông tin
                      </DropdownMenuItem>
                    )}
                    {canArchive && (
                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={() => setDialog("archive")}
                      >
                        <ArchiveIcon />
                        Lưu trữ
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            <ClassStatusBadge status={status} />
            <p className="text-sm break-words text-muted-foreground">
              {description ?? "Chưa có mô tả"}
            </p>
            <Can permission={PERMISSIONS.CLASS_APPROVE} classroom={classroom}>
              <Button
                size="sm"
                disabled={approve.isPending}
                onClick={() => approve.mutate()}
              >
                <CheckIcon />
                Duyệt lớp
              </Button>
            </Can>
            <Can permission={PERMISSIONS.CLASS_RESTORE} classroom={classroom}>
              <Button
                size="sm"
                disabled={restore.isPending}
                onClick={() => restore.mutate()}
              >
                <RotateCcwIcon />
                Khôi phục lớp
              </Button>
            </Can>
          </div>
          {joinCode && (
            <JoinCodePanel
              classId={id}
              code={joinCode}
              canRotate={can(PERMISSIONS.JOIN_CODE_ROTATE, classroom)}
            />
          )}
        </Card>

        <Tabs defaultValue="students" className="min-w-0">
          <TabsList>
            <TabsTrigger
              value="students"
              count={studentCount.data?.totalElements}
            >
              Học sinh
            </TabsTrigger>
            {canReviewRequests && (
              <TabsTrigger
                value="requests"
                count={requestCount.data?.totalElements}
              >
                Yêu cầu tham gia
              </TabsTrigger>
            )}
            <TabsTrigger value="staff" count={staffCount}>
              Giáo viên &amp; trợ giảng
            </TabsTrigger>
          </TabsList>
          <TabsContent value="students">
            <ClassStudentsTab
              classId={id}
              editable={active}
              joinCode={joinCode}
            />
          </TabsContent>
          {canReviewRequests && (
            <TabsContent value="requests">
              <ClassRequestsTab classId={id} editable={active} />
            </TabsContent>
          )}
          <TabsContent value="staff">
            <ClassStaffTab classId={id} editable={active} />
          </TabsContent>
        </Tabs>
      </div>

      <ClassFormDialog
        open={dialog === "edit"}
        onOpenChange={(open) => !open && setDialog(null)}
        classroom={classroom}
      />
      <ArchiveClassDialog
        open={dialog === "archive"}
        onOpenChange={(open) => !open && setDialog(null)}
        classroom={classroom}
      />
    </>
  );
}
