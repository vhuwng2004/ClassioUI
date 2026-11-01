"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { DialogForm } from "@/components/form/dialog-form";
import { TextareaField, TextField } from "@/components/form/fields";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useRefreshClasses } from "@/hooks/use-classroom";
import {
  applyFieldError,
  applyValidationErrors,
  classApi,
  submitForm,
  toastApiError,
  type ClassroomResponse,
} from "@/lib/api";
import {
  CLASS_DESCRIPTION_MAX_LENGTH,
  classSchema,
  type ClassValues,
} from "@/lib/validations/classes";

interface ClassFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Có `classroom` là sửa lớp, không có là tạo lớp mới. */
  classroom?: ClassroomResponse;
}

export function ClassFormDialog({
  open,
  onOpenChange,
  classroom,
}: ClassFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={classroom ? "Sửa thông tin lớp" : "Tạo lớp mới"}>
        <ClassForm classroom={classroom} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

interface ClassFormProps {
  classroom?: ClassroomResponse;
  onDone: () => void;
}

function ClassForm({ classroom, onDone }: ClassFormProps) {
  const router = useRouter();
  const refreshClasses = useRefreshClasses();
  const form = useForm<ClassValues>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: classroom?.name ?? "",
      description: classroom?.description ?? "",
    },
  });
  const { control } = form;
  const description = useWatch({ control, name: "description" });

  const onSubmit = submitForm(form, async ({ name, description }) => {
    try {
      if (classroom) {
        // Mô tả rỗng nghĩa là xoá mô tả. Tên giữ nguyên thì không gửi lại.
        await classApi.update(classroom.id, {
          name: name === classroom.name ? undefined : name,
          description,
        });
        toast.success("Đã lưu thay đổi.");
      } else {
        const created = await classApi.create({
          name,
          description: description || undefined,
        });
        toast.success(
          created.status === "PENDING"
            ? "Đã tạo lớp, đang chờ quản trị viên duyệt."
            : "Đã tạo lớp mới.",
        );
        router.push(`/staff/classes/${created.id}`);
      }
      await refreshClasses();
      onDone();
    } catch (error) {
      const handled =
        applyFieldError(error, form, "name", {
          CLASSROOM_NAME_ALREADY_USED: "Tên lớp đã tồn tại",
        }) || applyValidationErrors(error, form);
      if (!handled) toastApiError(error);
    }
  });

  return (
    <DialogForm
      onSubmit={onSubmit}
      pending={form.formState.isSubmitting}
      submitLabel={classroom ? "Lưu thay đổi" : "Tạo lớp"}
    >
      <TextField
        control={control}
        name="name"
        label="Tên lớp"
        required
        autoFocus
        maxLength={150}
      />

      <TextareaField
        control={control}
        name="description"
        label="Mô tả"
        placeholder="Mô tả ngắn về lớp học (không bắt buộc)"
        hint={
          <p className="text-xs text-muted-foreground">
            {classroom
              ? "Xóa trống để gỡ mô tả"
              : `${description.length} / ${CLASS_DESCRIPTION_MAX_LENGTH} ký tự`}
          </p>
        }
      />
    </DialogForm>
  );
}
