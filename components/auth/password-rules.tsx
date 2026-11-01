import { CheckIcon, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { passwordRules } from "@/lib/validations/auth";

interface PasswordRulesProps {
  value: string;
  /** Bản rút gọn của màn đặt mật khẩu mới: nhãn ngắn, luật phụ chỉ hiện khi bị vi phạm. */
  compact?: boolean;
}

export function PasswordRules({ value, compact }: PasswordRulesProps) {
  const rules = compact
    ? passwordRules.filter((rule) => !rule.secondary || !rule.test(value))
    : passwordRules;

  return (
    <ul className="-mt-0.5 space-y-1 text-xs">
      {rules.map((rule) => {
        const passed = rule.test(value);
        const Icon = passed || !value ? CheckIcon : XIcon;
        return (
          <li
            key={rule.label}
            className={cn(
              "flex items-center gap-1.5",
              !value
                ? "text-muted-foreground"
                : passed
                  ? "text-success"
                  : "text-destructive",
            )}
          >
            <Icon className="size-3.5 shrink-0" />
            {(compact && rule.shortLabel) || rule.label}
          </li>
        );
      })}
    </ul>
  );
}
