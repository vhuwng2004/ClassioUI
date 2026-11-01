"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { InfoIcon, PlusIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  useFieldArray,
  useForm,
  useWatch,
  type Control,
} from "react-hook-form";
import { toast } from "sonner";

import { DatePicker } from "@/components/form/date-picker";
import { EmailField, PasswordField, TextField } from "@/components/form/fields";
import { FormField } from "@/components/form/form-field";
import { SegmentedControl } from "@/components/form/segmented-control";
import { SubmitButton } from "@/components/form/submit-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ApiError,
  applyFieldError,
  applyValidationErrors,
  getErrorMessage,
  submitForm,
  toastApiError,
  toastFormError,
} from "@/lib/api";
import { useAuth } from "@/lib/auth/auth-provider";
import {
  emptyGuardian,
  GENDER_OPTIONS,
  isUnder18,
  MAX_GUARDIANS,
  passwordRules,
  registerSchema,
  toRegisterRequest,
  type RegisterValues,
} from "@/lib/validations/auth";

import { PasswordRules } from "./password-rules";

export function RegisterForm() {
  const { register } = useAuth();
  const [guardianRequired, setGuardianRequired] = useState(false);
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      dateOfBirth: "",
      phone: "",
      email: "",
      password: "",
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
  const dateOfBirth = useWatch({ control, name: "dateOfBirth" });
  const password = useWatch({ control, name: "password" });
  const under18 = isUnder18(dateOfBirth);
  const showGuardians = under18 || guardianRequired;
  // Ô trống hoặc lỗi từ server không hiện trên checklist nên vẫn cần viền đỏ.
  const rulesShowFailure =
    Boolean(password) && passwordRules.some((rule) => !rule.test(password));

  useEffect(() => {
    if (showGuardians && fields.length === 0)
      append(emptyGuardian, { shouldFocus: false });
  }, [append, fields.length, showGuardians]);

  const onSubmit = submitForm(form, async (values) => {
    try {
      await register(toRegisterRequest(values, showGuardians));
      toast.success("Đăng ký thành công.");
    } catch (error) {
      if (error instanceof ApiError && error.code === "GUARDIAN_REQUIRED") {
        setGuardianRequired(true);
        toastFormError(getErrorMessage(error));
        return;
      }
      const handled =
        applyFieldError(error, form, "email", {
          EMAIL_ALREADY_REGISTERED: getErrorMessage(error),
        }) || applyValidationErrors(error, form);
      if (!handled) toastApiError(error);
    }
  });

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className="grid gap-x-4 gap-y-5 sm:grid-cols-2"
    >
      <TextField
        control={control}
        name="fullName"
        label="Họ và tên"
        required
        autoComplete="name"
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
      />

      <EmailField
        control={control}
        name="email"
        required
        className="sm:col-span-2"
      />

      <PasswordField
        control={control}
        name="password"
        label="Mật khẩu"
        required
        autoComplete="new-password"
        quietInvalid={rulesShowFailure}
        hint={<PasswordRules value={password} />}
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

      {showGuardians && (
        <div className="space-y-5 sm:col-span-2">
          {under18 && (
            <Alert variant="info">
              <InfoIcon />
              <AlertTitle>Bạn dưới 18 tuổi.</AlertTitle>
              <AlertDescription>
                Cần khai báo ít nhất một người giám hộ để hoàn tất đăng ký.
              </AlertDescription>
            </Alert>
          )}
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

      <div className="space-y-5 sm:col-span-2">
        <SubmitButton pending={form.formState.isSubmitting}>
          Đăng ký
        </SubmitButton>
        <p className="flex justify-center gap-2 text-sm text-muted-foreground">
          Đã có tài khoản?
          <Link
            href="/login"
            className="font-semibold text-primary hover:underline"
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </form>
  );
}

interface GuardianCardProps {
  control: Control<RegisterValues>;
  index: number;
  onRemove?: () => void;
}

function GuardianCard({ control, index, onRemove }: GuardianCardProps) {
  return (
    <Card className="bg-surface p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold">Người giám hộ {index + 1}</h2>
        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Xoá người giám hộ ${index + 1}`}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2Icon className="size-4" />
          </button>
        ) : (
          <span className="text-xs text-muted-foreground">
            Tối đa {MAX_GUARDIANS} người
          </span>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          control={control}
          name={`guardians.${index}.fullName`}
          label="Họ và tên"
          required
        />
        <TextField
          control={control}
          name={`guardians.${index}.phone`}
          label="Số điện thoại"
          required
          type="tel"
        />
        <TextField
          control={control}
          name={`guardians.${index}.address`}
          label="Địa chỉ"
          required
          placeholder="Số nhà, đường, quận"
        />
        <TextField
          control={control}
          name={`guardians.${index}.relationship`}
          label="Quan hệ"
          placeholder="Mẹ"
        />
      </div>
    </Card>
  );
}
