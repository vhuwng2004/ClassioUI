"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { InfoIcon, PlusIcon } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { GuardianCard } from "@/components/auth/guardian-card";
import { DatePicker } from "@/components/form/date-picker";
import { DialogForm } from "@/components/form/dialog-form";
import { EmailField, TextField } from "@/components/form/fields";
import { FormField } from "@/components/form/form-field";
import { SegmentedControl } from "@/components/form/segmented-control";
import { SelectMenu } from "@/components/form/select-menu";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useRefreshUsers } from "@/hooks/use-users";
import {
  ApiError,
  applyFieldError,
  applyValidationErrors,
  submitForm,
  toastApiError,
  userApi,
  type CreatedUserResponse,
  type UserRole,
} from "@/lib/api";
import { useAuth } from "@/lib/auth/auth-provider";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { ROLE_LABELS } from "@/lib/auth/roles";
import {
  emptyGuardian,
  GENDER_OPTIONS,
  MAX_GUARDIANS,
} from "@/lib/validations/auth";
import {
  createUserSchema,
  guardianRequired,
  toCreateUserRequest,
  type CreateUserValues,
} from "@/lib/validations/users";

const BASIC_ROLES: UserRole[] = ["USER", "TEACHER", "ASSISTANT"];
const ADMIN_ROLES: UserRole[] = ["ADMIN", "SP_ADMIN"];

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (created: CreatedUserResponse) => void;
}

export function CreateUserDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateUserDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="Tạo tài khoản"
        description="Tài khoản dùng mật khẩu mặc định, người dùng phải đổi ở lần đăng nhập đầu tiên."
        className="max-w-160"
      >
        <CreateUserForm
          onDone={(created) => {
            onOpenChange(false);
            onCreated(created);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

function CreateUserForm({
  onDone,
}: {
  onDone: (created: CreatedUserResponse) => void;
}) {
  const { can } = useAuth();
  const refreshUsers = useRefreshUsers();
  const form = useForm<CreateUserValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      role: "USER",
      fullName: "",
      dateOfBirth: "",
      gender: undefined,
      phone: "",
      email: "",
      school: "",
      grade: "",
      address: "",
      guardians: [],
    },
  });
  const { control } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "guardians",
  });
  const role = useWatch({ control, name: "role" });
  const dateOfBirth = useWatch({ control, name: "dateOfBirth" });
  const showGuardians = guardianRequired({ role, dateOfBirth });

  useEffect(() => {
    if (showGuardians && fields.length === 0)
      append(emptyGuardian, { shouldFocus: false });
  }, [append, fields.length, showGuardians]);

  const roleOptions = [
    ...BASIC_ROLES,
    ...(can(PERMISSIONS.USER_MANAGE_ADMIN) ? ADMIN_ROLES : []),
  ].map((value) => ({ value, label: ROLE_LABELS[value] }));

  const onSubmit = submitForm(form, async (values) => {
    try {
      const created = await userApi.create(toCreateUserRequest(values));
      await refreshUsers();
      toast.success("Đã tạo tài khoản.");
      onDone(created);
    } catch (error) {
      const handled =
        applyFieldError(error, form, "email", {
          EMAIL_ALREADY_REGISTERED: "Email đã được đăng ký",
        }) || applyValidationErrors(error, form);
      if (handled) return;
      // Người giám hộ đã có sẵn trong form khi dưới 18 tuổi, lỗi này chỉ xảy ra khi lệch ngày với server.
      if (error instanceof ApiError && error.code === "GUARDIAN_REQUIRED") {
        form.setError("dateOfBirth", { type: "server" });
      }
      toastApiError(error);
    }
  });

  return (
    <DialogForm
      onSubmit={onSubmit}
      pending={form.formState.isSubmitting}
      submitLabel="Tạo tài khoản"
    >
      <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
        <FormField
          control={control}
          name="role"
          label="Vai trò"
          required
          className="sm:col-span-2"
        >
          {({ field }) => (
            <div>
              <SelectMenu
                label="Vai trò"
                align="start"
                options={roleOptions}
                value={field.value}
                onChange={field.onChange}
              />
            </div>
          )}
        </FormField>

        <TextField
          control={control}
          name="fullName"
          label="Họ và tên"
          required
          autoFocus
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

        <EmailField control={control} name="email" required />

        <TextField
          control={control}
          name="phone"
          label="Số điện thoại"
          type="tel"
        />

        <FormField
          control={control}
          name="gender"
          label="Giới tính"
          className="sm:col-span-2"
        >
          {({ field }) => (
            <SegmentedControl
              label="Giới tính"
              options={GENDER_OPTIONS}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        </FormField>

        <TextField control={control} name="school" label="Trường" />

        <TextField control={control} name="grade" label="Lớp / Khối" />

        <TextField
          control={control}
          name="address"
          label="Địa chỉ"
          className="sm:col-span-2"
        />

        {showGuardians && (
          <div className="space-y-4 sm:col-span-2">
            <Alert variant="info">
              <InfoIcon />
              <AlertTitle>Học sinh dưới 18 tuổi.</AlertTitle>
              <AlertDescription>
                Cần khai báo ít nhất một người giám hộ.
              </AlertDescription>
            </Alert>
            {fields.map((guardian, index) => (
              <GuardianCard
                key={guardian.id}
                control={control}
                index={index}
                onRemove={fields.length > 1 ? () => remove(index) : undefined}
              />
            ))}
            {fields.length < MAX_GUARDIANS && (
              <Button
                type="button"
                variant="outline"
                onClick={() => append(emptyGuardian)}
              >
                <PlusIcon />
                Thêm người giám hộ
              </Button>
            )}
          </div>
        )}
      </div>
    </DialogForm>
  );
}
