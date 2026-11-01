import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: ReactNode;
  /** Các nút hành động tiếp theo cho người dùng. */
  action?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
      <span className="flex size-11 items-center justify-center rounded-full bg-info text-primary">
        <Icon className="size-5" />
      </span>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && (
        <div className="flex flex-wrap justify-center gap-2 pt-1">{action}</div>
      )}
    </div>
  );
}
