"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { LockIcon, MailIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { PasswordField } from "@/components/form/fields";
import { FormField } from "@/components/form/form-field";
import { SubmitButton } from "@/components/form/submit-button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  ApiError,
  applyFieldError,
  applyValidationErrors,
  authApi,
  getErrorMessage,
  submitForm,
  toastApiError,
} from "@/lib/api";
import {
  clearResetRequest,
  RESEND_COOLDOWN_MS,
  saveResetRequest,
  useResetRequest,
  type ResetRequest,
} from "@/lib/auth/reset-flow";
import {
  resetPasswordSchema,
  verifyOtpSchema,
  type ResetPasswordValues,
  type VerifyOtpValues,
} from "@/lib/validations/auth";

import { AuthHeading } from "./auth-heading";
import { PasswordRules } from "./password-rules";

const OTP_SLOTS = [0, 1, 2, 3, 4, 5];

function useSecondsUntil(deadline: number): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= deadline) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  return Math.max(0, Math.ceil((deadline - now) / 1000));
}

export function ResetPasswordForm() {
  const router = useRouter();
  const request = useResetRequest();
  const finished = useRef(false);
  // Chỉ giữ trong state, không lưu storage hay URL. Tải lại trang thì phải xin mã mới.
  const [resetToken, setResetToken] = useState<string | null>(null);

  useEffect(() => {
    if (request === null && !finished.current)
      router.replace("/forgot-password");
  }, [request, router]);

  const leaveFlow = (destination: string) => {
    finished.current = true;
    clearResetRequest();
    router.replace(destination);
  };

  const handleFinished = () => {
    toast.success("Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.");
    leaveFlow("/login");
  };

  const handleSessionLost = (error: unknown) => {
    toastApiError(error);
    leaveFlow("/forgot-password");
  };

  if (!request) return null;

  return resetToken ? (
    <NewPasswordStep
      email={request.email}
      resetToken={resetToken}
      onFinished={handleFinished}
      onSessionLost={handleSessionLost}
    />
  ) : (
    <OtpStep request={request} onVerified={setResetToken} />
  );
}

interface OtpStepProps {
  request: ResetRequest;
  onVerified: (resetToken: string) => void;
}

function OtpStep({ request, onVerified }: OtpStepProps) {
  const { email } = request;
  const [sentAt, setSentAt] = useState(request.sentAt);
  const [resending, setResending] = useState(false);
  const secondsLeft = useSecondsUntil(sentAt + RESEND_COOLDOWN_MS);
  const form = useForm<VerifyOtpValues>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { otp: "" },
  });

  const onSubmit = submitForm(form, async ({ otp }) => {
    try {
      const { resetToken } = await authApi.verifyOtp({ email, otp });
      toast.success("Xác thực OTP thành công.");
      onVerified(resetToken);
    } catch (error) {
      if (error instanceof ApiError && error.code === "INVALID_RESET_OTP") {
        // Giữ mã cũ thì ô OTP đầy, nhập hay dán mã mới chỉ đè chữ số cuối và phí 1 trong 5 lượt.
        form.resetField("otp");
        applyFieldError(error, form, "otp", {
          INVALID_RESET_OTP: getErrorMessage(error),
        });
      } else if (!applyValidationErrors(error, form)) {
        toastApiError(error);
      }
    }
  });

  const handleResend = async () => {
    setResending(true);
    try {
      await authApi.forgotPassword(email);
      saveResetRequest(email);
      setSentAt(Date.now());
      form.resetField("otp");
      // API trả 200 cả khi email chưa đăng ký hoặc bị giới hạn nên không được khẳng định là đã gửi.
      toast.info("Nếu email đã đăng ký, mã OTP mới sẽ được gửi vào hộp thư.");
    } catch (error) {
      toastApiError(error);
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <AuthHeading icon={MailIcon} title="Nhập mã OTP" />
      <form noValidate onSubmit={onSubmit} className="space-y-5">
        <FormField
          control={form.control}
          name="otp"
          label="Mã OTP"
          className="gap-2"
        >
          {({ field, invalid }) => (
            <InputOTP
              {...field}
              id={field.name}
              maxLength={6}
              pattern={REGEXP_ONLY_DIGITS}
              autoComplete="one-time-code"
              containerClassName="w-full"
            >
              <InputOTPGroup className="w-full max-w-88">
                {OTP_SLOTS.map((index) => (
                  <InputOTPSlot
                    key={index}
                    index={index}
                    aria-invalid={invalid}
                    className="min-w-0 flex-1 text-[22px] leading-7"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          )}
        </FormField>

        <div className="flex items-start justify-between text-xs">
          <span className="text-muted-foreground">Không nhận được mã?</span>
          {secondsLeft > 0 ? (
            <span className="font-semibold text-secondary-text">
              Gửi lại sau {secondsLeft} giây
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="font-semibold text-primary hover:underline disabled:opacity-50"
            >
              Gửi lại mã
            </button>
          )}
        </div>

        <SubmitButton pending={form.formState.isSubmitting}>
          Xác thực OTP
        </SubmitButton>
      </form>
    </>
  );
}

interface NewPasswordStepProps {
  email: string;
  resetToken: string;
  onFinished: () => void;
  onSessionLost: (error: unknown) => void;
}

function NewPasswordStep({
  email,
  resetToken,
  onFinished,
  onSessionLost,
}: NewPasswordStepProps) {
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "" },
  });
  const newPassword = useWatch({ control: form.control, name: "newPassword" });

  const onSubmit = submitForm(form, async ({ newPassword }) => {
    try {
      await authApi.resetPassword({ email, resetToken, newPassword });
      onFinished();
    } catch (error) {
      const code = error instanceof ApiError ? error.code : undefined;
      if (
        code === "INVALID_RESET_TOKEN" ||
        code === "PASSWORD_CHANGE_UNAVAILABLE"
      ) {
        onSessionLost(error);
      } else if (!applyValidationErrors(error, form)) {
        toastApiError(error);
      }
    }
  });

  return (
    <>
      <AuthHeading icon={LockIcon} title="Đặt mật khẩu mới" />
      <form noValidate onSubmit={onSubmit} className="space-y-5">
        <PasswordField
          control={form.control}
          name="newPassword"
          label="Mật khẩu mới"
          required
          autoFocus
          autoComplete="new-password"
          hint={<PasswordRules value={newPassword} compact />}
        />

        <SubmitButton pending={form.formState.isSubmitting}>
          Đặt lại mật khẩu
        </SubmitButton>

        <p className="text-center text-xs text-muted-foreground">
          Sau khi đổi, bạn sẽ được đăng xuất khỏi mọi thiết bị.
        </p>
      </form>
    </>
  );
}
