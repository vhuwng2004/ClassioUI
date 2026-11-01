"use client";

import { ChevronRightIcon, CopyIcon, RefreshCwIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/layout/confirm-dialog";
import { Button } from "@/components/ui/button";
import { useRefreshClasses } from "@/hooks/use-classroom";
import { classApi } from "@/lib/api";

import { copyJoinCode } from "./join-code";

interface JoinCodePanelProps {
  classId: number;
  code: string;
  canRotate: boolean;
}

export function JoinCodePanel({
  classId,
  code,
  canRotate,
}: JoinCodePanelProps) {
  const refreshClasses = useRefreshClasses();
  const [rotating, setRotating] = useState(false);

  const handleRotate = async () => {
    await classApi.rotateJoinCode(classId);
    await refreshClasses();
    toast.success("Đã đổi mã tham gia.");
  };

  return (
    <section className="w-full shrink-0 space-y-1.5 sm:w-64 xl:w-full">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-[13px] leading-4.5 font-semibold">Mã tham gia</h2>
        <Button
          variant="ghost"
          size="xs"
          disabled={!canRotate}
          onClick={() => setRotating(true)}
        >
          <RefreshCwIcon />
          Đổi mã
        </Button>
      </div>
      <div className="flex items-center gap-2 rounded-lg border border-dashed border-brand-panel-icon bg-info py-1.5 pr-1.5 pl-2.5">
        <span className="min-w-0 flex-1 text-[15px] leading-6 font-bold tracking-[1px] break-all text-brand-panel">
          {code}
        </span>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label={`Sao chép mã ${code}`}
          className="border-border"
          onClick={() => copyJoinCode(code)}
        >
          <CopyIcon />
        </Button>
      </div>

      <ConfirmDialog
        open={rotating}
        onOpenChange={setRotating}
        title="Đổi mã tham gia?"
        description="Mã cũ sẽ hết hiệu lực ngay lập tức."
        confirmLabel="Đổi mã"
        onConfirm={handleRotate}
      >
        <div className="flex items-center justify-center gap-3 rounded-[10px] border border-dashed border-brand-panel-icon bg-info px-4 py-2.5 text-base leading-7 font-bold">
          <span className="tracking-[1px] text-placeholder line-through">
            {code}
          </span>
          <ChevronRightIcon className="size-4.5 text-placeholder" />
          <span className="text-primary">Mã mới sau khi đổi</span>
        </div>
      </ConfirmDialog>
    </section>
  );
}
