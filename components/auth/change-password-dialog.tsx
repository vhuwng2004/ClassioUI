"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { DialogForm } from "@/components/form/dialog-form";
import { PasswordField } from "@/components/form/fields";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  applyFieldError,
  applyValidationErrors,
  getErrorMessage,
  submitForm,
  toastApiError,
} from "@/lib/api";
import { useAuth } from "@/lib/auth/auth-provider";
import {
  changePasswordSchema,
  temporaryPasswordChangeSchema,
  type ChangePasswordValues,
} from "@/lib/validations/auth";

import { PasswordRules } from "./password-rules";

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePasswordDialog({
  open,
  onOpenChange,
}: ChangePasswordDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="Đổi mật khẩu"
        description="Sau khi đổi, bạn sẽ được đăng xuất khỏi mọi thiết bị."
      >
        <ChangePasswordForm />
      </DialogContent>
    </Dialog>
  );
}

/**
 * Tài khoản đang dùng mật khẩu tạm: không đóng được, chỉ có đổi mật khẩu hoặc đăng xuất.
 * `onOpenChange` bỏ trống nên Esc và bấm ra ngoài không có tác dụng.
 */
export function RequiredPasswordChangeDialog() {
  return (
    <Dialog open>
      <DialogContent
        title="Đặt mật khẩu mới"
        description="Tài khoản của bạn đang dùng mật khẩu tạm. Hãy đặt mật khẩu mới để tiếp tục, sau đó đăng nhập lại."
        showClose={false}
      >
        <ChangePasswordForm temporary />
      </DialogContent>
    </Dialog>
  );
}

function SignOutButton() {
  const { logout } = useAuth();
  const [pending, setPending] = useState(false);

  const handleLogout = async () => {
    setPending(true);
    try {
      await logout();
    } catch (error) {
      toastApiError(error);
      setPending(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      disabled={pending}
      onClick={handleLogout}
    >
      Đăng xuất
    </Button>
  );
}

function ChangePasswordForm({ temporary = false }: { temporary?: boolean }) {
  const { changePassword } = useAuth();
  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(
      temporary ? temporaryPasswordChangeSchema : changePasswordSchema,
    ),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  const { control } = form;
  const newPassword = useWatch({ control, name: "newPassword" });

  const onSubmit = submitForm(
    form,
    async ({ currentPassword, newPassword }) => {
      try {
        // Thành công thì phiên đóng lại, RequireAuth chuyển về trang đăng nhập.
        await changePassword({ currentPassword, newPassword });
        toast.success("Đổi mật khẩu thành công. Vui lòng đăng nhập lại.");
      } catch (error) {
        const handled =
          applyFieldError(error, form, "currentPassword", {
            INVALID_CURRENT_PASSWORD: getErrorMessage(error),
          }) || applyValidationErrors(error, form);
        if (!handled) toastApiError(error);
      }
    },
  );

  return (
    <DialogForm
      onSubmit={onSubmit}
      pending={form.formState.isSubmitting}
      submitLabel="Đổi mật khẩu"
      secondaryAction={temporary ? <SignOutButton /> : undefined}
    >
      <PasswordField
        control={control}
        name="currentPassword"
        label={temporary ? "Mật khẩu tạm" : "Mật khẩu hiện tại"}
        required
        autoFocus
        autoComplete="current-password"
      />
      <PasswordField
        control={control}
        name="newPassword"
        label="Mật khẩu mới"
        required
        autoComplete="new-password"
        hint={<PasswordRules value={newPassword} compact />}
      />
      <PasswordField
        control={control}
        name="confirmPassword"
        label="Nhập lại mật khẩu mới"
        required
        autoComplete="new-password"
      />
    </DialogForm>
  );
}
