"use client";

import { EyeIcon, EyeOffIcon, LockIcon } from "lucide-react";
import { useState, type ComponentProps } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PasswordInputProps extends Omit<
  ComponentProps<typeof Input>,
  "type"
> {
  /** Không tô đỏ viền khi checklist đã báo lỗi, vẫn giữ aria-invalid cho trình đọc màn hình. */
  quietInvalid?: boolean;
}

export function PasswordInput({
  quietInvalid,
  className,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const ToggleIcon = visible ? EyeOffIcon : EyeIcon;

  return (
    <div className="relative">
      <LockIcon className="pointer-events-none absolute top-1/2 left-3.25 size-4.5 -translate-y-1/2 text-placeholder" />
      <Input
        type={visible ? "text" : "password"}
        className={cn(
          "px-9.5",
          quietInvalid &&
            "aria-invalid:border-input aria-invalid:focus-visible:border-ring aria-invalid:focus-visible:ring-ring/15",
          className,
        )}
        {...props}
      />
      <button
        type="button"
        aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        aria-pressed={visible}
        onClick={() => setVisible((value) => !value)}
        className="absolute top-1/2 right-1.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-placeholder focus-ring hover:text-muted-foreground"
      >
        <ToggleIcon className="size-4.5" />
      </button>
    </div>
  );
}
