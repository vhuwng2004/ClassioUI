"use client";

import { CopyIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";

interface TemporaryPasswordDialogProps {
  /** Null là đóng. Mật khẩu chỉ nằm trong state của nơi gọi, không lưu ở đâu khác. */
  credential: { email: string; temporaryPassword: string } | null;
  onClose: () => void;
}

async function copyPassword(password: string) {
  try {
    await navigator.clipboard.writeText(password);
    toast.success("Đã sao chép mật khẩu tạm.");
  } catch {
    toast.error("Không sao chép được, vui lòng chép thủ công.");
  }
}

export function TemporaryPasswordDialog({
  credential,
  onClose,
}: TemporaryPasswordDialogProps) {
  return (
    <Dialog
      open={credential !== null}
      onOpenChange={(open) => !open && onClose()}
    >
      {credential && (
        <DialogContent
          title="Mật khẩu tạm"
          description="Đây là mật khẩu mặc định của hệ thống. Hãy đưa cho người dùng."
        >
          <DialogBody>
            <p className="text-sm text-muted-foreground">
              Tài khoản:{" "}
              <span className="font-medium text-foreground">
                {credential.email}
              </span>
            </p>
            <div className="flex items-center justify-between gap-3 rounded-lg bg-surface px-4 py-3">
              <code className="font-mono text-lg font-semibold tracking-[1px] break-all">
                {credential.temporaryPassword}
              </code>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Sao chép mật khẩu tạm"
                onClick={() => copyPassword(credential.temporaryPassword)}
              >
                <CopyIcon className="size-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Người dùng phải đổi mật khẩu này ở lần đăng nhập đầu tiên.
            </p>
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button>Đóng</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}
