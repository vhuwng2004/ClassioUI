"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArchiveIcon,
  ArrowLeftIcon,
  CheckIcon,
  PencilIcon,
  RotateCcwIcon,
  TriangleAlertIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { Can } from "@/components/auth/guards";
import { QueryState } from "@/components/layout/query-state";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { JoinCodeCard } from "./join-code-card";

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
          <AlertDescription>
            Sau khi được duyệt mới có thể sửa thông tin, thêm thành viên và nhận
            học sinh tham gia.
          </AlertDescription>
        </Alert>
      )}

      {status === "ARCHIVED" && (
        <Alert variant="warning">
          <TriangleAlertIcon />
          <AlertTitle>Lớp đã được lưu trữ — chỉ xem.</AlertTitle>
          <AlertDescription>
            Mọi thao tác ghi bị khóa.
            {can(PERMISSIONS.CLASS_RESTORE, classroom) &&
              " Bạn có thể khôi phục lớp."}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="min-w-0 text-2xl leading-8 font-bold tracking-[-0.3px] break-words">
              {name}
            </h1>
            <ClassStatusBadge status={status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {description ?? "Chưa có mô tả"}
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Can permission={PERMISSIONS.CLASS_EDIT} classroom={classroom}>
              <Button variant="outline" onClick={() => setDialog("edit")}>
                <PencilIcon />
                Sửa thông tin
              </Button>
            </Can>
            <Can permission={PERMISSIONS.CLASS_ARCHIVE} classroom={classroom}>
              <Button
                variant="destructive-outline"
                onClick={() => setDialog("archive")}
              >
                <ArchiveIcon />
                Lưu trữ
              </Button>
            </Can>
            <Can permission={PERMISSIONS.CLASS_APPROVE} classroom={classroom}>
              <Button
                disabled={approve.isPending}
                onClick={() => approve.mutate()}
              >
                <CheckIcon />
                Duyệt lớp
              </Button>
            </Can>
            <Can permission={PERMISSIONS.CLASS_RESTORE} classroom={classroom}>
              <Button
                disabled={restore.isPending}
                onClick={() => restore.mutate()}
              >
                <RotateCcwIcon />
                Khôi phục lớp
              </Button>
            </Can>
          </div>
        </div>
        {joinCode && (
          <JoinCodeCard
            classId={id}
            code={joinCode}
            canRotate={can(PERMISSIONS.JOIN_CODE_ROTATE, classroom)}
          />
        )}
      </div>

      <Tabs defaultValue="students">
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
          <ClassStudentsTab classId={id} editable={active} />
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
