import type { LucideIcon } from "lucide-react";
import type { ComponentProps } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface IconInputProps extends ComponentProps<typeof Input> {
  icon: LucideIcon;
}

export function IconInput({ icon: Icon, className, ...props }: IconInputProps) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute top-1/2 left-3.25 size-4.5 -translate-y-1/2 text-placeholder" />
      <Input className={cn("pl-9.5", className)} {...props} />
    </div>
  );
}
