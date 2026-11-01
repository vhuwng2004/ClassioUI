import { GraduationCapIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  /** Màu ô logo, mặc định theo màu chữ. */
  markClassName?: string;
}

export function BrandLogo({ className, markClassName }: BrandLogoProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 text-lg leading-6.5 font-bold",
        className,
      )}
    >
      <span
        className={cn(
          "flex size-8 items-center justify-center rounded-lg bg-current",
          markClassName,
        )}
      >
        <GraduationCapIcon className="size-4.5 text-background" />
      </span>
      Classio
    </div>
  );
}
