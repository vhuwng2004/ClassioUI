import { Loader2Icon } from "lucide-react";
import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";

interface SubmitButtonProps extends ComponentProps<typeof Button> {
  pending: boolean;
}

export function SubmitButton({
  pending,
  children,
  ...props
}: SubmitButtonProps) {
  return (
    <Button type="submit" className="w-full" disabled={pending} {...props}>
      {pending && <Loader2Icon className="animate-spin" />}
      {children}
    </Button>
  );
}
