"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { DatePicker } from "@/components/form/date-picker";
import { DialogForm } from "@/components/form/dialog-form";
import { TextField } from "@/components/form/fields";
import { FormField } from "@/components/form/form-field";
import { SegmentedControl } from "@/components/form/segmented-control";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  applyFieldError,
  applyValidationErrors,
  getErrorMessage,
  submitForm,
  toastApiError,
  type UserSummary,
} from "@/lib/api";
import { useAuth } from "@/lib/auth/auth-provider";
import {
  GENDER_OPTIONS,
  profileSchema,
  toUpdateProfileRequest,
  type ProfileValues,
} from "@/lib/validations/auth";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserSummary;
}

export function EditProfileDialog({
  open,
  onOpenChange,
  user,
}: EditProfileDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title="Sửa hồ sơ">
        <EditProfileForm user={user} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

interface EditProfileFormProps {
  user: UserSummary;
  onDone: () => void;
}

function EditProfileForm({ user, onDone }: EditProfileFormProps) {
  const { updateProfile } = useAuth();
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user.fullName,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender ?? undefined,
      phone: user.phone ?? "",
      school: user.school ?? "",
      grade: user.grade ?? "",
      address: user.address ?? "",
    },
  });
  const { control } = form;

  const onSubmit = submitForm(form, async (values) => {
    try {
      await updateProfile(toUpdateProfileRequest(values));
      toast.success("Đã lưu thay đổi.");
      onDone();
    } catch (error) {
      const handled =
        applyFieldError(error, form, "dateOfBirth", {
          GUARDIAN_REQUIRED: getErrorMessage(error),
        }) || applyValidationErrors(error, form);
      if (!handled) toastApiError(error);
    }
  });

  return (
    <DialogForm
      onSubmit={onSubmit}
      pending={form.formState.isSubmitting}
      submitLabel="Lưu thay đổi"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          control={control}
          name="fullName"
          label="Họ và tên"
          required
          autoFocus
          autoComplete="name"
          className="sm:col-span-2"
        />

        <FormField
          control={control}
          name="dateOfBirth"
          label="Ngày sinh"
          required
        >
          {({ field, invalid }) => (
            <DatePicker
              id={field.name}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              invalid={invalid}
            />
          )}
        </FormField>

        <FormField control={control} name="gender" label="Giới tính">
          {({ field }) => (
            <SegmentedControl
              label="Giới tính"
              options={GENDER_OPTIONS}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        </FormField>

        <TextField
          control={control}
          name="phone"
          label="Số điện thoại"
          type="tel"
          autoComplete="tel"
          className="sm:col-span-2"
        />

        <TextField control={control} name="school" label="Trường" />

        <TextField control={control} name="grade" label="Lớp / Khối" />

        <TextField
          control={control}
          name="address"
          label="Địa chỉ"
          autoComplete="street-address"
          className="sm:col-span-2"
        />
      </div>
    </DialogForm>
  );
}
