"use client";

import { TriangleAlertIcon } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/layout/confirm-dialog";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { useRefreshClasses } from "@/hooks/use-classroom";
import { classApi, type ClassroomResponse } from "@/lib/api";
import { useAuth } from "@/lib/auth/auth-provider";
import { PERMISSIONS } from "@/lib/auth/permissions";

interface ArchiveClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classroom: ClassroomResponse;
}

export function ArchiveClassDialog({
  open,
  onOpenChange,
  classroom,
}: ArchiveClassDialogProps) {
  const { can } = useAuth();
  const refreshClasses = useRefreshClasses();

  const handleArchive = async () => {
    await classApi.archive(classroom.id);
    await refreshClasses();
    toast.success("Đã lưu trữ lớp.");
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Lưu trữ lớp “${classroom.name}”?`}
      description="Lớp sẽ chuyển sang chế độ chỉ xem."
      confirmLabel="Lưu trữ lớp"
      destructive
      onConfirm={handleArchive}
    >
      {!can(PERMISSIONS.CLASS_RESTORE) && (
        <Alert variant="warning">
          <TriangleAlertIcon />
          <AlertTitle>Giáo viên không thể khôi phục lớp đã lưu trữ.</AlertTitle>
        </Alert>
      )}
    </ConfirmDialog>
  );
}
