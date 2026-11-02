"use client";

import { Trash2Icon } from "lucide-react";
import type { Control, FieldPath } from "react-hook-form";

import { TextField } from "@/components/form/fields";
import { Card } from "@/components/ui/card";

interface GuardianFormValues {
  guardians: {
    fullName: string;
    phone: string;
    address: string;
    relationship: string;
  }[];
}

interface GuardianCardProps<T extends GuardianFormValues> {
  control: Control<T>;
  index: number;
  onRemove?: () => void;
}

export function GuardianCard<T extends GuardianFormValues>({
  control,
  index,
  onRemove,
}: GuardianCardProps<T>) {
  const fieldName = (field: keyof GuardianFormValues["guardians"][number]) =>
    `guardians.${index}.${field}` as FieldPath<T>;

  return (
    <Card className="bg-surface p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold">Người giám hộ {index + 1}</h2>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Xoá người giám hộ ${index + 1}`}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2Icon className="size-4" />
          </button>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          control={control}
          name={fieldName("fullName")}
          label="Họ và tên"
          required
        />
        <TextField
          control={control}
          name={fieldName("phone")}
          label="Số điện thoại"
          required
          type="tel"
        />
        <TextField
          control={control}
          name={fieldName("address")}
          label="Địa chỉ"
          required
          placeholder="Số nhà, đường, quận"
        />
        <TextField
          control={control}
          name={fieldName("relationship")}
          label="Quan hệ"
          placeholder="Mẹ"
        />
      </div>
    </Card>
  );
}
