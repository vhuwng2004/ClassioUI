"use client";

import { CopyIcon } from "lucide-react";
import { toast } from "sonner";

export async function copyJoinCode(code: string) {
  try {
    await navigator.clipboard.writeText(code);
    toast.success("Đã sao chép mã tham gia.");
  } catch {
    toast.error("Không sao chép được, vui lòng chép thủ công.");
  }
}

export function JoinCode({ code }: { code: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className="font-semibold tracking-[1px]">{code}</span>
      <button
        type="button"
        aria-label={`Sao chép mã ${code}`}
        onClick={() => copyJoinCode(code)}
        className="rounded text-muted-foreground focus-ring hover:text-foreground"
      >
        <CopyIcon className="size-3.5" />
      </button>
    </span>
  );
}
