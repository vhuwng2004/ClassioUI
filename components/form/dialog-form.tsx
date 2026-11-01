import type { ComponentProps, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { DialogBody, DialogClose, DialogFooter } from "@/components/ui/dialog";

import { SubmitButton } from "./submit-button";

interface DialogFormProps {
  onSubmit: ComponentProps<"form">["onSubmit"];
  pending: boolean;
  submitLabel: string;
  children: ReactNode;
}

/** Thân form đặt trong `DialogContent`, luôn có nút Hủy và nút gửi ở chân. */
export function DialogForm({
  onSubmit,
  pending,
  submitLabel,
  children,
}: DialogFormProps) {
  return (
    <form noValidate onSubmit={onSubmit}>
      <DialogBody>{children}</DialogBody>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Hủy
          </Button>
        </DialogClose>
        <SubmitButton pending={pending} className="w-auto">
          {submitLabel}
        </SubmitButton>
      </DialogFooter>
    </form>
  );
}
